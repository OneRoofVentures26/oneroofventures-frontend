"use client";

import { useMemo, type ReactNode } from "react";
import type { ServiceItem } from "@/lib/api/types";
import { getTopPicks, type QuizBudgetBand } from "@/lib/quiz";
import { useListing } from "@/lib/use-listing";
import AgencyCard, { AgencyLedger } from "@/components/AgencyCard";
import { ctaButton, secondaryButton } from "@/lib/styles";
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
          <h1 className="text-[28px] leading-tight text-ink sm:text-[32px]">Top picks for you in {cityName}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {summary ? `Based on what you told us: ${summary}.` : "Based on what you told us."}
          </p>
        </div>
        <button type="button" onClick={onRetake} className="inline-flex min-h-11 items-center text-sm font-medium text-harbor hover:underline">
          Retake quiz
        </button>
      </div>

      {error ? (
        <ListingError error={error} onRetry={retry} />
      ) : loading ? (
        <AgencyLedger>
          {Array.from({ length: 3 }).map((_, i) => (
            <AgencyCardSkeleton key={i} />
          ))}
        </AgencyLedger>
      ) : picks.length === 0 ? (
        <div className="border-y border-mist px-4 py-10 text-center">
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
              className={secondaryButton}
            >
              Change answers
            </button>
            <a
              href={`/quote?city=${citySlug}${service ? `&service=${service.slug}` : ""}`}
              className={ctaButton}
            >
              Get matched quotes
            </a>
          </div>
        </div>
      ) : (
        <AgencyLedger>
          {picks.map(({ agency, reason }) => (
            <AgencyCard
              key={agency.id}
              agency={agency}
              citySlug={citySlug}
              reason={
                <>
                  <span className="font-medium text-harbor">Why we picked this: </span>
                  {reason}
                </>
              }
            />
          ))}
        </AgencyLedger>
      )}

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={onExpand}
          className={secondaryButton}
        >
          Show all {totalInCity > 0 ? `${totalInCity} ` : ""}agencies in {cityName}
        </button>
      </div>
    </div>
  );
}
