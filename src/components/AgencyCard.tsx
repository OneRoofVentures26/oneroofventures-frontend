"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { AgencyListItem } from "@/lib/api/types";
import { useCompare } from "@/lib/compare-context";
import { card, secondaryButton, tag } from "@/lib/styles";
import { cn, formatStartingPrice, initials, TIER_LABELS } from "@/lib/utils";
import CompareToggle from "@/components/CompareToggle";
import VerifiedBadge from "@/components/VerifiedBadge";
import { GoogleRating, ScoreBadge } from "@/components/AgencyQuality";

/**
 * Card grid for agencies: 1 column, 2 from 640px, 3 from 1024px. `withSidebar`
 * waits until 1280px for the third column, when the list shares the row with
 * the filter sidebar. Cards stretch to equal heights within a row.
 */
export function AgencyCardGrid({ children, withSidebar = false }: { children: ReactNode; withSidebar?: boolean }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4", withSidebar ? "xl:grid-cols-3" : "lg:grid-cols-3")}>
      {children}
    </div>
  );
}

/**
 * Compact agency card:
 * 1. initials, name (wraps, never truncated), Verified
 * 2. area · team size
 * 3. One Roof Score and Google rating, when known
 * 4. up to 3 service chips on one row, then "+N"
 * 5. starting price (never truncated) and packages
 * 6. "+ Compare" and "View profile", equal width
 */
/** Roughly one row of chips on the narrowest card (~300px at 13px). */
const CHIP_CHAR_BUDGET = 24;

/** Up to 3 services, but only as many as fit on one row; the rest become "+N". Always at least one. */
function chipsThatFit<T extends { name: string }>(services: T[]): T[] {
  const shown: T[] = [];
  let used = 0;
  for (const s of services.slice(0, 3)) {
    if (shown.length > 0 && used + s.name.length > CHIP_CHAR_BUDGET) break;
    shown.push(s);
    used += s.name.length + 3;
  }
  return shown;
}

export default function AgencyCard({
  agency,
  citySlug,
  reason,
}: {
  agency: AgencyListItem;
  citySlug: string;
  /** Optional note shown under the services, e.g. why it was picked. */
  reason?: ReactNode;
}) {
  const { isSelected } = useCompare();
  const selected = isSelected(agency.id);
  const href = `/${citySlug}/${agency.slug}`;
  const hasPrice = agency.startingPrice != null;
  const meta = [agency.locality, agency.teamSize && `${agency.teamSize} people`].filter(Boolean).join(" · ");
  const shownServices = chipsThatFit(agency.services);
  const extraServices = agency.services.length - shownServices.length;

  return (
    <article
      className={cn(
        card,
        "flex h-full flex-col p-3.5 transition-[border-color,box-shadow] duration-200 sm:p-4",
        selected ? "border-primary/60 ring-1 ring-inset ring-primary/30" : "hover:border-primary/30 hover:shadow-card-hover",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/8 font-display text-sm font-bold text-primary-text">
          {initials(agency.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-base font-semibold leading-snug text-text">
            <Link href={href} className="hover:text-primary-text">
              {agency.name}
            </Link>
            {/* Inline after the name, so long names use the full row before wrapping. */}
            {agency.verified && <VerifiedBadge className="ml-1.5 align-[2px]" />}
          </h3>
          {meta && <p className="text-[13px] leading-5 text-text-muted">{meta}</p>}
        </div>
      </div>

      {(agency.scoreLabel || agency.googleRating != null) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <ScoreBadge score={agency.score} scoreLabel={agency.scoreLabel} />
          <GoogleRating rating={agency.googleRating} reviews={agency.googleReviews} compact />
        </div>
      )}

      {agency.services.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 [&>span]:leading-5">
          {shownServices.map((s) => (
            <span key={s.code} className={tag}>
              {s.name}
            </span>
          ))}
          {extraServices > 0 && <span className={tag}>+{extraServices}</span>}
        </div>
      )}

      {reason && <p className="mt-2.5 text-[13px] leading-5 text-text-muted">{reason}</p>}

      <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 pt-2.5">
        <p className="whitespace-nowrap">
          <span className="text-[13px] text-text-muted">{hasPrice ? "From " : ""}</span>
          <span className={cn("num text-base font-semibold", hasPrice ? "text-text" : "text-text-muted")}>
            {formatStartingPrice(agency.startingPrice, agency.billing)}
          </span>
        </p>
        {agency.tiersAvailable.length > 0 && (
          <p className="text-[13px] text-text-muted">{agency.tiersAvailable.map((t) => TIER_LABELS[t]).join(" · ")}</p>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <CompareToggle item={{ id: agency.id, name: agency.name, slug: agency.slug, citySlug }} />
        <Link href={href} className={cn(secondaryButton, "w-full whitespace-nowrap px-2")}>
          View profile
        </Link>
      </div>
    </article>
  );
}
