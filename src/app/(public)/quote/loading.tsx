// Shown while the quote page renders on the server, e.g. when the backend is waking up.
// Kept out of the city/agency routes on purpose: a loading boundary makes their 404s stream as 200.
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-2xl animate-pulse space-y-4">
        <div className="h-8 w-1/2 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-md border border-border bg-surface" />
          ))}
        </div>
        <div className="h-24 rounded-md border border-border bg-surface" />
      </div>
      <p className="mt-6 text-center text-xs text-ink-soft">Loading the quote form… this can take a little longer on the first visit.</p>
    </div>
  );
}
