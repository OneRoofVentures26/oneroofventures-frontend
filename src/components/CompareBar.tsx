"use client";

import { useCompare, MAX_COMPARE } from "@/lib/compare-context";
import Link from "next/link";

export default function CompareBar() {
  const { selectedIds, clear } = useCompare();

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="flex w-full max-w-xl items-center justify-between gap-2 rounded-xl border border-border bg-ink px-3 py-2.5 text-white shadow-xl sm:gap-4 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold">
            {selectedIds.length}
          </span>
          <span className="truncate text-xs font-medium sm:text-sm">
            <span className="sm:hidden">{selectedIds.length} selected</span>
            <span className="hidden sm:inline">
              {selectedIds.length} of {MAX_COMPARE} agencies selected
            </span>
          </span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <button
            onClick={clear}
            className="text-xs font-medium text-white/70 transition hover:text-white sm:text-sm"
          >
            Clear
          </button>
          <Link
            href={`/compare?ids=${selectedIds.join(",")}`}
            className="rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-dark sm:px-4 sm:text-sm"
          >
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}
