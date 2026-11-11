import type { Metadata } from "next";
import { Suspense } from "react";
import type { Article, Category, FeedItem } from "@/types";
import { feedItemToArticle } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import CategoryBar from "@/components/CategoryBar";
import SearchBar from "@/components/SearchBar";
import PaginationControls from "@/components/PaginationControls";
import { sanityClient, urlFor } from "@/lib/sanity";

// Netlify & Edge Cache Alignment: 24-hour static cache revalidation
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "GoFact | Global Financial Intelligence & Real-Time Market News",
  description:
    "Aggregated and verified global market data, stock analysis, and economic insights distilled for modern investors.",
  alternates: { canonical: "https://gofact.in" },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";

const PER_PAGE = 18;

async function fetchSanityMovies(): Promise<any[]> {
  try {
    const moviesQuery = `*[_type == "movieNews"] | order(_createdAt desc) {
      _id, title, slug, poster, "summaryPreview": pt::text(financialNews), _createdAt
    }`;
    const moviesData = await sanityClient.fetch(
      moviesQuery,
      {},
      { next: { revalidate: 86400 } }
    );
    return moviesData || [];
  } catch {
    return [];
  }
}

async function fetchArticlesFromBackend(): Promise<Article[]> {
  try {
    const path = `${API_BASE}/api/articles?page=1&per_page=100`;
    const res = await fetch(path, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.articles || [];
  } catch {
    return [];
  }
}

/**
 * Phase 3: Unified Data Fetching & Global Timeline
 * Concurrently fetches from PostgreSQL (FastAPI) and Sanity CMS,
 * normalizes into the FeedItem interface, and strictly sorts by publishedAt descending.
 */
async function getUnifiedFeed(): Promise<FeedItem[]> {
  const [articles, movies] = await Promise.all([
    fetchArticlesFromBackend(),
    fetchSanityMovies(),
  ]);

  const normalizedArticles: FeedItem[] = articles.map((a) => ({
    id: a.id,
    title: a.original_headline,
    slug: a.slug || a.id,
    publishedAt: a.published_at || a.created_at || new Date().toISOString(),
    imageUrl: a.image_url,
    category: a.category || "General",
    type: "article",
    aiSummary: a.ai_summary,
    detailedSummary: a.detailed_summary,
    sourceDomain: a.source_domain,
    imageSource: a.image_source,
    tags: a.tags || [],
    originalUrl: a.original_url,
    additionalSources: a.additional_sources,
  }));

  const normalizedMovies: FeedItem[] = movies.map((m: any) => ({
    id: m.slug?.current || m._id,
    title: m.title,
    slug: m.slug?.current || m._id,
    publishedAt: m._createdAt || new Date().toISOString(),
    imageUrl: m.poster ? urlFor(m.poster).width(800).url() : null,
    category: "Movies",
    type: "movie",
    aiSummary: m.summaryPreview ? m.summaryPreview.substring(0, 150) + "..." : null,
    detailedSummary: null,
    sourceDomain: "GoFact Movies",
    imageSource: null,
    tags: ["Movies"],
    originalUrl: `/movies/${m.slug?.current || m._id}`,
  }));

  // Global Timestamp Sort strictly by publishedAt in descending order (newest first)
  const combined = [...normalizedArticles, ...normalizedMovies];
  combined.sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    return timeB - timeA;
  });

  return combined;
}

interface HomeProps {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = (params.category as Category) || "All";
  const q = params.q || "";

  // 1. Get the globally sorted timeline
  const unifiedFeed = await getUnifiedFeed();

  // 2. Apply category filtering
  let filtered = unifiedFeed;
  if (category === "Movies") {
    filtered = filtered.filter((item) => item.type === "movie");
  } else if (category !== "All") {
    filtered = filtered.filter(
      (item) =>
        item.type === "article" &&
        (item.category === category || item.tags?.includes(category))
    );
  }

  // 3. Apply search query filtering if requested
  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(ql) ||
        item.aiSummary?.toLowerCase().includes(ql) ||
        item.detailedSummary?.toLowerCase().includes(ql)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE);

  const queryObj: Record<string, string> = {};
  if (params.page) queryObj.page = params.page;
  if (params.category) queryObj.category = params.category;
  if (params.q) queryObj.q = params.q;
  const fromQuery = new URLSearchParams(queryObj).toString();

  /**
   * Phase 4: Page-Level Image Sorting Algorithm
   * 1. Slicing happens FIRST from the global chronological timeline
   *    (prevents old articles from jumping to page 1).
   * 2. Image Anchoring: Shift items with valid imageUrl to the top,
   *    and items without image to the bottom.
   * 3. Preserve Chronology within Groups: Both groups strictly sorted by publishedAt descending.
   */
  const startIndex = (page - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  const currentPageItems = filtered.slice(startIndex, endIndex);

  const withImage = currentPageItems
    .filter((item) => Boolean(item.imageUrl))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const withoutImage = currentPageItems
    .filter((item) => !item.imageUrl)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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

      {currentPageItems.length === 0 ? (
        <div className="empty-state">
          <p>No articles found.</p>
          <p>
            {q
              ? "Try a different search term."
              : "The scraper runs once daily. Check back shortly for the latest digest."}
          </p>
        </div>
      ) : (
        <>
          {/* Top section: Articles with images (Anchored to Top, strictly chronological) */}
          {withImage.length > 0 && (
            <div className="news-grid-dynamic">
              {withImage.map((item, idx) => {
                const article = feedItemToArticle(item);
                const rowIdx = Math.floor(idx / 3);
                const itemsInThisRow = Math.min(3, withImage.length - rowIdx * 3);
                let span = 2; // defaults to 3 per row (6/3=2)
                if (itemsInThisRow === 1) span = 6;
                else if (itemsInThisRow === 2) span = 3;

                return (
                  <div
                    key={item.id}
                    className="news-grid-item-dynamic"
                    style={{ "--dynamic-span": span } as React.CSSProperties}
                  >
                    <ArticleCard
                      article={article}
                      priority={idx === 0}
                      fromQuery={fromQuery}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom section: Articles without images (Anchored to Bottom, strictly chronological) */}
          {withoutImage.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {withoutImage.map((item) => (
                <ArticleListItem
                  key={item.id}
                  article={feedItemToArticle(item)}
                  fromQuery={fromQuery}
                />
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
