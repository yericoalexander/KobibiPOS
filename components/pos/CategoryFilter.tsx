"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: any[];
  active: string | null;
  onChange: (id: string | null) => void;
}

import React from 'react';

const CategoryFilter = React.memo(({ categories, active, onChange }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 w-full overflow-x-auto pb-2 custom-scrollbar shrink-0">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300",
          active === null
            ? "bg-[var(--color-accent)] text-white shadow-lg shadow-amber-500/20"
            : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)]/50"
        )}
      >
        Semua
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300",
            active === c.id
              ? "bg-[var(--color-accent)] text-white shadow-lg shadow-amber-500/20"
              : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-accent)]/50"
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
export default CategoryFilter;
