import { useState, useEffect } from "react";
import type { Category } from "../types";
import { fetchCategories } from "../api/client";

interface CategoryBarProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(["All"]);

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          // Add 'All' and 'Movies' to the dynamic list
          const formatted = cats.map(c => c as Category);
          const finalCats: Category[] = ["All" as Category, ...formatted];
          if (!finalCats.includes("Movies" as any)) {
            finalCats.push("Movies" as any);
          }
          setCategories(finalCats);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch categories", err);
        setCategories(["All", "Movies" as any]);
      });
  }, []);

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
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-chip${active === cat ? " active" : ""}`}
                onClick={() => {
                  onChange(cat);
                  setIsOpen(false);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
