"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { CityItem, ServiceItem } from "@/lib/api/types";
import { parseSearchQuery } from "@/lib/quiz";
import GuidedQuiz from "@/components/GuidedQuiz";
import { chip, ctaButton } from "@/lib/styles";
import { cn } from "@/lib/utils";

/*
 * The homepage entry points, deliberately separate:
 * - HomeSearch is a filter: "SEO agency in Bangalore" opens that city's
 *   listing with the service filter applied.
 * - HomeQuiz records what the visitor needs as a brief (see GuidedQuiz).
 */

/** The listing for a city, narrowed to one service when the search named one. */
function listingHref(citySlug: string, service: string | null) {
  return service ? `/${citySlug}/services/${service}` : `/${citySlug}`;
}

const WIDE_QUERY = "(min-width: 640px)";

function subscribeWide(onChange: () => void) {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True from 640px. The server assumes a phone, so the short placeholder is the default. */
function useWideScreen() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

export function HomeSearch({ cities, services }: { cities: CityItem[]; services: ServiceItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  /** Set when a search names no city: we ask for one instead of guessing. */
  const [needsCity, setNeedsCity] = useState<{ service: string | null } | null>(null);
  const wide = useWideScreen();
  const liveCities = cities.filter((c) => c.agencyCount > 0);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const parsed = parseSearchQuery(query, services, cities);
    // Only one live city: no need to ask which one.
    const citySlug = parsed.citySlug ?? (liveCities.length === 1 ? liveCities[0].slug : null);
    if (citySlug) {
      router.push(listingHref(citySlug, parsed.service));
    } else {
      setNeedsCity({ service: parsed.service });
    }
  }

  const exampleCity = liveCities[0]?.name ?? cities[0]?.name ?? "Bangalore";
  const serviceName = services.find((s) => s.slug === needsCity?.service)?.name;

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={handleSearch}
        role="search"
        className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2 transition-[border-color,box-shadow] duration-200 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-ring/15"
      >
        <svg
          viewBox="0 0 20 20"
          className="ml-2 h-5 w-5 flex-shrink-0 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M17 17l-4-4" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setNeedsCity(null);
          }}
          placeholder={wide ? `Try "affordable SEO agency in ${exampleCity}"` : `Try: SEO agency in ${exampleCity}`}
          aria-label="Search for an agency"
          className="min-h-11 w-full min-w-0 bg-transparent py-2 text-base text-text outline-none placeholder:text-text-muted focus-visible:outline-none"
        />
        <button type="submit" className={cn(ctaButton, "flex-shrink-0")}>
          Go
        </button>
      </form>

      {needsCity && (
        <div className="mt-3" aria-live="polite">
          <p className="text-sm text-text-muted">
            Which city should we show {serviceName ? `${serviceName} agencies` : "agencies"} in?
          </p>
          {liveCities.length === 0 ? (
            <p className="mt-2 text-sm text-text">No cities are live yet — check back soon.</p>
          ) : (
            <div className="scrollbar-thin -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
              {liveCities.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => router.push(listingHref(c.slug, needsCity.service))}
                  className={cn(chip(false), "flex-shrink-0")}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HomeQuiz({
  cities,
  services,
  className,
}: {
  cities: CityItem[];
  services: ServiceItem[];
  className?: string;
}) {
  return (
    <div className={cn("scroll-mt-24 rounded-2xl", className)}>
      <GuidedQuiz services={services} cities={cities} />
    </div>
  );
}
