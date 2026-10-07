"use client";

import { useCompare, type CompareItem } from "@/lib/compare-context";
import { cn } from "@/lib/utils";

export default function CompareToggle({ item, className }: { item: CompareItem; className?: string }) {
  const { isSelected, toggle, blockReason } = useCompare();
  const selected = isSelected(item.id);
  const reason = blockReason(item);
  const disabled = !selected && reason !== null;

  return (
    <div className={cn("group relative flex-shrink-0", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => toggle(item)}
        aria-pressed={selected}
        className={cn(
          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
          selected
            ? "border-accent bg-accent text-white"
            : disabled
              ? "cursor-not-allowed border-border text-ink-soft/50"
              : "border-border text-ink-soft hover:border-accent hover:text-accent-dark",
        )}
      >
        {selected ? "✓ Added" : "+ Compare"}
      </button>
      {disabled && (
        <div className="pointer-events-none absolute right-0 top-full z-20 mt-1.5 w-52 origin-top-right scale-95 rounded-lg border border-border bg-ink px-2.5 py-2 text-[11px] text-white opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
          {reason}
        </div>
      )}
    </div>
  );
}
