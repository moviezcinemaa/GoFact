"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryBarProps {
  active: Category;
}

export default function CategoryBar({ active }: CategoryBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(["All"]);
  const [loadingCategory, setLoadingCategory] = useState<Category | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoadingCategory(null);
  }, [searchParams, active]);

  useEffect(() => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL || "https://gofact-backend.onrender.com";
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((cats: string[]) => {
        if (cats && cats.length > 0) {
          const formatted = cats.map((c) => c as Category);
          const finalCats: Category[] = ["All" as Category, ...formatted];
          if (!finalCats.includes("Movies" as Category)) {
            finalCats.push("Movies" as Category);
          }
          setCategories(finalCats);
        }
      })
      .catch(() => {
        setCategories(["All", "Movies"] as Category[]);
      });
  }, []);

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
