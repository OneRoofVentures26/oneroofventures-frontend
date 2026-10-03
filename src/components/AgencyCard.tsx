"use client";

import Link from "next/link";
import type { Agency } from "@/lib/types";
import { useCompare } from "@/lib/compare-context";
import { formatPrice, cn } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import ScoreBadge from "@/components/ScoreBadge";

function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => /^[A-Za-z&]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function AgencyCard({ agency }: { agency: Agency }) {
  const { isSelected, toggle, isFull } = useCompare();
  const selected = isSelected(agency.id);
  const startingPrice = Math.min(...agency.packages.map((p) => p.priceMin));
  const disabled = !selected && isFull;

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-surface p-5 shadow-sm transition hover:shadow-md",
        selected ? "border-accent ring-1 ring-accent/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light text-sm font-bold text-accent-dark">
            {initials(agency.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`/${agency.city}/${agency.slug}`}
                className="text-sm font-semibold text-ink hover:text-accent"
              >
                {agency.name}
              </Link>
              {agency.premium && (
                <span className="flex-shrink-0 rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  Premium
                </span>
              )}
            </div>
            <StarRating rating={agency.rating} />
            <span className="text-xs text-ink-soft">
              {agency.reviewCount} reviews
            </span>
          </div>
        </div>

        <label
          className={cn(
            "flex flex-shrink-0 items-center gap-1.5 text-xs font-medium",
            disabled ? "cursor-not-allowed text-ink-soft/50" : "cursor-pointer text-ink-soft",
          )}
        >
          <input
            type="checkbox"
            checked={selected}
            disabled={disabled}
            onChange={() => toggle(agency.id)}
            className="h-4 w-4 accent-accent"
          />
          Compare
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {agency.services.slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-ink-soft"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <ScoreBadge score={agency.score} breakdown={agency.scoreBreakdown} size="sm" />
        <div className="text-right">
          <p className="text-xs text-ink-soft">Starting at</p>
          <p className="text-sm font-bold text-ink">{formatPrice(startingPrice)}/mo</p>
        </div>
      </div>

      <Link
        href={`/${agency.city}/${agency.slug}`}
        className="mt-4 block rounded-lg border border-border py-2 text-center text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
      >
        View profile
      </Link>
    </div>
  );
}
