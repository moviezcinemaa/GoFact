"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/types";

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect fill='%23e0dbd3' width='640' height='360'/%3E%3Ctext fill='%23545454' font-family='Helvetica' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
  fromQuery?: string;
}

export default function ArticleCard({
  article,
  priority = false,
  fromQuery,
}: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);
  const summaryPreview = article.detailed_summary || article.ai_summary || "";
  const truncated =
    summaryPreview.length > 120
      ? summaryPreview.slice(0, 120).trimEnd() + "..."
      : summaryPreview;

  const urlParam = article.slug || article.id;
  const linkPath =
    article.category === "Movies"
      ? `/movies/${urlParam}`
      : `/article/${urlParam}`;

  const href = fromQuery
    ? `${linkPath}?from=${encodeURIComponent(fromQuery)}`
    : linkPath;

  const imageSrc =
    imgError || !article.image_url ? PLACEHOLDER_IMAGE : article.image_url;

  return (
    <div className="news-card">
      <Link href={href} className="news-card-image-link">
        <div
          className="news-card-image"
          style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}
        >
          <Image
            src={imageSrc}
            alt={article.original_headline || "Article thumbnail"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
            style={{ objectFit: "cover" }}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            quality={65}
            onError={() => setImgError(true)}
            unoptimized={imageSrc.startsWith("data:")}
          />
        </div>
      </Link>
      <div className="news-card-body">
        <div className="news-card-meta">
          {article.category && (
            <span className="category-badge">{article.category}</span>
          )}
          <span className="article-source">{article.source_domain}</span>
          <span className="article-time" suppressHydrationWarning>
            {formatTime(article.published_at)}
          </span>
        </div>
        <h2 className="news-card-headline">
          <Link href={href}>{article.original_headline}</Link>
        </h2>
        {truncated && <p className="news-card-preview">{truncated}</p>}
      </div>
    </div>
  );
}
