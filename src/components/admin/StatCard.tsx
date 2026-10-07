export default function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p
        className={
          tone === "warning"
            ? "mt-1.5 text-2xl font-bold text-gold"
            : "mt-1.5 text-2xl font-bold text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="mt-2 h-7 w-12 rounded bg-muted" />
    </div>
  );
}
