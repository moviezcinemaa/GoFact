"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  initialQuery?: string;
}

export default function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    setIsLoading(true);
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  const isSearching = Boolean(searchParams.get("q"));

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Search companies, tickers, or topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        className={`search-button ${isLoading ? "btn-loading btn-loading-black" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? "FETCHING..." : "Search"}
      </button>
      {isSearching && (
        <button
          type="button"
          className={`search-clear ${isLoading ? "btn-loading btn-loading-gray" : ""}`}
          onClick={handleClear}
          disabled={isLoading}
        >
          {isLoading ? "WAIT" : "Clear"}
        </button>
      )}
    </form>
  );
}
