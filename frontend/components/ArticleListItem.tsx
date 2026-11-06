import Link from "next/link";
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
  return diffDay < 7 ? `${diffDay}d ago` : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'%3E%3Crect fill='%23e0dbd3' width='320' height='240'/%3E%3C/svg%3E";

export default function ArticleListItem({ article }: { article: Article }) {
  const urlParam = article.slug || article.id;
  const linkPath =
    article.category === "Movies" ? `/movies/${urlParam}` : `/article/${urlParam}`;

  const preview = (article.detailed_summary || article.ai_summary || "").slice(0, 160);

  return (
    <div className="article-list-item">
      {article.image_url && (
        <Link href={linkPath} className="article-list-item-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image_url || PLACEHOLDER_IMAGE}
            alt={article.original_headline || "Article"}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </Link>
      )}
      <div className="article-list-item-body">
        <div className="article-list-item-meta">
          {article.category && (
            <span className="category-badge" data-category={article.category}>
              {article.category}
            </span>
          )}
          <span className="article-source">{article.source_domain}</span>
          <span className="article-time">{formatTime(article.published_at)}</span>
        </div>
        <h3 className="article-list-item-headline">
          <Link href={linkPath}>{article.original_headline}</Link>
        </h3>
        {preview && <p className="article-list-item-preview">{preview}</p>}
      </div>
    </div>
  );
}

