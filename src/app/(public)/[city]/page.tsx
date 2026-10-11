import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getLocalities, getServices, getSitemapEntries } from "@/lib/api/public";
import type { SitemapEntries } from "@/lib/api/types";
import { Container } from "@/components/Container";
import CityPageClient from "@/components/CityPageClient";
import CityLinks from "@/components/CityLinks";
import { ctaButton, secondaryButton } from "@/lib/styles";

export const revalidate = 300;

export async function generateStaticParams() {
  const cities = await getCities().catch(() => []);
  return cities.map((c) => ({ city: c.slug }));
}

/** Most recent update to the city or any of its agencies, from the sitemap feed. */
function lastUpdated(entries: SitemapEntries | null, citySlug: string): string | null {
  if (!entries) return null;
  const dates = [...entries.cities, ...entries.agencies]
    .filter((e) => e.citySlug === citySlug && e.updatedAt)
    .map((e) => e.updatedAt as string)
    .sort();
  return dates.at(-1) ?? null;
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

  const [services, localities, entries] = await Promise.all([
    getServices(),
    getLocalities(city.slug).catch(() => []),
    getSitemapEntries().catch(() => null),
  ]);

  if (city.agencyCount === 0) {
    return (
      <Container className="section-y">
        <h1 className="max-w-[24ch] font-display text-section-sm font-semibold text-text md:text-section">
          Agencies in {city.name} are coming soon
        </h1>
        <p className="mt-3 max-w-[60ch] text-base text-text-muted">
          We&apos;re researching our first batch of agencies in {city.name}. Tell us what you need and
          we&apos;ll match you with agencies as soon as they&apos;re listed.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/quote?city=${city.slug}`} className={ctaButton}>
            Get matched quotes
          </Link>
          <Link href="/" className={secondaryButton}>
            Back to home
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Suspense fallback={<CityPageSkeleton />}>
        <CityPageClient city={city} services={services} localities={localities} updatedAt={lastUpdated(entries, city.slug)} />
      </Suspense>
      <CityLinks city={city} services={services} localities={localities} />
    </>
  );
}

function CityPageSkeleton() {
  return (
    <Container className="animate-pulse pb-12 pt-6 md:pt-8">
      <div className="h-9 w-2/3 max-w-md rounded-lg bg-border" />
      <div className="mt-3 h-4 w-1/2 max-w-xs rounded bg-border" />
      <div className="mt-8 h-72 rounded-2xl border border-border bg-surface lg:ml-auto lg:w-7/12" />
    </Container>
  );
}
