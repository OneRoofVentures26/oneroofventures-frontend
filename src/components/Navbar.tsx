import Link from "next/link";
import CitySwitcher from "@/components/CitySwitcher";
import CompareNavBadge from "@/components/CompareNavBadge";
import type { CityItem } from "@/lib/api/types";

export default function Navbar({ cities }: { cities: CityItem[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">
            OR
          </span>
          <span className="hidden truncate text-base font-bold text-ink sm:inline">
            OneRoof Ventures
          </span>
        </Link>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <CompareNavBadge />
          <Link
            href="/quote"
            className="hidden rounded-md px-2 py-1.5 text-sm font-medium text-ink-soft transition hover:text-accent sm:inline"
          >
            Get quotes
          </Link>
          <CitySwitcher cities={cities} />
        </div>
      </div>
    </header>
  );
}
