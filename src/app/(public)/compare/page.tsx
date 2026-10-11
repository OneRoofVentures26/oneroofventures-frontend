import { Suspense } from "react";
import type { Metadata } from "next";
import { getServices } from "@/lib/api/public";
import CompareClient from "@/components/CompareClient";
import { Container } from "@/components/Container";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Compare Agencies | OneRoof Ventures",
  description: "Compare marketing agencies side by side on Starter, Growth and Pro packages and prices.",
};

export default async function ComparePage() {
  const services = await getServices().catch(() => []);

  return (
    <Container className="pb-12 pt-6 md:pb-16 md:pt-10 lg:pb-20">
      <Suspense fallback={null}>
        <CompareClient services={services} />
      </Suspense>
    </Container>
  );
}
