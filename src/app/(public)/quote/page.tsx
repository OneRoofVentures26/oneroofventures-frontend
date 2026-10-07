import type { Metadata } from "next";
import { getAgencyProfile, getCities, getLocalities, getServices } from "@/lib/api/public";
import type { AgencyProfile } from "@/lib/api/types";
import QuoteRequestForm from "@/components/QuoteRequestForm";

export const metadata: Metadata = {
  title: "Request a Quote | OneRoof Ventures",
  description: "Send one quote request to your shortlisted marketing agencies, or let us match you with the right ones.",
};

const MAX_AGENCIES = 5;

function param(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const sp = await searchParams;
  const [cities, services] = await Promise.all([getCities(), getServices()]);

  const citySlug = param(sp.city);
  const city = cities.find((c) => c.slug === citySlug) ?? (cities.length === 1 ? cities[0] : undefined);

  // Agencies are passed by slug: the public API has no lookup by id.
  const agencySlugs = (param(sp.agency) ?? param(sp.agencies) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_AGENCIES);

  const [profiles, localities] = await Promise.all([
    city
      ? Promise.all(agencySlugs.map((slug) => getAgencyProfile(city.slug, slug).catch(() => null)))
      : Promise.resolve([]),
    city ? getLocalities(city.slug).catch(() => []) : Promise.resolve([]),
  ]);
  const agencies = profiles.filter((p): p is AgencyProfile => p !== null);

  const packageId = Number(param(sp.package));
  const serviceSlug = param(sp.service);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink">
        {agencies.length > 0 ? "Request a quote" : "Get matched with agencies"}
      </h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">
        {agencies.length > 0
          ? "One short form, sent to every agency you've picked. It's free, always."
          : "Tell us what you need and we'll send your brief to up to 3 agencies that fit. It's free, always."}
      </p>
      <QuoteRequestForm
        cities={cities}
        services={services}
        initialCitySlug={city?.slug ?? ""}
        initialLocalities={localities}
        initialAgencies={agencies}
        initialPackageId={Number.isInteger(packageId) && packageId > 0 ? packageId : null}
        initialServiceSlug={serviceSlug && services.some((s) => s.slug === serviceSlug) ? serviceSlug : ""}
        missingAgencies={agencySlugs.length - agencies.length}
      />
    </div>
  );
}
