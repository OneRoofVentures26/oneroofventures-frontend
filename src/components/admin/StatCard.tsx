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
    // Value pinned to the bottom so values line up across a row even when a label wraps.
    <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-surface p-4 sm:p-5">
      <p className="text-sm font-medium leading-snug text-text-muted">{label}</p>
      <p
        className={
          tone === "warning"
            ? "mt-1.5 text-2xl font-semibold text-danger"
            : "mt-1.5 text-2xl font-semibold text-text"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="h-3 w-20 rounded-lg bg-border/70" />
      <div className="mt-2 h-7 w-12 rounded-lg bg-border/70" />
    </div>
  );
}
