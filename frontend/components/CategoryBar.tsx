"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

const DEFAULT_CATEGORIES: Category[] = [
  "All",
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

interface CategoryBarProps {
  active: Category;
  categories?: Category[];
}

export default function CategoryBar({
  active,
  categories: propCategories,
}: CategoryBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(
    propCategories && propCategories.length > 0
      ? propCategories
      : DEFAULT_CATEGORIES
  );
  const [loadingCategory, setLoadingCategory] = useState<Category | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    }
  }, [propCategories]);

  useEffect(() => {
    setLoadingCategory(null);
  }, [searchParams, active]);

  useEffect(() => {
    // If categories were supplied by server feed, skip client fetch
    if (propCategories && propCategories.length > 0) return;

    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((cats: string[]) => {
        if (cats && Array.isArray(cats) && cats.length > 0) {
          const valid = cats.filter((c) =>
            DEFAULT_CATEGORIES.includes(c as Category)
          ) as Category[];
          const merged = ["All" as Category, ...valid];
          if (!merged.includes("Movies")) merged.push("Movies");
          setCategories(merged);
        }
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
      });
  }, [propCategories]);

  function handleChange(cat: Category) {
    if (cat === active && !searchParams.get("category") && cat === "All") return;
    setLoadingCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  }

  return (
    <div className="category-accordion-wrapper">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="category-accordion-toggle"
      >
        <span>Filter: {active}</span>
        <span className={`toggle-icon ${isOpen ? "open" : ""}`}>▼</span>
      </button>

      <div className={`category-accordion-content ${isOpen ? "open" : ""}`}>
        <div className="category-accordion-inner">
          <div className="category-chips">
            {categories.map((cat) => {
              const isLoading = loadingCategory === cat;
              const isAnyLoading = Boolean(loadingCategory);
              return (
                <button
                  key={cat}
                  className={`category-chip${active === cat ? " active" : ""}${
                    isLoading
                      ? " btn-loading btn-loading-black"
                      : isAnyLoading
                      ? " btn-loading btn-loading-gray"
                      : ""
                  }`}
                  onClick={() => handleChange(cat)}
                  disabled={isAnyLoading}
                >
                  {isLoading ? "LOADING..." : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
