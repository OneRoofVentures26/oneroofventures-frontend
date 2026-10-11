"use client";

import { useCompare, type CompareItem } from "@/lib/compare-context";
import { cn } from "@/lib/utils";

/** "+ Compare" button. It fills its wrapper, so a grid cell gets a full-width button. */
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
          "inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-xl border px-3 text-sm font-semibold transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.98]",
          selected
            ? "border-primary bg-primary text-primary-fg hover:bg-primary-hover"
            : disabled
              ? "cursor-not-allowed border-border text-text-muted/60"
              : "border-border bg-surface text-text shadow-card hover:border-primary/40 hover:text-primary-text",
        )}
      >
        {selected ? "✓ Added" : "+ Compare"}
      </button>
      {disabled && (
        <div className="pointer-events-none absolute left-0 top-full z-20 mt-1.5 w-52 origin-top-left scale-95 rounded-lg bg-text px-2.5 py-2 text-[13px] text-bg opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
          {reason}
        </div>
      )}
    </div>
  );
}
