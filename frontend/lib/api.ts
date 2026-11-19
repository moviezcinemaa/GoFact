import type { Article, PaginatedResponse } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";

export async function apiFetch<T>(
  path: string,
  opts?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    next: { revalidate: 300 }, // ISR: revalidate every 5 min server-side
    ...opts,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchArticles(
  page: number = 1,
  limit: number = 18,
  category?: string
): Promise<PaginatedResponse<Article>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (category && category !== "All" && category !== "Movies") {
    params.set("category", category);
  }

  const res = await fetch(`${API_BASE}/api/articles?${params.toString()}`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const items: Article[] = data.items || data.articles || [];
  const total = typeof data.total === "number" ? data.total : items.length;
  const size = typeof data.size === "number" ? data.size : (data.per_page || limit);
  const total_pages =
    typeof data.total_pages === "number"
      ? data.total_pages
      : Math.ceil(total / (size || 1));

  return {
    items,
    total,
    page: typeof data.page === "number" ? data.page : page,
    size,
    total_pages,
  };
}

