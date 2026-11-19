import type { MetadataRoute } from "next";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";

export const revalidate = 86400; // 24-hour cache alignment

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://gofact.in", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://gofact.in/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://gofact.in/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://gofact.in/privacy-policy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://gofact.in/terms-of-service", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://gofact.in/disclaimer", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    // Attempt lightweight sitemap endpoint first (returns only slug, id, created_at)
    let res = await fetch(`${API_BASE}/api/articles-sitemap`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });

    // Fallback if articles-sitemap is not yet deployed on backend
    if (!res.ok) {
      res = await fetch(`${API_BASE}/api/articles?page=1&per_page=100`, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(10000),
      });
    }

    if (res.ok) {
      const data = await res.json();
      const articles: Array<{ slug?: string; id: string; created_at: string }> =
        Array.isArray(data) ? data : data.items || data.articles || [];

      articleEntries = articles
        .filter((a) => a.slug || a.id)
        .map((a) => ({
          url: `https://gofact.in/article/${a.slug || a.id}`,
          lastModified: new Date(a.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
    }
  } catch (err) {
    console.error("Failed to load articles for sitemap", err);
  }

  return [...staticPages, ...articleEntries];
}
