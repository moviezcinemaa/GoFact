import type { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: "https://gofact.in", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://gofact.in/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://gofact.in/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://gofact.in/privacy-policy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://gofact.in/terms-of-service", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://gofact.in/disclaimer", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://gofact.in/movies", lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${API_BASE}/api/articles?page=1&per_page=200`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const articles: Array<{ slug?: string; id: string; created_at: string }> =
        data.articles || [];

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

  let movieEntries: MetadataRoute.Sitemap = [];
  try {
    const movies = await sanityClient.fetch(
      `*[_type == "movieNews"]{ "slug": slug.current, _createdAt }`
    );
    if (movies && Array.isArray(movies)) {
      movieEntries = movies
        .filter((m: { slug?: string }) => m.slug)
        .map((m: { slug: string; _createdAt: string }) => ({
          url: `https://gofact.in/movies/${m.slug}`,
          lastModified: new Date(m._createdAt || new Date()),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch (err) {
    console.error("Failed to load movies for sitemap", err);
  }

  return [...staticPages, ...articleEntries, ...movieEntries];
}
