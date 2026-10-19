import Link from "next/link";
import type { AgencyListItem, CityItem, LocalityItem, Page, ServiceItem } from "@/lib/api/types";
import type { GridFilters } from "@/lib/grid";
import AgencyGridView from "@/components/AgencyGridView";
import CityLinks from "@/components/CityLinks";
import CompareBar from "@/components/CompareBar";
import StickyActionBar from "@/components/StickyActionBar";
import { ctaButton, secondaryButton, sectionTitle } from "@/lib/styles";

/**
 * Server-rendered agency listing: the city page itself (no filters) and the
 * city + service / city + locality landing pages (SEO entry points).
 */
export default function CityListingLanding({
  city,
  services,
  localities,
  filters,
  initialData,
  title,
  intro,
}: {
  city: CityItem;
  services: ServiceItem[];
  localities: LocalityItem[];
  filters: Partial<GridFilters>;
  initialData: Page<AgencyListItem>;
  title: string;
  intro: string;
}) {
  const filtered = Boolean(filters.service || filters.locality);
  return (
    <>
      <AgencyGridView
        citySlug={city.slug}
        cityName={city.name}
        services={services}
        localities={localities}
        initialFilters={filters}
        initialData={initialData}
        header={
          <div>
            <Link
              href={filtered ? `/${city.slug}` : "/#cities"}
              className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted hover:text-primary-text"
            >
              {filtered ? `← All agencies in ${city.name}` : "← All cities"}
            </Link>
            <h1 className={sectionTitle}>{title}</h1>
            <p className="mt-2 max-w-3xl text-base text-text-muted">{intro}</p>
          </div>
        }
      />
      <CityLinks
        city={city}
        services={services}
        localities={localities}
        activeService={filters.service}
        activeLocality={filters.locality}
      />
      <CompareBar />
      <StickyActionBar>
        <Link href={filtered ? `/${city.slug}` : "/#cities"} className={secondaryButton}>
          {filtered ? "All agencies" : "Other cities"}
        </Link>
        <Link
          href={`/quote?city=${city.slug}${filters.service ? `&service=${filters.service}` : ""}`}
          className={ctaButton}
        >
          Request a quote
        </Link>
      </StickyActionBar>
    </>
  );
}
