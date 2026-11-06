import type { Metadata } from "next";
import Link from "next/link";
import type { Article } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import { notFound } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/api/articles/${slug}`, {
      next: { revalidate: 3600 }, // cache 1h — article content doesn't change
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch {
    return null;
  }
}

async function getRelated(slug: string): Promise<Article[]> {
  try {
    const res = await fetch(`${API_BASE}/api/articles/${slug}/related`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Dynamic metadata — Googlebot sees this in the initial HTML
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };

  const description =
    (article.detailed_summary || article.ai_summary || "").slice(0, 160);
  const canonicalUrl = `https://gofact.in/article/${article.slug || article.id}`;

  return {
    title: article.original_headline,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: article.original_headline,
      description,
      url: canonicalUrl,
      type: "article",
      images: article.image_url
        ? [{ url: article.image_url, alt: article.original_headline }]
        : [],
      publishedTime: article.published_at || article.created_at,
      authors: ["GoFact"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.original_headline,
      description,
      images: article.image_url ? [article.image_url] : [],
    },
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getArticle(slug),
    getRelated(slug),
  ]);

  if (!article) notFound();

  const paragraphs = (article.detailed_summary || article.ai_summary || "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const tags = article.tags || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.original_headline,
    image: article.image_url ? [article.image_url] : [],
    datePublished: article.published_at || article.created_at,
    dateModified: article.created_at,
    author: [{ "@type": "Organization", name: "GoFact", url: "https://gofact.in" }],
    publisher: {
      "@type": "Organization",
      name: "GoFact",
      logo: { "@type": "ImageObject", url: "https://gofact.in/favicon.jpg" },
    },
    description: article.detailed_summary || article.ai_summary,
    url: `https://gofact.in/article/${article.slug || article.id}`,
  };

  const backHref =
    article.category ? `/?category=${encodeURIComponent(article.category)}` : "/";

  return (
    <>
      {/* JSON-LD structured data for Googlebot */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="article-detail-page">
        <Link href={backHref} className="back-link">
          ← Back to feed
        </Link>

        {article.image_url && (
          <div className="article-hero-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image_url}
              alt={article.original_headline || "Article image"}
            />
            {article.image_source && (
              <div
                style={{ fontSize: "0.8rem", color: "#666", marginTop: "4px" }}
              >
                Image source: {article.image_source}
              </div>
            )}
          </div>
        )}

        <div className="article-detail-meta">
          {article.category && (
            <span
              className="category-badge"
              data-category={article.category}
            >
              {article.category}
            </span>
          )}
          <span className="article-source">{article.source_domain}</span>
          <span className="article-time">{formatDate(article.published_at)}</span>
        </div>

        <h1 className="article-detail-headline">{article.original_headline}</h1>

        {paragraphs.length > 0 && (
          <div className="article-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="article-tags">
            <span
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginRight: "8px",
                fontWeight: 600,
              }}
            >
              Related Tickers:
            </span>
            {tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="article-outlink">
          <h3>Sources:</h3>
          <ul>
            <li>
              <a href={article.original_url} target="_blank" rel="noopener noreferrer">
                {article.source_domain}
              </a>
            </li>
            {article.additional_sources?.map((src, i) => (
              <li key={i}>
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.domain}
                </a>{" "}
                — {src.headline}
              </li>
            ))}
          </ul>
        </div>

        {/* Related news */}
        {related.length > 0 && (
          <div className="related-section">
            <h3 className="related-heading">Related News</h3>

            {related.filter((r) => r.image_url).length > 0 && (
              <div className="news-grid-dynamic" style={{ marginBottom: "32px" }}>
                {related
                  .filter((r) => r.image_url)
                  .map((r, idx, arr) => {
                    const rowIdx = Math.floor(idx / 3);
                    const itemsInRow = Math.min(3, arr.length - rowIdx * 3);
                    const span = itemsInRow === 1 ? 6 : itemsInRow === 2 ? 3 : 2;
                    return (
                      <div
                        key={r.id}
                        className="news-grid-item-dynamic"
                        style={{ "--dynamic-span": span } as React.CSSProperties}
                      >
                        <ArticleCard article={r} />
                      </div>
                    );
                  })}
              </div>
            )}

            {related.filter((r) => !r.image_url).length > 0 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {related
                  .filter((r) => !r.image_url)
                  .map((r) => (
                    <ArticleListItem key={r.id} article={r} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

