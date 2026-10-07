"use client";

import Link from "next/link";
import { TIERS, type CompareAgency, type TierGrid } from "@/lib/api/types";
import { formatPackagePrice, PRICING_TYPE_LABELS, TIER_LABELS } from "@/lib/utils";
import VerifiedBadge from "@/components/VerifiedBadge";

interface ComparisonTableProps {
  agencies: CompareAgency[];
  grid: TierGrid;
  citySlug: string | null;
  /** Builds a quote link for a cell, or null when the package can't be resolved. */
  quoteHref?: (agency: CompareAgency, tier: (typeof TIERS)[number]) => string | null;
  onRemove?: (id: number) => void;
}

const MAX_INCLUSIONS = 5;

export default function ComparisonTable({ agencies, grid, citySlug, quoteHref, onRemove }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-28 border-b border-border p-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Tier
            </th>
            {agencies.map((a) => (
              <th key={a.id} className="min-w-[200px] border-b border-border p-4 text-left align-top">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {citySlug ? (
                      <Link href={`/${citySlug}/${a.slug}`} className="font-bold text-ink hover:text-accent">
                        {a.name}
                      </Link>
                    ) : (
                      <span className="font-bold text-ink">{a.name}</span>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {a.verified && <VerifiedBadge />}
                      <span className="text-xs font-normal text-ink-soft">{PRICING_TYPE_LABELS[a.pricingType]}</span>
                    </div>
                  </div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(a.id)}
                      aria-label={`Remove ${a.name} from comparison`}
                      className="text-xs font-medium text-ink-soft hover:text-danger"
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
            <tr key={tier} className={idx % 2 === 0 ? "bg-paper/50" : ""}>
              <td className="border-b border-border p-4 align-top text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {TIER_LABELS[tier]}
              </td>
              {agencies.map((a) => {
                const cell = grid[tier]?.[String(a.id)] ?? null;
                if (!cell) {
                  return (
                    <td key={a.id} className="border-b border-border p-4 align-top text-ink-soft">
                      —
                    </td>
                  );
                }
                const href = quoteHref?.(a, tier);
                const extra = cell.inclusions.length - MAX_INCLUSIONS;
                return (
                  <td key={a.id} className="border-b border-border p-4 align-top text-ink">
                    <p className="font-semibold">{cell.name}</p>
                    <p className="mt-0.5 font-bold text-accent-dark">
                      {formatPackagePrice(cell.priceMin, cell.priceMax, cell.billing)}
                    </p>
                    {cell.inclusions.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-ink-soft">
                        {cell.inclusions.slice(0, MAX_INCLUSIONS).map((item, i) => (
                          <li key={`${i}-${item}`}>• {item}</li>
                        ))}
                        {extra > 0 && <li className="italic">+{extra} more</li>}
                      </ul>
                    )}
                    {href && (
                      <Link href={href} className="mt-3 inline-block text-xs font-semibold text-accent hover:underline">
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
