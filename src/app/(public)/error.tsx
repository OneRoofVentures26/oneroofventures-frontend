"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-ink">We couldn&apos;t load this page</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Our servers may be waking up or briefly unavailable. Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink transition hover:border-accent"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
