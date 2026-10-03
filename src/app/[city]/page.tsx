import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CITIES, getCityBySlug } from "@/lib/data/cities";
import { getAgenciesByCity } from "@/lib/data/agencies";
import CityPageClient from "@/components/CityPageClient";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title: `Top Marketing Agencies in ${city.name} | OneRoof Ventures`,
    description: city.tagline,
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const agencies = getAgenciesByCity(city.slug);

  if (agencies.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink">
          Agencies in {city.name} are coming soon
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          We&apos;re verifying our first batch of agencies in {city.name}.
          In the meantime, explore cities that are already live.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return <CityPageClient city={city} agencies={agencies} />;
}
