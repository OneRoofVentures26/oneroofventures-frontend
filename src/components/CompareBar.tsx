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
        "pb-safe fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 transition-transform duration-300 sm:px-4 sm:pb-4",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
    >
      <div className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-text px-3 py-2.5 text-bg shadow-raised sm:px-5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 text-[13px] font-medium sm:text-sm">
            {ready ? `${items.length} agencies selected` : `Add ${MIN_COMPARE - items.length} more to compare`}
          </span>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <button onClick={clear} className="min-h-11 px-1 text-[13px] font-medium text-bg/70 transition hover:text-bg sm:text-sm">
              Clear
            </button>
            {ready ? (
              <Link
                href={compareHref(items)}
                className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg transition hover:bg-primary-hover"
              >
                Compare now
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-xl bg-bg/10 px-4 text-sm font-semibold text-bg/60">
                Compare now
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {items.map((a) => (
            <span key={a.id} className="flex items-center gap-1 rounded-lg bg-bg/10 py-0.5 pl-2.5 pr-1 text-[13px] font-medium">
              {a.name}
              <button
                onClick={() => remove(a.id)}
                aria-label={`Remove ${a.name} from comparison`}
                className="flex h-8 w-8 items-center justify-center text-bg/70 hover:text-bg"
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
