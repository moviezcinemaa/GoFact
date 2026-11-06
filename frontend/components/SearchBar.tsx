"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
}

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleSearch() {
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    });
  }

  function handleClear() {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <div className="search-bar">
      <input
        className="search-input"
        type="text"
        placeholder="Search news…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        aria-label="Search news"
      />
      <button className="search-button" onClick={handleSearch}>
        Search
      </button>
      {query && (
        <button className="search-clear" onClick={handleClear}>
          ✕
        </button>
      )}
    </div>
  );
}

