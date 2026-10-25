"use client";

import Link from "next/link";
import { TIERS, type CityRange, type CompareAgency, type TierGrid } from "@/lib/api/types";
import { formatPackagePrice, PRICING_TYPE_LABELS, TIER_LABELS } from "@/lib/utils";
import AgencyLogo from "@/components/AgencyLogo";
import VerifiedBadge from "@/components/VerifiedBadge";
import { CityRangeNote, GoogleRating, ScoreBadge } from "@/components/AgencyQuality";

interface ComparisonTableProps {
  agencies: CompareAgency[];
  grid: TierGrid;
  citySlug: string | null;
  /** The city's typical price per tier for this service, shown next to quote-only agencies. */
  cityRange?: CityRange | null;
  cityName?: string | null;
  /** Builds a quote link for a cell, or null when the package can't be resolved. */
  quoteHref?: (agency: CompareAgency, tier: (typeof TIERS)[number]) => string | null;
  onRemove?: (id: number) => void;
}

const MAX_INCLUSIONS = 5;

export default function ComparisonTable({
  agencies,
  grid,
  citySlug,
  cityRange,
  cityName = null,
  quoteHref,
  onRemove,
}: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto border-t-2 border-primary">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-28 border-b border-border p-4 pl-0 text-left text-[13px] font-medium text-text-muted">
              Tier
            </th>
            {agencies.map((a) => (
              <th key={a.id} className="min-w-[200px] border-b border-border p-4 text-left align-top">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <AgencyLogo name={a.name} logoUrl={a.logoUrl} className="mb-2 h-10 w-10 rounded-xl" />
                    {citySlug ? (
                      <Link href={`/${citySlug}/${a.slug}`} className="font-display text-lg font-semibold text-text hover:text-primary-text">
                        {a.name}
                      </Link>
                    ) : (
                      <span className="font-display text-lg font-semibold text-text">{a.name}</span>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {a.verified && <VerifiedBadge />}
                      <span className="text-[13px] font-normal text-text-muted">{PRICING_TYPE_LABELS[a.pricingType]}</span>
                    </div>
                    {(a.scoreLabel || a.quality?.googleRating != null) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-normal">
                        <ScoreBadge score={a.score} scoreLabel={a.scoreLabel} />
                        <GoogleRating rating={a.quality?.googleRating ?? null} reviews={a.quality?.googleReviews ?? null} compact />
                      </div>
                    )}
                  </div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(a.id)}
                      aria-label={`Remove ${a.name} from comparison`}
                      className="flex h-11 w-11 items-center justify-center text-[13px] font-medium text-text-muted hover:text-danger lg:h-8 lg:w-8"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIERS.map((tier, idx) => (
            <tr key={tier} className={idx % 2 === 0 ? "bg-surface" : ""}>
              <td className="border-b border-border p-4 pl-0 align-top font-display text-base font-semibold text-text">
                {TIER_LABELS[tier]}
              </td>
              {agencies.map((a) => {
                const cell = grid[tier]?.[String(a.id)] ?? null;
                if (!cell) {
                  const range = a.pricingType === "QUOTE_ONLY" ? cityRange?.[tier] : null;
                  return (
                    <td key={a.id} className="border-b border-border p-4 align-top text-text-muted">
                      {range ? (
                        <>
                          <p className="font-semibold text-text">Price on request</p>
                          <CityRangeNote range={range} cityName={cityName} className="mt-1" />
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                }
                const href = quoteHref?.(a, tier);
                const extra = cell.inclusions.length - MAX_INCLUSIONS;
                return (
                  <td key={a.id} className="border-b border-border p-4 align-top text-text">
                    <p className="font-semibold">{cell.name}</p>
                    <p className="mt-0.5 font-display text-lg font-semibold text-primary-text">
                      {formatPackagePrice(cell.priceMin, cell.priceMax, cell.billing)}
                    </p>
                    {cell.inclusions.length > 0 && (
                      <ul className="mt-2 space-y-1 text-[13px] text-text-muted">
                        {cell.inclusions.slice(0, MAX_INCLUSIONS).map((item, i) => (
                          <li key={`${i}-${item}`}>• {item}</li>
                        ))}
                        {extra > 0 && <li className="italic">+{extra} more</li>}
                      </ul>
                    )}
                    {href && (
                      <Link href={href} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary-text hover:underline lg:min-h-0">
                        Get a quote →
                      </Link>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
