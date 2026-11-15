import type { Metadata } from "next";
import { Suspense } from "react";
import type { Article, Category, FeedItem } from "@/types";
import {
  feedItemToArticle,
  MAJOR_CATEGORIES,
  normalizeCategory,
} from "@/types";
import ArticleCard from "@/components/ArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import CategoryBar from "@/components/CategoryBar";
import SearchBar from "@/components/SearchBar";
import PaginationControls from "@/components/PaginationControls";
import { sanityClient, urlFor } from "@/lib/sanity";
import { fetchArticles } from "@/lib/api";

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

// ─── Shared helpers ─────────────────────────────────────────

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

/** Normalize a raw Sanity movie document into a FeedItem. */
function normalizeSanityMovie(m: any): FeedItem {
  return {
    id: m.slug?.current || m._id,
    title: m.title,
    slug: m.slug?.current || m._id,
    publishedAt: m._createdAt || new Date().toISOString(),
    imageUrl: m.poster ? urlFor(m.poster).width(800).url() : null,
    category: "Movies",
    type: "movie",
    aiSummary: m.summaryPreview
      ? m.summaryPreview.substring(0, 150) + "..."
      : null,
    detailedSummary: null,
    sourceDomain: "GoFact Movies",
    imageSource: null,
    tags: ["Movies"],
    originalUrl: `/movies/${m.slug?.current || m._id}`,
  };
}

/** Normalize a FastAPI Article into a FeedItem. */
function normalizeArticle(a: Article): FeedItem {
  const cat = normalizeCategory(a.category);
  return {
    id: a.id,
    title: a.original_headline,
    slug: a.slug || a.id,
    publishedAt: a.published_at || a.created_at || new Date().toISOString(),
    imageUrl: a.image_url,
    category: cat,
    type: "article",
    aiSummary: a.ai_summary,
    detailedSummary: a.detailed_summary,
    sourceDomain: a.source_domain,
    imageSource: a.image_source,
    tags: a.tags || [],
    originalUrl: a.original_url,
    additionalSources: a.additional_sources,
  };
}

/** Sort FeedItems by publishedAt descending (newest first). */
function chronoSort(items: FeedItem[]): FeedItem[] {
  return items.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

async function fetchActiveCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("API error");
    const data: string[] = await res.json();
    const valid = data.filter((c) =>
      MAJOR_CATEGORIES.includes(c as Category)
    ) as Category[];
    if (!valid.includes("Movies")) valid.push("Movies");
    return ["All", ...valid];
  } catch {
    return ["All", ...MAJOR_CATEGORIES];
  }
}

// ─── Page component ─────────────────────────────────────────

interface HomeProps {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = (params.category as Category) || "All";
  const q = params.q || "";

  // 1. Fetch active categories for the filter bar (only non-empty categories)
  const dynamicCategories = await fetchActiveCategories();

  let currentPageItems: FeedItem[] = [];
  let total = 0;
  let total_pages = 1;

  if (category === "Movies") {
    // ── Movies-only view: paginate Sanity movies client-side ──
    const allMovies = await fetchSanityMovies();
    const normalizedMovies = allMovies.map(normalizeSanityMovie);

    total = normalizedMovies.length;
    total_pages = Math.max(1, Math.ceil(total / PER_PAGE));
    const startIndex = (page - 1) * PER_PAGE;
    currentPageItems = normalizedMovies.slice(startIndex, startIndex + PER_PAGE);
  } else if (category === "All") {
    // ── Unified "All" feed: merge both sources, sort globally, paginate client-side ──
    const [paginated, rawMovies] = await Promise.all([
      fetchArticles(1, 500), // fetch all articles in one shot for unified sorting
      fetchSanityMovies(),
    ]);

    const normalizedArticles = (paginated.items || []).map(normalizeArticle);
    const normalizedMovies = rawMovies.map(normalizeSanityMovie);

    // Single unified timeline — every item treated equally by timestamp
    const unified = chronoSort([...normalizedArticles, ...normalizedMovies]);

    total = unified.length;
    total_pages = Math.max(1, Math.ceil(total / PER_PAGE));
    const startIndex = (page - 1) * PER_PAGE;
    currentPageItems = unified.slice(startIndex, startIndex + PER_PAGE);
  } else {
    // ── Category-filtered view: server-side pagination from FastAPI only ──
    const paginated = await fetchArticles(page, PER_PAGE, category);

    currentPageItems = (paginated.items || []).map(normalizeArticle);
    total = paginated.total;
    total_pages = Math.max(1, paginated.total_pages);
  }

  // Filter by search query if provided
  if (q) {
    const ql = q.toLowerCase();
    currentPageItems = currentPageItems.filter(
      (item) =>
        item.title.toLowerCase().includes(ql) ||
        item.aiSummary?.toLowerCase().includes(ql) ||
        item.detailedSummary?.toLowerCase().includes(ql)
    );
  }

  const queryObj: Record<string, string> = {};
  if (params.page) queryObj.page = params.page;
  if (params.category) queryObj.category = params.category;
  if (params.q) queryObj.q = params.q;
  const fromQuery = new URLSearchParams(queryObj).toString();

  // Page-Level Image Sorting Algorithm:
  // Anchors items with images to top, without images to bottom, strictly chronological within groups
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
        <CategoryBar active={category} categories={dynamicCategories} />
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

          {total_pages > 1 && (
            <Suspense fallback={null}>
              <PaginationControls
                page={page}
                total_pages={total_pages}
                totalPages={total_pages}
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
