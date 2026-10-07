"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { AgencyListItem } from "@/lib/api/types";
import { useCompare } from "@/lib/compare-context";
import { secondaryButton, tag } from "@/lib/styles";
import { cn, formatStartingPrice, initials, TIER_LABELS } from "@/lib/utils";
import CompareToggle from "@/components/CompareToggle";
import VerifiedBadge from "@/components/VerifiedBadge";

/** Width of the price/actions column, shared by rows and the header so columns line up. */
const ASIDE_WIDTH = "md:w-60";

/** Continuous ledger: rows separated by hairlines instead of separate boxes. */
export function AgencyLedger({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-ink/80">
      <div className="hidden gap-6 border-b border-mist px-3 py-2 text-xs font-medium text-ink-soft xl:flex">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-6">
          <span>Agency</span>
          <span>Services and packages</span>
        </div>
        <span className={cn("text-right", ASIDE_WIDTH)}>Starting price</span>
      </div>
      {children}
    </div>
  );
}

export default function AgencyCard({
  agency,
  citySlug,
  reason,
}: {
  agency: AgencyListItem;
  citySlug: string;
  /** Optional note shown under the agency, e.g. why it was picked. */
  reason?: ReactNode;
}) {
  const { isSelected } = useCompare();
  const selected = isSelected(agency.id);
  const href = `/${citySlug}/${agency.slug}`;
  const hasPrice = agency.startingPrice != null;

  return (
    <article
      className={cn(
        "flex flex-col gap-4 border-b border-mist px-3 py-5 transition md:flex-row md:items-center md:gap-6",
        selected ? "bg-harbor-light/60 shadow-[inset_3px_0_0_var(--color-harbor)]" : "hover:bg-surface",
      )}
    >
      <div className="min-w-0 flex-1 xl:grid xl:grid-cols-2 xl:items-center xl:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sm bg-harbor text-sm font-semibold text-paper">
            {initials(agency.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link href={href} className="inline-flex min-h-11 items-center font-serif text-lg leading-snug font-semibold text-ink hover:text-harbor lg:min-h-0">
                {agency.name}
              </Link>
              {agency.verified && <VerifiedBadge />}
            </div>
            <p className="mt-0.5 truncate text-sm text-ink-soft">
              {[agency.locality, agency.teamSize && `${agency.teamSize} people`].filter(Boolean).join(" · ") ||
                " "}
            </p>
          </div>
        </div>

        <div className="mt-3 min-w-0 pl-14 xl:mt-0 xl:pl-0">
          <div className="flex flex-wrap gap-1.5">
            {agency.services.slice(0, 3).map((s) => (
              <span key={s.code} className={tag}>
                {s.name}
              </span>
            ))}
            {agency.services.length > 3 && (
              <span className="px-1 py-0.5 text-xs text-ink-soft">+{agency.services.length - 3} more</span>
            )}
          </div>
          {agency.tiersAvailable.length > 0 && (
            <p className="mt-1.5 text-xs text-ink-soft">
              Packages: {agency.tiersAvailable.map((t) => TIER_LABELS[t]).join(" · ")}
            </p>
          )}
        </div>

        {reason && <div className="mt-3 pl-14 text-sm text-ink-soft xl:col-span-2 xl:pl-14">{reason}</div>}
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 pl-14 md:flex-shrink-0 md:flex-col md:items-end md:pl-0",
          ASIDE_WIDTH,
        )}
      >
        <div className="md:text-right">
          <p className="text-xs text-ink-soft">{hasPrice ? "Starting at" : "Pricing"}</p>
          <p className={cn("font-serif text-lg font-semibold", hasPrice ? "text-ink" : "text-ink-soft")}>
            {formatStartingPrice(agency.startingPrice, agency.billing)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CompareToggle item={{ id: agency.id, name: agency.name, slug: agency.slug, citySlug }} />
          <Link href={href} className={cn(secondaryButton, "px-4 lg:min-h-9")}>
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
