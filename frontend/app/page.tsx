import type { Metadata } from "next";
import { Suspense } from "react";
import type { Article, ArticleListResponse, Category } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import CategoryBar from "@/components/CategoryBar";
import SearchBar from "@/components/SearchBar";
import PaginationControls from "@/components/PaginationControls";
import Link from "next/link";
import { sanityClient, urlFor } from "@/lib/sanity";

export const revalidate = 60; // Cache on Vercel Global Edge CDN for 60s (Instant 10ms loads)

export const metadata: Metadata = {
  title: "GoFact | Global Financial Intelligence & Real-Time Market News",
  description:
    "Aggregated and verified global market data, stock analysis, and economic insights distilled for modern investors.",
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
    return (moviesData || []).map((m: any) => ({
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
  } catch {
    return [];
  }
}

async function fetchArticlesFromBackend(
  page: number,
  category?: string
): Promise<ArticleListResponse> {
  try {
    let path = `${API_BASE}/api/articles?page=${page}&per_page=${PER_PAGE}`;
    if (category && category !== "All") {
      path += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(path, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000), // 6-second timeout prevents slow blocking
    });
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch {
    return { articles: [], total: 0, page, per_page: PER_PAGE };
  }
}

async function getFeedData(page: number, category: Category, q: string) {
  if (category === "Movies") {
    const movies = await fetchSanityMovies();
    return {
      articles: movies,
      total: movies.length,
    };
  }

  // Fetch backend articles and sanity movies in parallel
  const [data, movies] = await Promise.all([
    fetchArticlesFromBackend(page, category),
    category === "All" && !q ? fetchSanityMovies() : Promise.resolve([]),
  ]);

  let combined = data.articles;
  let total = data.total;

  if (category === "All" && !q && movies.length > 0 && combined.length > 0) {
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

  if (q) {
    const ql = q.toLowerCase();
    const filtered = combined.filter(
      (a) =>
        a.original_headline?.toLowerCase().includes(ql) ||
        a.ai_summary?.toLowerCase().includes(ql) ||
        a.detailed_summary?.toLowerCase().includes(ql)
    );
    return { articles: filtered, total: filtered.length };
  }

  return { articles: combined, total };
}

interface HomeProps {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = (params.category as Category) || "All";
  const q = params.q || "";

  const { articles, total } = await getFeedData(page, category, q);
  const totalPages = Math.ceil(total / PER_PAGE);

  const withImage = articles.filter((a) => a.image_url);
  const withoutImage = articles.filter((a) => !a.image_url);

  return (
    <>
      <h1 className="page-heading">Global Financial Intelligence</h1>
      <p className="page-subheading">
        Raw market data distilled into actionable insights. Powered by a resilient 17-model AI chain, stripping the noise from global financial coverage.
      </p>

      <Suspense fallback={null}>
        <SearchBar initialQuery={q} />
      </Suspense>

      <Suspense fallback={null}>
        <CategoryBar active={category} />
      </Suspense>

      {q && (
        <p className="search-result-info">
          {total} result{total !== 1 ? "s" : ""} for &quot;{q}&quot;
        </p>
      )}

      {articles.length === 0 ? (
        <div className="empty-state">
          <p>No articles found.</p>
          <p>
            {q
              ? "Try a different search term."
              : "The scraper runs on startup and every 60 minutes. Check back shortly."}
          </p>
        </div>
      ) : (
        <>
          {/* Top section: Articles with images (Dynamic Grid) */}
          {withImage.length > 0 && (
            <div className="news-grid-dynamic">
              {withImage.map((article, idx) => {
                const rowIdx = Math.floor(idx / 3);
                const itemsInThisRow = Math.min(3, withImage.length - rowIdx * 3);
                let span = 2; // defaults to 3 per row (6/3=2)
                if (itemsInThisRow === 1) span = 6;
                else if (itemsInThisRow === 2) span = 3;

                return (
                  <div
                    key={article.id}
                    className="news-grid-item-dynamic"
                    style={{ "--dynamic-span": span } as React.CSSProperties}
                  >
                    <ArticleCard article={article} priority={idx === 0} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom section: Articles without images (List view) */}
          {withoutImage.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {withoutImage.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Suspense fallback={null}>
              <PaginationControls
                page={page}
                totalPages={totalPages}
                category={category}
                q={q}
              />
            </Suspense>
          )}
        </>
      )}
    </>
  );
}
