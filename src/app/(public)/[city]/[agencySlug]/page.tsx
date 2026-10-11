import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAgencyProfile, getSitemapEntries } from "@/lib/api/public";
import { isNotFound } from "@/lib/api/http";
import { TIERS, type AgencyProfile } from "@/lib/api/types";
import { formatDate, formatPackagePrice, initials, PRICING_TYPE_LABELS, shortSentence, TIER_LABELS } from "@/lib/utils";
import { chip, ctaButton, primaryButton, secondaryButton, sectionTitle } from "@/lib/styles";
import { Container } from "@/components/Container";
import PricingPackageCard from "@/components/PricingPackageCard";
import CompareToggle from "@/components/CompareToggle";
import CompareBar from "@/components/CompareBar";
import StickyActionBar from "@/components/StickyActionBar";
import VerifiedBadge from "@/components/VerifiedBadge";

export const revalidate = 300;

export async function generateStaticParams() {
  const entries = await getSitemapEntries().catch(() => null);
  return (entries?.agencies ?? [])
    .filter((e) => e.agencySlug)
    .map((e) => ({ city: e.citySlug, agencySlug: e.agencySlug as string }));
}

async function loadProfile(citySlug: string, agencySlug: string): Promise<AgencyProfile | null> {
  try {
    return await getAgencyProfile(citySlug, agencySlug);
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps<"/[city]/[agencySlug]">): Promise<Metadata> {
  const { city, agencySlug } = await params;
  const agency = await loadProfile(city, agencySlug).catch(() => null);
  if (!agency) return {};
  return {
    title: `${agency.name} — ${agency.city.name} Prices & Packages | OneRoof Ventures`,
    description:
      agency.description ??
      `${agency.name} in ${agency.city.name}: services, published packages and prices. Request a free quote.`,
  };
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function AgencyProfilePage({ params }: PageProps<"/[city]/[agencySlug]">) {
  const { city: citySlug, agencySlug } = await params;
  const agency = await loadProfile(citySlug, agencySlug);
  if (!agency) notFound();

  const quoteBase = `/quote?city=${agency.city.slug}&agency=${agency.slug}`;
  const compareItem = { id: agency.id, name: agency.name, slug: agency.slug, citySlug: agency.city.slug };
  const serviceByCode = new Map(agency.services.map((s) => [s.code, s]));
  const packageGroups = Object.entries(agency.packages)
    .filter(([, pkgs]) => pkgs.length > 0)
    .map(([code, pkgs]) => ({
      code,
      service: serviceByCode.get(code),
      packages: [...pkgs].sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier)),
    }));
  const servicesWithoutPackages = agency.services.filter((s) => !packageGroups.some((g) => g.code === s.code));

  const facts: Array<[string, string]> = [
    ["Location", [agency.locality?.name, agency.city.name].filter(Boolean).join(", ")],
    ["Team size", agency.teamSize ? `${agency.teamSize} people` : "—"],
    ["Pricing", PRICING_TYPE_LABELS[agency.pricingType]],
    // Research notes can be long and carry source labels; show one short sentence.
    ["Works with", (agency.targetClients && shortSentence(agency.targetClients)) || "—"],
  ];

  return (
    <Container className="pb-12 pt-4 md:pb-16 md:pt-6 lg:pb-20">
      <Link href={`/${agency.city.slug}`} className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted hover:text-primary-text">
        ← {agency.city.name} agencies
      </Link>

      <div className="mt-2 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:pb-8">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/8 to-transparent font-display text-lg font-bold text-primary-text ring-1 ring-inset ring-primary/15 sm:h-16 sm:w-16">
            {initials(agency.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-4xl">
                {agency.name}
              </h1>
              {agency.verified && <VerifiedBadge />}
            </div>
            {agency.description && <p className="mt-2 max-w-2xl text-base text-text-muted">{agency.description}</p>}
            <div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center">
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-medium text-primary-text hover:underline"
                >
                  {hostname(agency.website)} ↗
                </a>
              )}
              {agency.phone && (
                <a href={`tel:${agency.phone.replace(/\s+/g, "")}`} className="text-text-muted hover:text-primary-text">
                  {agency.phone}
                </a>
              )}
            </div>
            {agency.lastCheckedOn && (
              <p className="text-[13px] text-text-muted">Details last checked on {formatDate(agency.lastCheckedOn)}</p>
            )}
          </div>
        </div>

        {/* On phones these two live in the sticky bar and under the facts. */}
        <div className="hidden flex-shrink-0 flex-col items-stretch gap-2 sm:flex sm:w-48">
          <Link href={quoteBase} className={ctaButton}>
            Request a quote
          </Link>
          <CompareToggle item={compareItem} />
        </div>
      </div>

      {/* Mobile: a list of label/value rows. From 640px: four columns. */}
      <dl className="divide-y divide-border border-b border-border sm:grid sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {facts.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-3 sm:block sm:px-4 sm:py-4 sm:first:pl-0">
            <dt className="flex-shrink-0 text-[13px] font-medium text-text-muted">{label}</dt>
            <dd className="text-right text-sm font-semibold text-text sm:mt-1 sm:text-left">{value}</dd>
          </div>
        ))}
      </dl>

      <CompareToggle item={compareItem} className="mt-4 sm:hidden" />

      {agency.services.length > 0 && (
        <section className="mt-8 sm:mt-10">
          <h2 className={sectionTitle}>Services</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {agency.services.map((s) => (
              <Link key={s.code} href={`/${agency.city.slug}/services/${s.slug}`} className={chip(false)}>
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 sm:mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 className={sectionTitle}>Packages &amp; pricing</h2>
          {agency.pricingPageUrl && (
            <a
              href={agency.pricingPageUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex min-h-11 items-center text-sm font-medium text-primary-text hover:underline"
            >
              Agency&apos;s pricing page ↗
            </a>
          )}
        </div>

        {packageGroups.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-medium text-text">{agency.name} shares prices on request</p>
            <p className="mt-1 text-sm text-text-muted">Send a quick brief and they&apos;ll reply with a tailored quote.</p>
            <Link href={quoteBase} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary-text hover:underline">
              Request a quote →
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-10">
            {packageGroups.map(({ code, service, packages }) => (
              <div key={code}>
                {packageGroups.length > 1 && (
                  <h3 className="mb-3 text-card font-semibold text-text">{service?.name ?? code}</h3>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg) => (
                    <PricingPackageCard
                      key={pkg.id}
                      eyebrow={TIER_LABELS[pkg.tier]}
                      title={pkg.name}
                      price={formatPackagePrice(pkg.priceMin, pkg.priceMax, pkg.billing)}
                      inclusions={pkg.inclusions}
                      highlighted={pkg.tier === "GROWTH" && packages.length > 1}
                      footer={
                        <div className="flex items-center justify-between gap-3">
                          <Link
                            href={`${quoteBase}&package=${pkg.id}${service ? `&service=${service.slug}` : ""}`}
                            className="inline-flex min-h-11 items-center text-sm font-semibold text-primary-text hover:underline"
                          >
                            Get a quote for this →
                          </Link>
                          {pkg.sourceUrl && (
                            <a
                              href={pkg.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex min-h-11 items-center text-[13px] text-text-muted hover:text-primary-text"
                            >
                              Source ↗
                            </a>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            {servicesWithoutPackages.length > 0 && (
              <p className="text-sm text-text-muted">
                Also offers {servicesWithoutPackages.map((s) => s.name).join(", ")} — pricing on request.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:mt-12 sm:flex-row sm:items-center sm:p-6">
        <div>
          <p className="font-display text-xl font-semibold text-text">Ready to work with {agency.name}?</p>
          <p className="text-sm text-text-muted">Get a tailored quote, free of charge.</p>
        </div>
        <Link href={quoteBase} className={primaryButton}>
          Request a quote
        </Link>
      </div>

      <CompareBar />
      <StickyActionBar>
        <Link href={`/${agency.city.slug}`} className={secondaryButton}>
          Find my top 3
        </Link>
        <Link href={quoteBase} className={ctaButton}>
          Request a quote
        </Link>
      </StickyActionBar>
    </Container>
  );
}
