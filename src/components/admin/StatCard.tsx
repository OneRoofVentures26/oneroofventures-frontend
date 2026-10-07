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
    <div className="rounded-sm border border-mist bg-surface p-4 sm:p-5">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p
        className={
          tone === "warning"
            ? "mt-1.5 text-2xl font-semibold text-danger"
            : "mt-1.5 text-2xl font-semibold text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-sm border border-mist bg-surface p-4 sm:p-5">
      <div className="h-3 w-20 rounded-sm bg-mist/70" />
      <div className="mt-2 h-7 w-12 rounded-sm bg-mist/70" />
    </div>
  );
}
