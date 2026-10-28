"use client";

import { useCompare } from "@/lib/compare-context";
import { cn } from "@/lib/utils";

/**
 * Mobile-only bar pinned to the bottom of the screen with the page's two main
 * actions, padded for the iPhone home indicator. It steps aside while the
 * compare bar is showing, so the two never stack. globals.css reserves room
 * for it at the bottom of the page.
 */
export default function StickyActionBar({ children }: { children: React.ReactNode }) {
  const { items } = useCompare();
  const hidden = items.length > 0;

  return (
    <div
      data-action-bar=""
      aria-hidden={hidden || undefined}
      className={cn(
        "glass pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border px-4 pt-3 transition-transform duration-300 ease-brand lg:hidden",
        hidden && "pointer-events-none translate-y-full",
      )}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-2 [&>*]:w-full">{children}</div>
    </div>
  );
}
