import type { Metadata } from "next";
import { Suspense } from "react";
import type { Article, ArticleListResponse, Category } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import CategoryBar from "@/components/CategoryBar";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { sanityClient, urlFor } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "GoFact — AI-Summarized Stock Market News",
  description:
    "Real-time AI-summarized stock market news. IPO, Nifty, Sensex, crypto, commodities — curated daily.",
  alternates: { canonical: "https://gofact.in" },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";

const PER_PAGE = 18;

async function fetchSanityMovies(): Promise<Article[]> {
  try {
    const moviesQuery = `*[_type == "movieNews"] | order(_createdAt desc) {
      _id, title, slug, poster, "summaryPreview": pt::text(financialNews), _createdAt
    }`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moviesData = await sanityClient.fetch(moviesQuery);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return moviesData.map((m: any) => ({
      id: m.slug?.current || m._id,
      original_headline: m.title,
      original_url: `/movies/${m.slug?.current || m._id}`,
      source_domain: "GoFact Movies",
      ai_summary: m.summaryPreview ? m.summaryPreview.substring(0, 150) + "..." : null,
      market_impact: null,
      published_at: m._createdAt,
      created_at: m._createdAt,
      image_url: m.poster ? urlFor(m.poster).width(800).url() : null,
      image_source: null,
      category: "Movies",
      tags: ["Movies"],
      detailed_summary: null,
      additional_sources: null,
      slug: m.slug?.current,
    }));
  } catch (err) {
    console.error("Sanity fetch error:", err);
    return [];
  }
}

async function fetchArticles(
  page: number,
  category?: string,
  q?: string
): Promise<ArticleListResponse> {
  if (category === "Movies") {
    const movies = await fetchSanityMovies();
    return {
      articles: movies,
      total: movies.length,
      page,
      per_page: PER_PAGE,
    };
  }

  try {
    let path = `${API_BASE}/api/articles?page=${page}&per_page=${PER_PAGE}`;
    if (category && category !== "All") {
      path += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(path, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("API error");
    const data: ArticleListResponse = await res.json();

    let combined = data.articles;
    let total = data.total;

    // When viewing "All" and on page 1, interleave recent movies
    if ((!category || category === "All") && !q) {
      const movies = await fetchSanityMovies();
      if (movies.length > 0 && combined.length > 0) {
        const oldestArticleDate = new Date(
          combined[combined.length - 1].published_at || combined[combined.length - 1].created_at
        ).getTime();

        const moviesForPage = movies.filter((m) => {
          const movieDate = new Date(m.published_at || m.created_at).getTime();
          return page === 1 ? true : movieDate >= oldestArticleDate;
        });

        combined = [...moviesForPage, ...combined].sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at).getTime();
          const dateB = new Date(b.published_at || b.created_at).getTime();
          return dateB - dateA;
        });
        total += movies.length;
      }
    }

    if (q) {
      const ql = q.toLowerCase();
      const filtered = combined.filter(
        (a) =>
          a.original_headline?.toLowerCase().includes(ql) ||
          a.ai_summary?.toLowerCase().includes(ql) ||
          a.detailed_summary?.toLowerCase().includes(ql)
      );
      return { ...data, articles: filtered, total: filtered.length };
    }

    return { ...data, articles: combined, total };
  } catch {
    return { articles: [], total: 0, page, per_page: PER_PAGE };
  }
}

interface HomeProps {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = (params.category as Category) || "All";
  const q = params.q || "";

  const data = await fetchArticles(page, category, q);
  const articles = data.articles;
  const total = data.total;
  const totalPages = Math.ceil(total / PER_PAGE);

  const withImages: Article[] = articles.filter((a) => a.image_url);
  const withoutImages: Article[] = articles.filter((a) => !a.image_url);

  return (
    <>
      <h1 className="page-heading">Stock Market News</h1>
      <p className="page-subheading">
        AI-summarized headlines — updated daily
      </p>

      <Suspense fallback={null}>
        <SearchBar initialQuery={q} />
      </Suspense>

      <Suspense fallback={null}>
        <CategoryBar active={category} />
      </Suspense>

      {articles.length === 0 ? (
        <div className="empty-state">
          {q
            ? `No results for "${q}"`
            : "No articles found. The scraper may still be warming up."}
        </div>
      ) : (
        <>
          {/* Image grid */}
          {withImages.length > 0 && (
            <div className="news-grid">
              {withImages.map((article) => (
                <div key={article.id} className="news-grid-item">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}

          {/* List items (no image) */}
          {withoutImages.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
              {withoutImages.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 ? (
                <Link
                  href={`/?page=${page - 1}${category !== "All" ? `&category=${encodeURIComponent(category)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="pagination-btn"
                >
                  ← Prev
                </Link>
              ) : (
                <button className="pagination-btn" disabled>← Prev</button>
              )}

              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={`/?page=${page + 1}${category !== "All" ? `&category=${encodeURIComponent(category)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="pagination-btn"
                >
                  Next →
                </Link>
              ) : (
                <button className="pagination-btn" disabled>Next →</button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
