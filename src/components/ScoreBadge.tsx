import type { ScoreBreakdown } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  breakdown: ScoreBreakdown;
  size?: "sm" | "md" | "lg";
}

function tier(score: number): { label: string; ring: string } {
  if (score >= 90) return { label: "Excellent", ring: "ring-accent/30" };
  if (score >= 80) return { label: "Very Good", ring: "ring-accent/20" };
  if (score >= 70) return { label: "Good", ring: "ring-gold/30" };
  return { label: "Fair", ring: "ring-border" };
}

export default function ScoreBadge({ score, breakdown, size = "md" }: ScoreBadgeProps) {
  const { label, ring } = tier(score);
  const dims =
    size === "lg" ? "w-16 h-16 text-xl" : size === "sm" ? "w-10 h-10 text-sm" : "w-12 h-12 text-base";

  const rows: Array<[string, number]> = [
    ["Ratings", breakdown.ratings],
    ["Retention", breakdown.retention],
    ["Results", breakdown.results],
    ["Response time", breakdown.responseTime],
  ];

  return (
    <div className="group relative inline-flex items-center gap-2">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-full bg-accent text-white font-bold ring-4",
          ring,
          dims,
        )}
      >
        {score}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-semibold text-ink">OneRoof Score</span>
        <span className="text-xs text-ink-soft">{label}</span>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 max-w-[85vw] -translate-x-1/2 origin-top scale-95 rounded-lg border border-border bg-surface p-3 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
        <p className="mb-2 text-xs font-semibold text-ink">Score breakdown</p>
        <dl className="space-y-1.5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3">
              <dt className="text-xs text-ink-soft">{k}</dt>
              <dd className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${v}%` }} />
                </div>
                <span className="w-7 text-right text-xs font-medium text-ink">{v}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
