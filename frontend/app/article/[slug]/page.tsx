import type { Metadata } from "next";
import Link from "next/link";
import type { Article } from "@/types";
import ArticleCard from "@/components/ArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import { notFound } from "next/navigation";

export const revalidate = 300; // Cache on Edge CDN for 5 min (instant 10ms loads)

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/api/articles/${slug}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
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
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found | GoFact" };

  const description =
    article.detailed_summary?.slice(0, 155) ||
    article.ai_summary?.slice(0, 155) ||
    article.original_headline;
  const canonicalUrl = `https://gofact.in/article/${article.slug || article.id}`;

  return {
    title: `${article.original_headline} | GoFact`,
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
  if (!dateStr) return "Unknown date";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function splitIntoParagraphs(text: string): string[] {
  if (text.includes("\n\n")) {
    return text.split("\n\n").filter(Boolean);
  }
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= 3) return [text];
  const chunkSize = Math.ceil(sentences.length / 3);
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    paragraphs.push(sentences.slice(i, i + chunkSize).join(" ").trim());
  }
  return paragraphs;
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

  const summaryText = article.detailed_summary || article.ai_summary || "";
  const paragraphs = splitIntoParagraphs(summaryText);
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

  // Prevent script tag injection XSS
  const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  const backHref = article.category
    ? `/?category=${encodeURIComponent(article.category)}`
    : "/";

  return (
    <div className="article-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />

      <Link href={backHref} className="back-link">
        ← Back to feed
      </Link>

      {/* Hero image */}
      {article.image_url && (
        <div className="article-hero-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url}
            alt={article.original_headline || "Article image"}
          />
          {article.image_source && (
            <div
              className="image-caption"
              style={{ fontSize: "0.8rem", color: "#666", marginTop: "4px" }}
            >
              Image source: {article.image_source}
            </div>
          )}
        </div>
      )}

      <div className="article-detail-meta">
        {article.category && (
          <span className="category-badge">{article.category}</span>
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

      {/* Tag pills */}
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
            <a
              href={article.original_url}
              target="_blank"
              rel="noopener noreferrer"
            >
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

          {/* Images */}
          {related.filter((r) => r.image_url).length > 0 && (
            <div className="news-grid-dynamic" style={{ marginBottom: "32px" }}>
              {related
                .filter((r) => r.image_url)
                .map((r, idx, arr) => {
                  const rowIdx = Math.floor(idx / 3);
                  const itemsInThisRow = Math.min(3, arr.length - rowIdx * 3);
                  const span = itemsInThisRow === 1 ? 6 : itemsInThisRow === 2 ? 3 : 2;

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

          {/* List items */}
          {related.filter((r) => !r.image_url).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
  );
}
