import type { Metadata } from "next";
import { Suspense } from "react";
import { sanityClient, urlFor } from "@/lib/sanity";
import type { FeedItem } from "@/types";
import { feedItemToArticle } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import CategoryBar from "@/components/CategoryBar";
import PaginationControls from "@/components/PaginationControls";

// Netlify & Edge Cache Alignment: 24-hour static cache revalidation
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Movies | GoFact",
  description: "Entertainment and movie news summaries.",
  alternates: { canonical: "https://gofact.in/movies" },
};

const QUERY = `*[_type == "movieNews"] | order(_createdAt desc) {
  _id, title, slug, poster, telegramLink, "summaryPreview": pt::text(financialNews), _createdAt
}`;

const PER_PAGE = 18;

interface MoviesFeedPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function MoviesFeedPage({ searchParams }: MoviesFeedPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const page = Math.max(1, parseInt(params?.page || "1", 10));

  let rawMovies: any[] = [];
  try {
    rawMovies = (await sanityClient.fetch(QUERY, {}, { next: { revalidate: 86400 } })) || [];
  } catch (err) {
    console.error("Failed to fetch movies from Sanity", err);
  }

  const movieItems: FeedItem[] = rawMovies.map((m: any) => ({
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

  // Global timestamp sort descending
  movieItems.sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    return timeB - timeA;
  });

  const total = movieItems.length;
  const totalPages = Math.ceil(total / PER_PAGE);

  /**
   * Phase 4 & 5: Page-Level Image Sorting Algorithm for Movies
   * 1. Slicing happens first from the global timeline.
   * 2. Image Anchoring: Shift items with valid imageUrl to the top,
   *    and items without image to the bottom.
   * 3. Preserve Chronology within Groups: strictly sorted by publishedAt descending.
   */
  const startIndex = (page - 1) * PER_PAGE;
  const endIndex = startIndex + PER_PAGE;
  const currentPageItems = movieItems.slice(startIndex, endIndex);

  const withImage = currentPageItems
    .filter((item) => Boolean(item.imageUrl))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const withoutImage = currentPageItems
    .filter((item) => !item.imageUrl)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const fromQuery = page > 1 ? `page=${page}` : "";

  return (
    <section className="movies-feed">
      <h1 className="page-heading">Movies</h1>
      <p className="page-subheading">Entertainment & movie insights</p>

      <Suspense fallback={null}>
        <CategoryBar active="Movies" categories={["All", "Movies"]} />
      </Suspense>

      {currentPageItems.length === 0 ? (
        <p className="empty-state">No entries yet.</p>
      ) : (
        <>
          {/* Top section: Articles with images (Dynamic Grid, Anchored to Top) */}
          {withImage.length > 0 && (
            <div className="news-grid-dynamic">
              {withImage.map((item, idx) => {
                const article = feedItemToArticle(item);
                const rowIdx = Math.floor(idx / 3);
                const itemsInThisRow = Math.min(3, withImage.length - rowIdx * 3);
                let span = 2;
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

          {/* Bottom section: Articles without images (Anchored to Bottom) */}
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
                category="Movies"
                q=""
              />
            </Suspense>
          )}
        </>
      )}
    </section>
  );
}
