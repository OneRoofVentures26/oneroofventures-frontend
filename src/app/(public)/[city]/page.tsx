import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCities, getLocalities, getServices, getSitemapEntries, listAgencies } from "@/lib/api/public";
import type { SitemapEntries } from "@/lib/api/types";
import { gridParams } from "@/lib/grid";
import { Container } from "@/components/Container";
import CityListingLanding from "@/components/CityListingLanding";
import { ctaButton, secondaryButton } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

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

// Static (ISR): every agency in the city is rendered on the server, so the list
// shows at once. Filters run in the browser.
export default async function CityPage({ params }: PageProps<"/[city]">) {
  const { city: citySlug } = await params;
  const city = await findCity(citySlug);
  if (!city) notFound();

  const [services, localities, entries, initialData] = await Promise.all([
    getServices(),
    getLocalities(city.slug).catch(() => []),
    getSitemapEntries().catch(() => null),
    city.agencyCount > 0 ? listAgencies(city.slug, gridParams()) : null,
  ]);

  if (!initialData || initialData.total === 0) {
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

  const updatedAt = lastUpdated(entries, city.slug);
  return (
    <CityListingLanding
      city={city}
      services={services}
      localities={localities}
      filters={{}}
      initialData={initialData}
      title={`Marketing agencies in ${city.name}`}
      intro={`${initialData.total} agenc${initialData.total === 1 ? "y" : "ies"} listed with published prices and packages${
        updatedAt ? ` · updated ${formatDate(updatedAt)}` : ""
      }. Filter by service, area and budget, shortlist up to 4 and request quotes.`}
    />
  );
}
