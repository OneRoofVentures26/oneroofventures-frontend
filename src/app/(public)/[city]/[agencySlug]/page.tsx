import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAgencyProfile, getSitemapEntries } from "@/lib/api/public";
import { isNotFound } from "@/lib/api/http";
import { TIERS, type AgencyProfile } from "@/lib/api/types";
import { formatDate, formatPackagePrice, initials, PRICING_TYPE_LABELS, TIER_LABELS } from "@/lib/utils";
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
      <Link href={`/${agency.city.slug}`} className="text-sm font-medium text-ink-soft hover:text-accent">
        ← {agency.city.name} agencies
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-accent-light text-lg font-bold text-accent-dark">
            {initials(agency.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-xl font-bold text-ink sm:text-2xl">{agency.name}</h1>
              {agency.verified && <VerifiedBadge />}
            </div>
            {agency.description && <p className="mt-1 text-sm text-ink-soft">{agency.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-medium text-accent hover:underline"
                >
                  {hostname(agency.website)} ↗
                </a>
              )}
              {agency.phone && (
                <a href={`tel:${agency.phone.replace(/\s+/g, "")}`} className="text-ink-soft hover:text-accent">
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
          <Link
            href={quoteBase}
            className="rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Request a quote
          </Link>
          <CompareToggle
            item={{ id: agency.id, name: agency.name, slug: agency.slug, citySlug: agency.city.slug }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {agency.services.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink">Services</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {agency.services.map((s) => (
              <Link
                key={s.code}
                href={`/${agency.city.slug}/services/${s.slug}`}
                className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:text-accent-dark"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-ink">Packages &amp; pricing</h2>
          {agency.pricingPageUrl && (
            <a
              href={agency.pricingPageUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm font-medium text-accent hover:underline"
            >
              Agency&apos;s pricing page ↗
            </a>
          )}
        </div>

        {packageGroups.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium text-ink">{agency.name} shares prices on request</p>
            <p className="mt-1 text-sm text-ink-soft">Send a quick brief and they&apos;ll reply with a tailored quote.</p>
            <Link href={quoteBase} className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
              Request a quote →
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-10">
            {packageGroups.map(({ code, service, packages }) => (
              <div key={code}>
                {packageGroups.length > 1 && (
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-soft">
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
                            className="text-sm font-semibold text-accent hover:underline"
                          >
                            Get a quote for this →
                          </Link>
                          {pkg.sourceUrl && (
                            <a
                              href={pkg.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="text-xs text-ink-soft hover:text-accent"
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

      <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-accent-light/50 p-6 sm:flex-row">
        <div>
          <p className="text-sm font-bold text-ink">Ready to work with {agency.name}?</p>
          <p className="text-sm text-ink-soft">Get a tailored quote, free of charge.</p>
        </div>
        <Link
          href={quoteBase}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Request a quote
        </Link>
      </div>

      <CompareBar />
    </div>
  );
}
