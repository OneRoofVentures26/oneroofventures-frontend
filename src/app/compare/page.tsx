import { Suspense } from "react";
import type { Metadata } from "next";
import CompareClient from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Compare Agencies | OneRoof Ventures",
  description: "Compare marketing agencies side by side on price, services, ratings and more.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <CompareClient />
      </Suspense>
    </div>
  );
}
