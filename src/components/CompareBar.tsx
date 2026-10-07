"use client";

import Link from "next/link";
import { compareHref, MIN_COMPARE, useCompare } from "@/lib/compare-context";
import { cn } from "@/lib/utils";

export default function CompareBar() {
  const { items, clear, remove } = useCompare();
  const visible = items.length > 0;
  const ready = items.length >= MIN_COMPARE;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 transition-transform duration-300 sm:px-4 sm:pb-4",
        visible ? "translate-y-0" : "translate-y-full pointer-events-none",
      )}
    >
      <div className="flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-border bg-ink px-3 py-2.5 text-white shadow-xl sm:px-5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs font-medium sm:text-sm">
            {ready
              ? `${items.length} agencies selected`
              : `Add ${MIN_COMPARE - items.length} more to compare`}
          </span>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <button onClick={clear} className="text-xs font-medium text-white/70 transition hover:text-white sm:text-sm">
              Clear
            </button>
            {ready ? (
              <Link
                href={compareHref(items)}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-dark sm:px-4 sm:text-sm"
              >
                Compare now
              </Link>
            ) : (
              <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/60 sm:px-4 sm:text-sm">
                Compare now
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {items.map((a) => (
            <span
              key={a.id}
              className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium"
            >
              {a.name}
              <button
                onClick={() => remove(a.id)}
                aria-label={`Remove ${a.name} from comparison`}
                className="text-white/70 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
