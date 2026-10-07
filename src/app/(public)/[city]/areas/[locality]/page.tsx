import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCities, getLocalities, getServices, getSitemapEntries, listAgencies } from "@/lib/api/public";
import { isNotFound } from "@/lib/api/http";
import { gridParams } from "@/lib/grid";
import CityListingLanding from "@/components/CityListingLanding";

export const revalidate = 300;

export async function generateStaticParams() {
  const entries = await getSitemapEntries().catch(() => null);
  return (entries?.cityLocalities ?? [])
    .filter((e) => e.localitySlug)
    .map((e) => ({ city: e.citySlug, locality: e.localitySlug as string }));
}

async function load(citySlug: string, localitySlug: string) {
  const cities = await getCities();
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) return { city: undefined, locality: undefined, localities: [] };
  const localities = await getLocalities(city.slug).catch((err) => {
    if (isNotFound(err)) return [];
    throw err;
  });
  return { city, locality: localities.find((l) => l.slug === localitySlug), localities };
}

export async function generateMetadata({ params }: PageProps<"/[city]/areas/[locality]">): Promise<Metadata> {
  const { city: citySlug, locality: localitySlug } = await params;
  const { city, locality } = await load(citySlug, localitySlug).catch(() => ({ city: undefined, locality: undefined }));
  if (!city || !locality) return {};
  return {
    title: `Marketing Agencies in ${locality.name}, ${city.name} | OneRoof Ventures`,
    description: `Compare marketing agencies based in ${locality.name}, ${city.name} on published prices and packages. Request quotes for free.`,
  };
}

export default async function CityLocalityPage({ params }: PageProps<"/[city]/areas/[locality]">) {
  const { city: citySlug, locality: localitySlug } = await params;
  const { city, locality, localities } = await load(citySlug, localitySlug);
  if (!city || !locality) notFound();

  const filters = { locality: locality.slug };
  const [services, initialData] = await Promise.all([getServices(), listAgencies(city.slug, gridParams(filters))]);

  return (
    <CityListingLanding
      city={city}
      services={services}
      localities={localities}
      filters={filters}
      initialData={initialData}
      title={`Marketing agencies in ${locality.name}, ${city.name}`}
      intro={`${initialData.total} agenc${initialData.total === 1 ? "y is" : "ies are"} based in ${locality.name}. Compare their packages side by side and request quotes from your shortlist.`}
    />
  );
}
