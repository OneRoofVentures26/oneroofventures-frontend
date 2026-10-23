import type { Billing, PriceRange, PublicQuality, ScoreBreakdown, ScoreLabel, ScoreLine, ScorePillar } from "@/lib/api/types";
import { accentBadge, badge } from "@/lib/styles";
import { cn, formatINR } from "@/lib/utils";

/*
 * One Roof Score (Beta) and the public quality data (ratings, case studies,
 * founded year). The score measures how transparent, complete and well
 * reviewed a listing is — not the quality of an agency's work — so the
 * wording here never says "best".
 */

export const SCORE_EXPLAINER =
  "One Roof Score (Beta): how transparent, complete and well reviewed this agency's listing is. It is not a judgement of their work.";

const NEW_EXPLAINER = "New listing: not enough data for a One Roof Score yet.";

function oneDecimal(value: number): string {
  return value.toFixed(1);
}

function plural(n: number, one: string, many: string): string {
  return `${n.toLocaleString("en-IN")} ${n === 1 ? one : many}`;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("h-3.5 w-3.5 flex-shrink-0", className)} fill="currentColor" aria-hidden="true">
      <path d="M10 1.8l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L10 14.5l-5.1 2.7 1.1-5.6L1.8 7.7l5.7-.7L10 1.8z" />
    </svg>
  );
}

/**
 * "One Roof 75.9 Beta" for a scored agency, "New" when there's too little
 * data, nothing when the agency hasn't been scored yet.
 */
export function ScoreBadge({
  score,
  scoreLabel,
  className,
}: {
  score: number | null;
  scoreLabel: ScoreLabel | null;
  className?: string;
}) {
  if (scoreLabel === "Beta" && score != null) {
    return (
      <span title={SCORE_EXPLAINER} className={cn(accentBadge, "gap-1.5", className)}>
        <span className="font-medium">One Roof</span>
        <span className="num">{oneDecimal(score)}</span>
        <span className="rounded bg-accent/20 px-1 text-[11px] font-semibold uppercase tracking-wide">Beta</span>
      </span>
    );
  }
  if (scoreLabel === "New") {
    return (
      <span title={NEW_EXPLAINER} className={cn(badge, "bg-surface-raised text-text-muted", className)}>
        New
      </span>
    );
  }
  return null;
}

/** "★ 4.9 (217 Google reviews)", or the compact "★ 4.9 · 217" for cards. Nothing without a rating. */
export function GoogleRating({
  rating,
  reviews,
  compact = false,
  className,
}: {
  rating: number | null;
  reviews: number | null;
  compact?: boolean;
  className?: string;
}) {
  if (rating == null) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[13px] text-text-muted", className)}>
      <StarIcon className="text-accent" />
      <span className="num font-semibold text-text">{oneDecimal(rating)}</span>
      {reviews != null &&
        (compact ? (
          <span>({reviews.toLocaleString("en-IN")} Google)</span>
        ) : (
          <span>({plural(reviews, "Google review", "Google reviews")})</span>
        ))}
    </span>
  );
}

const pill = "inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface-raised px-3 text-[13px] text-text-muted";

/** Rating, case-study and founded-year badges. Each one is hidden when its value is null. */
export function QualityBadges({ quality, className }: { quality: PublicQuality; className?: string }) {
  const items: React.ReactNode[] = [];

  if (quality.googleRating != null) {
    items.push(
      <li key="google" className={pill}>
        <GoogleRating rating={quality.googleRating} reviews={quality.googleReviews} />
      </li>,
    );
  }
  for (const [key, name, rating, reviews] of [
    ["clutch", "Clutch", quality.clutchRating, quality.clutchReviews],
    ["goodfirms", "GoodFirms", quality.goodFirmsRating, quality.goodFirmsReviews],
  ] as const) {
    if (rating == null) continue;
    items.push(
      <li key={key} className={pill}>
        <StarIcon className="text-accent" />
        <span className="num font-semibold text-text">{oneDecimal(rating)}</span>
        <span>
          on {name}
          {reviews != null ? ` (${plural(reviews, "review", "reviews")})` : ""}
        </span>
      </li>,
    );
  }
  if (quality.caseStudies != null && quality.caseStudies > 0) {
    const label = (
      <>
        <span className="num font-semibold text-text">{quality.caseStudies}</span>
        {quality.caseStudies === 1 ? " case study" : " case studies"}
        {quality.resultsShown ? " with results" : ""}
      </>
    );
    items.push(
      <li key="cases" className={pill}>
        {quality.caseStudyUrl ? (
          <a href={quality.caseStudyUrl} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-primary-text">
            {label} ↗
          </a>
        ) : (
          <span>{label}</span>
        )}
      </li>,
    );
  }
  if (quality.foundedYear != null) {
    items.push(
      <li key="founded" className={pill}>
        Since <span className="num font-semibold text-text">{quality.foundedYear}</span>
      </li>,
    );
  }

  if (items.length === 0) return null;
  return <ul className={cn("flex flex-wrap gap-2", className)}>{items}</ul>;
}

const PILLARS: Array<{ key: ScorePillar; label: string }> = [
  { key: "transparency", label: "Price transparency" },
  { key: "profile", label: "Profile" },
  { key: "reputation", label: "Reputation" },
];

