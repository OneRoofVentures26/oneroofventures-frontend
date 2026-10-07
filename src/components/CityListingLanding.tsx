import Link from "next/link";
import type { AgencyListItem, CityItem, LocalityItem, Page, ServiceItem } from "@/lib/api/types";
import type { GridFilters } from "@/lib/grid";
import AgencyGridView from "@/components/AgencyGridView";
import CityLinks from "@/components/CityLinks";
import CompareBar from "@/components/CompareBar";

/** Server-rendered city + service / city + locality landing page (SEO entry points). */
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
            <Link href={`/${city.slug}`} className="inline-flex min-h-11 items-center text-sm font-medium text-ink-soft hover:text-harbor">
              ← All agencies in {city.name}
            </Link>
            <h1 className="mt-1 text-[28px] leading-tight text-ink sm:text-[32px]">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-ink-soft">{intro}</p>
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
    </>
  );
}
