import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAgencyProfile, getSitemapEntries } from "@/lib/api/public";
import { isNotFound } from "@/lib/api/http";
import { TIERS, type AgencyProfile } from "@/lib/api/types";
import { cn, formatDate, formatPackagePrice, initials, PRICING_TYPE_LABELS, TIER_LABELS } from "@/lib/utils";
import { chip, ctaButton, primaryButton } from "@/lib/styles";
import PricingPackageCard from "@/components/PricingPackageCard";
import CompareToggle from "@/components/CompareToggle";
import CompareBar from "@/components/CompareBar";
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
    ["Works with", agency.targetClients || "—"],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/${agency.city.slug}`} className="inline-flex min-h-11 items-center text-sm font-medium text-ink-soft hover:text-harbor">
        ← {agency.city.name} agencies
      </Link>

      <div className="mt-2 flex flex-col gap-6 border-b border-mist pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm bg-harbor text-lg font-semibold text-paper">
            {initials(agency.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-[28px] leading-tight text-ink sm:text-[36px]">{agency.name}</h1>
              {agency.verified && <VerifiedBadge />}
            </div>
            {agency.description && <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">{agency.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 text-sm [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center">
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-medium text-harbor hover:underline"
                >
                  {hostname(agency.website)} ↗
                </a>
              )}
              {agency.phone && (
                <a href={`tel:${agency.phone.replace(/\s+/g, "")}`} className="text-ink-soft hover:text-harbor">
                  {agency.phone}
                </a>
              )}
            </div>
            {agency.lastCheckedOn && (
              <p className="mt-2 text-xs text-ink-soft">Details last checked on {formatDate(agency.lastCheckedOn)}</p>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
          <Link href={quoteBase} className={ctaButton}>
            Request a quote
          </Link>
          <CompareToggle
            item={{ id: agency.id, name: agency.name, slug: agency.slug, citySlug: agency.city.slug }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 border-b border-mist sm:grid-cols-4">
        {facts.map(([label, value], idx) => (
          <div
            key={label}
            className={cn(
              "border-mist py-4 pr-4",
              idx % 2 === 1 && "border-l pl-4",
              idx >= 2 && "border-t sm:border-t-0",
              idx === 2 && "sm:border-l sm:pl-4",
            )}
          >
            <dt className="text-xs font-medium text-ink-soft">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {agency.services.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl text-ink">Services</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {agency.services.map((s) => (
              <Link
                key={s.code}
                href={`/${agency.city.slug}/services/${s.slug}`}
                className={chip(false)}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl text-ink">Packages &amp; pricing</h2>
          {agency.pricingPageUrl && (
            <a
              href={agency.pricingPageUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm font-medium text-harbor hover:underline"
            >
              Agency&apos;s pricing page ↗
            </a>
          )}
        </div>

        {packageGroups.length === 0 ? (
          <div className="mt-4 border-y border-mist px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">{agency.name} shares prices on request</p>
            <p className="mt-1 text-sm text-ink-soft">Send a quick brief and they&apos;ll reply with a tailored quote.</p>
            <Link href={quoteBase} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-harbor hover:underline">
              Request a quote →
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-10">
            {packageGroups.map(({ code, service, packages }) => (
              <div key={code}>
                {packageGroups.length > 1 && (
                  <h3 className="mb-3 text-lg text-ink">
                    {service?.name ?? code}
                  </h3>
                )}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                            className="inline-flex min-h-11 items-center text-sm font-semibold text-harbor hover:underline"
                          >
                            Get a quote for this →
                          </Link>
                          {pkg.sourceUrl && (
                            <a
                              href={pkg.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex min-h-11 items-center text-xs text-ink-soft hover:text-harbor"
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
              <p className="text-sm text-ink-soft">
                Also offers {servicesWithoutPackages.map((s) => s.name).join(", ")} — pricing on request.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="mt-12 flex flex-col items-start justify-between gap-4 border-y border-mist py-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-serif text-xl font-semibold text-ink">Ready to work with {agency.name}?</p>
          <p className="text-sm text-ink-soft">Get a tailored quote, free of charge.</p>
        </div>
        <Link href={quoteBase} className={primaryButton}>
          Request a quote
        </Link>
      </div>

      <CompareBar />
    </div>
  );
}
