"use client";

import Link from "next/link";
import { compareHref, useCompare } from "@/lib/compare-context";

export default function CompareNavBadge() {
  const { items } = useCompare();

  if (items.length === 0) return null;

  return (
    <Link
      href={compareHref(items)}
      aria-label={`Compare ${items.length} ${items.length === 1 ? "agency" : "agencies"}`}
      className="flex h-11 flex-shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text transition-colors duration-200 hover:border-primary/40 hover:text-primary-text"
    >
      <span className="hidden sm:inline">Compare</span>
      <span className="num flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-md bg-primary px-1 text-xs font-bold text-primary-fg">
        {items.length}
      </span>
    </Link>
  );
}
