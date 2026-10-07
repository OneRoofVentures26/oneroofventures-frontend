import { Suspense } from "react";
import type { Metadata } from "next";
import { getServices } from "@/lib/api/public";
import CompareClient from "@/components/CompareClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Compare Agencies | OneRoof Ventures",
  description: "Compare marketing agencies side by side on Starter, Growth and Pro packages and prices.",
};

export default async function ComparePage() {
  const services = await getServices().catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <CompareClient services={services} />
      </Suspense>
    </div>
  );
}
