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

