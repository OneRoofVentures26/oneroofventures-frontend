import Link from "next/link";

// Unknown city, agency, service or area (the API answered 404).
export default function PublicNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-sm text-ink-soft">
        The agency or city may no longer be listed, or the link may be mistyped.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Browse agencies
        </Link>
        <Link
          href="/quote"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent"
        >
          Get matched quotes
        </Link>
      </div>
    </div>
  );
}
