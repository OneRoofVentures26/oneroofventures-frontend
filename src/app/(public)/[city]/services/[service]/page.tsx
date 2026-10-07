import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCities, getLocalities, getServices, getSitemapEntries, listAgencies } from "@/lib/api/public";
import { gridParams } from "@/lib/grid";
import CityListingLanding from "@/components/CityListingLanding";

export const revalidate = 300;

export async function generateStaticParams() {
  const entries = await getSitemapEntries().catch(() => null);
  return (entries?.cityServices ?? [])
    .filter((e) => e.serviceSlug)
    .map((e) => ({ city: e.citySlug, service: e.serviceSlug as string }));
}

async function load(citySlug: string, serviceSlug: string) {
  const [cities, services] = await Promise.all([getCities(), getServices()]);
  const city = cities.find((c) => c.slug === citySlug);
  const service = services.find((s) => s.slug === serviceSlug);
  return { city, service, services };
}

export async function generateMetadata({ params }: PageProps<"/[city]/services/[service]">): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const { city, service } = await load(citySlug, serviceSlug).catch(() => ({ city: undefined, service: undefined }));
  if (!city || !service) return {};
  return {
    title: `${service.name} Agencies in ${city.name} — Prices & Packages | OneRoof Ventures`,
    description: `Compare ${service.name} agencies in ${city.name} on published prices and Starter, Growth and Pro packages. Request quotes for free.`,
  };
}

export default async function CityServicePage({ params }: PageProps<"/[city]/services/[service]">) {
  const { city: citySlug, service: serviceSlug } = await params;
  const { city, service, services } = await load(citySlug, serviceSlug);
  if (!city || !service) notFound();

  const filters = { service: service.slug };
  const [localities, initialData] = await Promise.all([
    getLocalities(city.slug).catch(() => []),
    listAgencies(city.slug, gridParams(filters)),
  ]);

  return (
    <CityListingLanding
      city={city}
      services={services}
      localities={localities}
      filters={filters}
      initialData={initialData}
      title={`${service.name} agencies in ${city.name}`}
      intro={`${initialData.total} agenc${initialData.total === 1 ? "y offers" : "ies offer"} ${service.name} in ${city.name}. Compare their packages side by side and request quotes from your shortlist.`}
    />
  );
}
