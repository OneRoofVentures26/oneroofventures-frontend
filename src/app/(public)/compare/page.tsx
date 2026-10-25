import { Suspense } from "react";
import type { Metadata } from "next";
import { getServices } from "@/lib/api/public";
import CompareClient from "@/components/CompareClient";
import { Container } from "@/components/Container";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Compare Agencies | OneRoof Ventures",
  // Selections live in the query string; they're all the same page to search engines.
  alternates: { canonical: "/compare" },
  description: "Compare marketing agencies side by side on Starter, Growth and Pro packages and prices.",
};

export default async function ComparePage() {
  const services = await getServices().catch(() => []);

  return (
    <Container className="pb-12 pt-6 md:pb-16 md:pt-10 lg:pb-20">
      <h1 className="font-display text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-[2.5rem]">
        Compare agencies
      </h1>
      <p className="mb-6 mt-2 max-w-[60ch] text-base text-text-muted sm:mb-8">
        Pick 2–4 agencies from the same city and see their packages and prices side by side.
      </p>
      <Suspense fallback={null}>
        <CompareClient services={services} />
      </Suspense>
    </Container>
  );
}
