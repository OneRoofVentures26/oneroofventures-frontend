"use client";

import type { AdminTheme } from "@/lib/admin-theme";
import { cn } from "@/lib/utils";

/** Light / dark switch for the admin. Shows the theme it will switch to. */
export default function ThemeToggle({
  theme,
  onToggle,
  className,
}: {
  theme: AdminTheme;
  onToggle: () => void;
  className?: string;
}) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text-muted transition hover:bg-surface-raised hover:text-text lg:h-9 lg:w-9",
        className,
      )}
    >
      {dark ? (
        // Sun
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="10" cy="10" r="3.5" />
          <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1" />
        </svg>
      ) : (
        // Moon
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <path d="M16.5 12.2A6.8 6.8 0 0 1 7.8 3.5a6.8 6.8 0 1 0 8.7 8.7Z" />
        </svg>
      )}
    </button>
  );
}
