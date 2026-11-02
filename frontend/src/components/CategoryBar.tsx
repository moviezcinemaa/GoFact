import { useState, useEffect } from "react";
import type { Category } from "../types";
import { CATEGORIES } from "../types";
import { fetchCategories } from "../api/client";

interface CategoryBarProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export default function CategoryBar({ active, onChange }: CategoryBarProps) {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          const finalCats: Category[] = ["All" as Category];
          CATEGORIES.forEach((c) => {
            if (c === "All" || c === "Movies" || cats.includes(c)) {
              if (!finalCats.includes(c)) finalCats.push(c);
            }
          });
          cats.forEach((c) => {
            if (!finalCats.includes(c as Category)) {
              finalCats.push(c as Category);
            }
          });
          setCategories(finalCats);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dynamic categories, using default list:", err);
      });
  }, []);

  return (
    <div className="category-bar-wrapper">
      <div className="category-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-chip${active === cat ? " active" : ""}`}
            onClick={() => onChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
