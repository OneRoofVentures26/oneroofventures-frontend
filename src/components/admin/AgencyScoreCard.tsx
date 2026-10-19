"use client";

import type { AgencyResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils";
import { ScoreBreakdownView } from "@/components/AgencyQuality";

/** Facts needed (of 5) before the score is shown on the public site. */
const PUBLIC_THRESHOLD = 3;
const KEY_FACTS = 5;

/**
 * One Roof Score as the admin sees it: the stored score and breakdown even for
 * "New" agencies (hidden publicly), how many key facts are known, and when it
 * was computed. Read-only: scores update by themselves after every change.
 */
export default function AgencyScoreCard({ agency }: { agency: AgencyResponse }) {
  const { score, scoreLabel, scoreBreakdown, knownInputs, formulaVersion, computedAt } = agency;

  if (!computedAt && score == null) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-lg text-text">One Roof Score</h2>
        <p className="mt-1 text-sm text-text-muted">
          Not scored yet. Scores appear a few seconds after an agency is saved, and are recomputed every night.
        </p>
      </section>
    );
  }

  const isPublic = scoreLabel === "Beta";

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg text-text">One Roof Score</h2>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="num text-4xl font-bold text-text">{score != null ? score.toFixed(1) : "—"}</span>
            <span className="text-sm text-text-muted">/ 100</span>
          </p>
        </div>
        <span
          className={
            isPublic
              ? "rounded-lg bg-success/12 px-2 py-0.5 text-[13px] font-semibold text-success-text"
              : "rounded-lg bg-surface-raised px-2 py-0.5 text-[13px] font-semibold text-text-muted"
          }
        >
          {isPublic ? "Shown on site (Beta)" : scoreLabel === "New" ? "Hidden on site — shows as “New”" : "Not public"}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-[13px] sm:grid-cols-3">
        <div>
          <dt className="inline text-text-muted">Key facts known: </dt>
          <dd className="num inline font-semibold text-text">
            {knownInputs ?? "—"} / {KEY_FACTS}
          </dd>
          {knownInputs != null && knownInputs < PUBLIC_THRESHOLD && (
            <p className="text-text-muted">
              {PUBLIC_THRESHOLD - knownInputs} more needed to show publicly
            </p>
          )}
        </div>
        <div>
          <dt className="inline text-text-muted">Formula: </dt>
          <dd className="inline font-semibold text-text">{formulaVersion ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline text-text-muted">Computed: </dt>
          <dd className="inline font-semibold text-text">{computedAt ? formatDateTime(computedAt) : "—"}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[13px] text-text-muted">
        Key facts: Google rating, founded year, case studies, website checked live, last checked date. Saving
        changes rescores within a few seconds.
      </p>

      {scoreBreakdown && <ScoreBreakdownView breakdown={scoreBreakdown} showPoints defaultOpen className="mt-5" />}
    </section>
  );
}
