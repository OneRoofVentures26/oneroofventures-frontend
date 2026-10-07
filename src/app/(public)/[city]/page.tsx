import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getLocalities, getServices } from "@/lib/api/public";
import CityPageClient from "@/components/CityPageClient";
import CityLinks from "@/components/CityLinks";

export const revalidate = 300;

export async function generateStaticParams() {
  const cities = await getCities().catch(() => []);
  return cities.map((c) => ({ city: c.slug }));
}

async function findCity(slug: string) {
  const cities = await getCities();
  return cities.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/[city]">): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await findCity(citySlug).catch(() => undefined);
  if (!city) return {};
  return {
    title: `Top Marketing Agencies in ${city.name} | OneRoof Ventures`,
    description: `Compare marketing agencies in ${city.name} on published prices, packages and services. Get quotes from your shortlist for free.`,
  };
}

// Static (ISR): the quiz answers in ?service=&budget= are read on the client.
export default async function CityPage({ params }: PageProps<"/[city]">) {
  const { city: citySlug } = await params;
  const city = await findCity(citySlug);
  if (!city) notFound();

  const [services, localities] = await Promise.all([getServices(), getLocalities(city.slug).catch(() => [])]);

  if (city.agencyCount === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink">Agencies in {city.name} are coming soon</h1>
        <p className="mt-3 text-sm text-ink-soft">
          We&apos;re researching our first batch of agencies in {city.name}. Tell us what you need and
          we&apos;ll match you with agencies as soon as they&apos;re listed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/quote?city=${city.slug}`}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Get matched quotes
          </Link>
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

  return (
    <>
      <Suspense fallback={<CityPageSkeleton />}>
        <CityPageClient city={city} services={services} localities={localities} />
      </Suspense>
      <CityLinks city={city} services={services} localities={localities} />
    </>
  );
}

function CityPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-64 rounded-2xl border border-border bg-surface" />
    </div>
  );
}
