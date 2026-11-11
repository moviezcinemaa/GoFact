export interface Article {
  id: string;
  original_headline: string;
  original_url: string;
  source_domain: string;
  ai_summary: string | null;
  market_impact: string | null;
  published_at: string | null;
  created_at: string;
  image_url: string | null;
  image_source: string | null;
  category: string | null;
  tags: string[] | null;
  detailed_summary: string | null;
  additional_sources: { url: string; domain: string; headline: string }[] | null;
  slug?: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  per_page: number;
}

export interface SearchResponse {
  articles: Article[];
  total: number;
  query: string;
}

export type Category =
  | "All"
  | "Stocks"
  | "IPO"
  | "Economy"
  | "Global"
  | "Crypto"
  | "Commodities"
  | "Finance"
  | "Companies"
  | "Indian Market"
  | "Movies";

export const MAJOR_CATEGORIES: Category[] = [
  "Stocks",
  "IPO",
  "Economy",
  "Global",
  "Crypto",
  "Commodities",
  "Finance",
  "Companies",
  "Indian Market",
  "Movies",
];

const MAJOR_CATEGORY_SET = new Set<string>(MAJOR_CATEGORIES);

export function normalizeCategory(cat: string | null | undefined): Category {
  if (!cat) return "Stocks";
  if (MAJOR_CATEGORY_SET.has(cat)) return cat as Category;
  const lower = cat.toLowerCase();
  if (
    lower.includes("stock") ||
    lower.includes("share") ||
    lower.includes("equity") ||
    lower.includes("polymarket") ||
    lower.includes("softbank") ||
    lower.includes("nvidia")
  ) {
    return "Stocks";
  }
  if (lower.includes("ipo")) return "IPO";
  if (lower.includes("crypto") || lower.includes("bitcoin") || lower.includes("token")) return "Crypto";
  if (
    lower.includes("commodit") ||
    lower.includes("gold") ||
    lower.includes("silver") ||
    lower.includes("oil") ||
    lower.includes("metal") ||
    lower.includes("aluminum")
  ) {
    return "Commodities";
  }
  if (lower.includes("econom") || lower.includes("fed") || lower.includes("inflation") || lower.includes("rate")) return "Economy";
  if (lower.includes("global") || lower.includes("world")) return "Global";
  if (lower.includes("india")) return "Indian Market";
  if (lower.includes("compan") || lower.includes("corp")) return "Companies";
  if (lower.includes("financ") || lower.includes("bank")) return "Finance";
  if (lower.includes("movie") || lower.includes("cinema") || lower.includes("entertainment")) return "Movies";
  return "Stocks";
}

export interface FeedItem {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  imageUrl: string | null;
  category: string;
  type: "article" | "movie";
  aiSummary: string | null;
  detailedSummary: string | null;
  sourceDomain: string;
  imageSource: string | null;
  tags: string[];
  originalUrl?: string;
  additionalSources?: { url: string; domain: string; headline: string }[] | null;
}

export function feedItemToArticle(item: FeedItem): Article {
  return {
    id: item.id,
    original_headline: item.title,
    original_url:
      item.originalUrl ||
      (item.type === "movie"
        ? `/movies/${item.slug || item.id}`
        : `/article/${item.slug || item.id}`),
    source_domain: item.sourceDomain,
    ai_summary: item.aiSummary,
    market_impact: null,
    published_at: item.publishedAt,
    created_at: item.publishedAt,
    image_url: item.imageUrl,
    image_source: item.imageSource,
    category: item.category,
    tags: item.tags,
    detailed_summary: item.detailedSummary,
    additional_sources: item.additionalSources || null,
    slug: item.slug,
  };
}

