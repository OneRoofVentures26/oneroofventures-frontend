"use client";

import Link from "next/link";
import type { AgencyListItem } from "@/lib/api/types";
import { useCompare } from "@/lib/compare-context";
import { cn, formatStartingPrice, initials, TIER_LABELS } from "@/lib/utils";
import CompareToggle from "@/components/CompareToggle";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function AgencyCard({ agency, citySlug }: { agency: AgencyListItem; citySlug: string }) {
  const { isSelected } = useCompare();
  const selected = isSelected(agency.id);
  const href = `/${citySlug}/${agency.slug}`;
  const hasPrice = agency.startingPrice != null;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-surface p-5 shadow-sm transition hover:shadow-md",
        selected ? "border-accent ring-1 ring-accent/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light text-sm font-bold text-accent-dark">
            {initials(agency.name)}
          </span>
          <div className="min-w-0">
            <Link href={href} className="block text-sm font-semibold text-ink hover:text-accent">
              {agency.name}
            </Link>
            <p className="truncate text-xs text-ink-soft">
              {[agency.locality, agency.teamSize && `${agency.teamSize} people`].filter(Boolean).join(" · ") ||
                " "}
            </p>
            {agency.verified && <VerifiedBadge className="mt-1" />}
          </div>
        </div>

        <CompareToggle item={{ id: agency.id, name: agency.name, slug: agency.slug, citySlug }} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {agency.services.slice(0, 3).map((s) => (
          <span key={s.code} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-ink-soft">
            {s.name}
          </span>
        ))}
        {agency.services.length > 3 && (
          <span className="px-1 py-1 text-xs text-ink-soft">+{agency.services.length - 3}</span>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div className="flex flex-wrap gap-1">
          {agency.tiersAvailable.map((t) => (
            <span key={t} className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-ink-soft">
              {TIER_LABELS[t]}
            </span>
          ))}
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-ink-soft">{hasPrice ? "Starting at" : "Pricing"}</p>
          <p className={cn("text-sm font-bold", hasPrice ? "text-ink" : "text-ink-soft")}>
            {formatStartingPrice(agency.startingPrice, agency.billing)}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="mt-4 block rounded-lg border border-border py-2 text-center text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
      >
        View profile
      </Link>
    </div>
  );
}
