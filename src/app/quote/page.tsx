import { Suspense } from "react";
import type { Metadata } from "next";
import QuoteClient from "@/components/QuoteClient";

export const metadata: Metadata = {
  title: "Request a Quote | OneRoof Ventures",
  description: "Send one quote request to several shortlisted marketing agencies at once.",
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink">Request a quote</h1>
      <p className="mt-1 mb-6 text-sm text-ink-soft">
        One short form, sent to every agency you&apos;ve shortlisted. It&apos;s
        free, always.
      </p>
      <Suspense fallback={null}>
        <QuoteClient />
      </Suspense>
    </div>
  );
}
