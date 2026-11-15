"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  page: number;
  total_pages?: number;
  totalPages?: number;
  category?: string;
  q?: string;
}

export default function PaginationControls({
  page,
  total_pages,
  totalPages,
  category = "All",
  q = "",
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navigatingDir, setNavigatingDir] = useState<"prev" | "next" | null>(
    null
  );

  const pagesCount = total_pages ?? totalPages ?? 1;

  useEffect(() => {
    setNavigatingDir(null);
  }, [searchParams, page]);

  function navigateTo(targetPage: number, dir: "prev" | "next") {
    if (navigatingDir) return;
    setNavigatingDir(dir);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", targetPage.toString());
    if (category && category !== "All") {
      params.set("category", category);
    }
    if (q) {
      params.set("q", q);
    }
    router.push(`/?${params.toString()}`);
  }

  const isLoading = Boolean(navigatingDir);

  if (pagesCount <= 1) return null;

  return (
    <div className="pagination">
      {page <= 1 ? (
        <button disabled>Previous</button>
      ) : (
        <button
          type="button"
          className={`pagination-btn ${
            navigatingDir === "prev"
              ? "btn-loading btn-loading-black"
              : isLoading
              ? "btn-loading btn-loading-gray"
              : ""
          }`}
          onClick={() => navigateTo(page - 1, "prev")}
          disabled={isLoading}
        >
          {navigatingDir === "prev" ? "WAIT" : "Previous"}
        </button>
      )}

      <span className="page-info">
        Page {page} of {pagesCount}
      </span>

      {page >= pagesCount ? (
        <button disabled>Next</button>
      ) : (
        <button
          type="button"
          className={`pagination-btn ${
            navigatingDir === "next"
              ? "btn-loading btn-loading-black"
              : isLoading
              ? "btn-loading btn-loading-gray"
              : ""
          }`}
          onClick={() => navigateTo(page + 1, "next")}
          disabled={isLoading}
        >
          {navigatingDir === "next" ? "WAIT" : "Next"}
        </button>
      )}
    </div>
  );
}

