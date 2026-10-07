"use client";

import Link from "next/link";
import { compareHref, useCompare } from "@/lib/compare-context";

export default function CompareNavBadge() {
  const { items } = useCompare();

  if (items.length === 0) return null;

  return (
    <Link
      href={compareHref(items)}
      className="flex flex-shrink-0 items-center gap-1.5 rounded-md border border-accent/30 bg-accent-light px-2.5 py-1.5 text-sm font-medium text-accent-dark transition hover:bg-accent/15 sm:px-3"
    >
      <span className="hidden sm:inline">Compare</span>
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
        {items.length}
      </span>
    </Link>
  );
}
