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
        className="h-11 rounded-sm border border-mist bg-surface px-2.5 text-sm font-medium text-ink outline-none focus:border-harbor lg:h-9"
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
