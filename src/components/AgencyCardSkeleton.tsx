export default function AgencyCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 flex-shrink-0 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="h-3 w-1/4 rounded bg-muted" />
        </div>
      </div>

      <div className="mt-4 flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="h-10 w-24 rounded-full bg-muted" />
        <div className="h-8 w-16 rounded bg-muted" />
      </div>

      <div className="mt-4 h-9 w-full rounded-lg bg-muted" />
    </div>
  );
}
