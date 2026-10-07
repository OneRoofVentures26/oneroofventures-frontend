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
          "inline-flex min-h-11 items-center rounded-sm border px-3 text-sm font-medium transition lg:min-h-9",
          selected
            ? "border-harbor bg-harbor text-paper hover:bg-harbor-dark"
            : disabled
              ? "cursor-not-allowed border-mist text-ink-soft/50"
              : "border-mist bg-surface text-ink hover:border-harbor hover:text-harbor",
        )}
      >
        {selected ? "✓ Added" : "+ Compare"}
      </button>
      {disabled && (
        <div className="pointer-events-none absolute right-0 top-full z-20 mt-1.5 w-52 origin-top-right scale-95 rounded-sm bg-ink px-2.5 py-2 text-xs text-paper opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
          {reason}
        </div>
      )}
    </div>
  );
}
