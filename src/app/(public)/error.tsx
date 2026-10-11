"use client";

import { useEffect } from "react";
import { primaryButton, secondaryButton } from "@/lib/styles";
import Link from "next/link";
import { Container } from "@/components/Container";

export default function PublicError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="section-y">
      <h1 className="font-display text-section-sm font-semibold text-text md:text-section">We couldn&apos;t load this page</h1>
      <p className="mt-3 max-w-[60ch] text-base text-text-muted">
        Our servers may be waking up or briefly unavailable. Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className={primaryButton}
        >
          Try again
        </button>
        <Link
          href="/"
          className={secondaryButton}
        >
          Back to home
        </Link>
      </div>
    </Container>
  );
}
