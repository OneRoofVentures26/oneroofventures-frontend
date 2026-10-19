import type { Metadata } from "next";
import { getAgencyProfile, getCities, getLocalities, getServices } from "@/lib/api/public";
import type { AgencyProfile } from "@/lib/api/types";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { Container } from "@/components/Container";
import { sectionTitle } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Request a Quote | OneRoof Ventures",
  description: "Send one quote request to your shortlisted marketing agencies, or let us match you with the right ones.",
};

const MAX_AGENCIES = 5;

const NEXT_STEPS = [
  "Fill in the short form — about a minute.",
  "We send your brief to the agencies you picked (or the best matches).",
  "They reply to you directly with a quote.",
];

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
  const budget = param(sp.budget);

  return (
    <Container className="grid grid-cols-1 gap-6 pb-12 pt-6 md:pb-16 md:pt-10 lg:pb-20 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <h1 className={sectionTitle}>
          {agencies.length > 0 ? "Request a quote" : "Get matched with agencies"}
        </h1>
        <p className="mt-2 text-base text-text-muted">
          {agencies.length > 0
            ? "One short form, sent to every agency you've picked. It's free, always."
            : "Tell us what you need and we'll send your brief to up to 3 agencies that fit. It's free, always."}
        </p>
        <ol className="mt-6 hidden space-y-3 text-sm text-text-muted lg:block">
          {NEXT_STEPS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="num flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-border bg-surface text-[13px] font-bold text-primary-text">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="min-w-0 lg:col-span-8">
      <QuoteRequestForm
        cities={cities}
        services={services}
        initialCitySlug={city?.slug ?? ""}
        initialLocalities={localities}
        initialAgencies={agencies}
        initialPackageId={Number.isInteger(packageId) && packageId > 0 ? packageId : null}
        initialServiceSlug={serviceSlug && services.some((s) => s.slug === serviceSlug) ? serviceSlug : ""}
        initialBudget={budget && /^\d{1,9}$/.test(budget) ? budget : ""}
        missingAgencies={agencySlugs.length - agencies.length}
      />
      </div>
    </Container>
  );
}
