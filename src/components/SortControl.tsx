"use client";

import type { ListingSort } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ key: ListingSort; label: string }> = [
  { key: "recent", label: "Recently updated" },
  { key: "score", label: "One Roof Score" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "name", label: "Name" },
];

/**
 * Sort select. `compact` is a 44px icon button (mobile, next to "Filters"):
 * the native select sits invisibly on top, so the phone's own picker opens.
 */
export default function SortControl({
  value,
  onChange,
  compact = false,
}: {
  value: ListingSort;
  onChange: (key: ListingSort) => void;
  compact?: boolean;
}) {
  const select = (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ListingSort)}
      aria-label="Sort agencies"
      className={cn(
        compact
          ? "absolute inset-0 h-full w-full cursor-pointer opacity-0"
          : "h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text outline-none focus:border-primary",
      )}
    >
      {OPTIONS.map((o) => (
        <option key={o.key} value={o.key}>
          {o.label}
        </option>
      ))}
    </select>
  );

  if (compact) {
    return (
      <span
        className="relative inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text shadow-card focus-within:ring-2 focus-within:ring-ring"
        title={`Sort: ${OPTIONS.find((o) => o.key === value)?.label}`}
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 4v12M3 13l3 3 3-3M14 16V4M11 7l3-3 3 3" />
        </svg>
        {select}
      </span>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm text-text-muted">
      Sort by
      {select}
    </label>
  );
}
