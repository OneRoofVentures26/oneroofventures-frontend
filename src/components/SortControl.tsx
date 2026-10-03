"use client";

export type SortKey = "score" | "rating" | "price";

const OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "score", label: "OneRoof Score" },
  { key: "rating", label: "Rating" },
  { key: "price", label: "Price: Low to High" },
];

export default function SortControl({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (key: SortKey) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-soft">
      Sort by
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
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
