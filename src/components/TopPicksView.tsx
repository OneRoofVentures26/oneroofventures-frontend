"use client";

import { useMemo, type ReactNode } from "react";
import type { ServiceItem } from "@/lib/api/types";
import { getTopPicks, type QuizBudgetBand } from "@/lib/quiz";
import { useListing } from "@/lib/use-listing";
import AgencyCard from "@/components/AgencyCard";
import AgencyCardSkeleton from "@/components/AgencyCardSkeleton";
import { ListingError } from "@/components/AgencyGridView";

interface TopPicksViewProps {
  citySlug: string;
  cityName: string;
  service: ServiceItem | null;
  band: QuizBudgetBand | undefined;
  totalInCity: number;
  expanded: boolean;
  expandedContent: ReactNode;
  onExpand: () => void;
  onRetake: () => void;
}

export default function TopPicksView({
  citySlug,
  cityName,
  service,
  band,
  totalInCity,
  expanded,
  expandedContent,
  onExpand,
  onRetake,
}: TopPicksViewProps) {
  const { data, error, loading, retry } = useListing(citySlug, {
    service: service?.slug,
    budgetMax: band?.max ?? undefined,
    size: 12,
  });

  const picks = useMemo(
    () => (data ? getTopPicks(data.items, service, band, cityName, 3) : []),
    [data, service, band, cityName],
  );

  if (expanded) return <>{expandedContent}</>;

  const summary = [service?.name, band?.max != null ? band.phrase : null].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Top picks for you in {cityName}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {summary ? `Based on what you told us: ${summary}.` : "Based on what you told us."}
          </p>
        </div>
        <button type="button" onClick={onRetake} className="text-sm font-medium text-accent hover:underline">
          Retake quiz
        </button>
      </div>

      {error ? (
        <ListingError error={error} onRetry={retry} />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AgencyCardSkeleton key={i} />
          ))}
        </div>
      ) : picks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium text-ink">
            No agencies in {cityName} match {summary || "these answers"} yet
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Try a different budget, browse every agency, or send us a quote request and we&apos;ll match
            you by hand.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onRetake}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:border-accent"
            >
              Change answers
            </button>
            <a
              href={`/quote?city=${citySlug}${service ? `&service=${service.slug}` : ""}`}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Get matched quotes
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {picks.map(({ agency, reason }) => (
            <div key={agency.id} className="flex flex-col">
              <AgencyCard agency={agency} citySlug={citySlug} />
              <p className="mt-2 text-xs text-ink-soft">
                <span className="font-semibold text-accent-dark">Why we picked this: </span>
                {reason}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={onExpand}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
        >
          Show all {totalInCity > 0 ? `${totalInCity} ` : ""}agencies in {cityName}
        </button>
      </div>
    </div>
  );
}