function LineMark({ line }: { line: ScoreLine }) {
  if (line.points >= line.max) {
    return <span className="w-4 flex-shrink-0 text-center font-bold text-success-text" aria-label="Met">✓</span>;
  }
  if (line.points > 0) {
    return <span className="w-4 flex-shrink-0 text-center font-bold text-accent-text" aria-label="Partly met">◐</span>;
  }
  return <span className="w-4 flex-shrink-0 text-center text-text-muted" aria-label="Not met">✗</span>;
}

/**
 * Profile panel: the score, the pillar bars and the facts behind them
 * (collapsed). For "New" agencies a short note; nothing when not scored.
 */
export function ScorePanel({
  score,
  scoreLabel,
  breakdown,
  className,
}: {
  score: number | null;
  scoreLabel: ScoreLabel | null;
  breakdown: ScoreBreakdown | null;
  className?: string;
}) {
  if (scoreLabel === "New") {
    return (
      <div className={cn("rounded-2xl border border-border bg-surface p-5 sm:p-6", className)}>
        <div className="flex items-center gap-2">
          <h2 className="text-card font-semibold text-text">One Roof Score</h2>
          <ScoreBadge score={null} scoreLabel="New" />
        </div>
        <p className="mt-2 max-w-[60ch] text-sm text-text-muted">
          We don&apos;t have enough checked facts about this agency yet to score its listing. Scores appear
          once at least 3 of these are known: Google rating, founded year, case studies, a live website check
          and a recent review date.
        </p>
      </div>
    );
  }
  if (scoreLabel !== "Beta" || score == null || !breakdown) return null;

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-10">
        <div className="sm:w-56 sm:flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-card font-semibold text-text">One Roof Score</h2>
            <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-text">
              Beta
            </span>
          </div>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="num text-5xl font-bold text-text">{oneDecimal(score)}</span>
            <span className="text-sm text-text-muted">/ 100</span>
          </p>
          <p className="mt-2 text-[13px] leading-5 text-text-muted">
            How transparent, complete and well reviewed this listing is — not a judgement of the agency&apos;s work.
          </p>
        </div>

        <ScoreBreakdownView breakdown={breakdown} className="min-w-0 flex-1" />
      </div>
    </div>
  );
}

/**
 * Pillar bars and the facts behind them (collapsed). Shared by the profile and the admin.
 * Quote-only agencies aren't scored on transparency, so that pillar is shown as not applicable.
 */
export function ScoreBreakdownView({
  breakdown,
  showPoints = false,
  defaultOpen = false,
  className,
}: {
  breakdown: ScoreBreakdown;
  /** Admin: raw points per fact, e.g. "13.2 / 14". */
  showPoints?: boolean;
  defaultOpen?: boolean;
  className?: string;
}) {
  const groups = PILLARS.map((pillar) => ({
    pillar,
    lines: breakdown.lines.filter((l) => l.pillar === pillar.key),
  })).filter((g) => g.lines.length > 0);

  return (
    <div className={cn("space-y-4", className)}>
      {PILLARS.map((p) => {
        const value = breakdown[p.key];
        const max = breakdown.maxPoints[p.key];
        if (value == null || max == null) {
          return (
            <div key={p.key} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-text">{p.label}</span>
              <span className="text-[13px] text-text-muted">Not applicable: prices on request</span>
            </div>
          );
        }
        return (
          <div key={p.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-text">{p.label}</span>
              <span className="num text-text-muted">
                <span className="font-semibold text-text">{oneDecimal(value)}</span> / {oneDecimal(max)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0}%` }}
              />
            </div>
          </div>
        );
      })}

      <details open={defaultOpen} className="group border-t border-border pt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-medium text-primary-text [&::-webkit-details-marker]:hidden">
          What goes into it
          <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className={cn("mt-1 grid gap-4", groups.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {groups.map(({ pillar: p, lines }) => (
            <ul key={p.key} className="space-y-1.5">
              <li className="text-[13px] font-semibold text-text">{p.label}</li>
              {lines.map((line) => (
                  <li key={line.code} className="flex gap-2 text-[13px] leading-5 text-text-muted">
                    <LineMark line={line} />
                    <span>
                      {line.label}
                      {showPoints && (
                        <span className="num ml-1 whitespace-nowrap text-text">
                          {oneDecimal(line.points)} / {oneDecimal(line.max)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          ))}
        </div>
      </details>
    </div>
  );
}

function per(billing: Billing): string {
  return billing === "ONE_TIME" ? " one-time" : " / month";
}

/**
 * The city's typical starting price for a tier, for quote-only agencies.
 * Always labelled as the city's price; nothing when there's no range.
 */
export function CityRangeNote({
  range,
  cityName,
  className,
}: {
  range: PriceRange | null | undefined;
  cityName: string | null;
  className?: string;
}) {
  if (!range) return null;
  const where = cityName ? `in ${cityName}` : "in this city";
  return (
    <p className={cn("text-[13px] leading-5 text-text-muted", className)}>
      Typical {where}:{" "}
      <span className="num font-semibold text-text">
        {formatINR(range.p25)} to {formatINR(range.p75)}
      </span>
      {per(range.billing)} (median <span className="num">{formatINR(range.median)}</span>)
    </p>
  );
}
