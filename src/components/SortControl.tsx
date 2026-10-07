"use client";

import type { ListingSort } from "@/lib/api/types";

const OPTIONS: Array<{ key: ListingSort; label: string }> = [
  { key: "recent", label: "Recently updated" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "name", label: "Name" },
];

export default function SortControl({
  value,
  onChange,
}: {
  value: ListingSort;
  onChange: (key: ListingSort) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-soft">
      Sort by
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ListingSort)}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm font-medium text-ink outline-none focus:border-accent"
      >
        {OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
