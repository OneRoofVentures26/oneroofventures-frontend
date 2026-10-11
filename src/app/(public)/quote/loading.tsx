// Shown while the quote page renders on the server, e.g. when the backend is waking up.
// Kept out of the city/agency routes on purpose: a loading boundary makes their 404s stream as 200.
import { Container } from "@/components/Container";

export default function Loading() {
  return (
    <Container className="pb-12 pt-6 md:pb-16 md:pt-10 lg:pb-20">
      <div aria-busy="true" aria-live="polite" className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-3 lg:col-span-4">
          <div className="h-8 w-2/3 rounded-lg bg-border" />
          <div className="h-4 w-full rounded bg-border" />
        </div>
        <div className="space-y-4 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-11 rounded-xl border border-border bg-surface" />
            ))}
          </div>
          <div className="h-24 rounded-xl border border-border bg-surface" />
        </div>
      </div>
      <p className="mt-6 text-[13px] text-text-muted">Loading the quote form… this can take a little longer on the first visit.</p>
    </Container>
  );
}
