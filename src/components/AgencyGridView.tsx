"use client";

import { useState, type ReactNode } from "react";
import type { AgencyListItem, LocalityItem, Page, ServiceItem } from "@/lib/api/types";
import { DEFAULT_GRID_FILTERS, GRID_PAGE_SIZE, gridParams, type GridFilters } from "@/lib/grid";
import { useListing } from "@/lib/use-listing";
import { errorMessage } from "@/lib/api/http";
import AgencyCard from "@/components/AgencyCard";
import AgencyCardSkeleton from "@/components/AgencyCardSkeleton";
import FilterSidebar from "@/components/FilterSidebar";
import SortControl from "@/components/SortControl";

interface AgencyGridViewProps {
  citySlug: string;
  cityName: string;
  services: ServiceItem[];
  localities: LocalityItem[];
  initialFilters?: Partial<GridFilters>;
  /** Server-rendered first page matching `initialFilters`. */
  initialData?: Page<AgencyListItem>;
  header: ReactNode;
}

export default function AgencyGridView({
  citySlug,
  cityName,
  services,
  localities,
  initialFilters,
  initialData,
  header,
}: AgencyGridViewProps) {
  const [filters, setFilters] = useState<GridFilters>({ ...DEFAULT_GRID_FILTERS, ...initialFilters });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { data, error, loading, retry } = useListing(
    citySlug,
    gridParams(filters),
    initialData ? { params: gridParams(initialFilters), data: initialData } : undefined,
  );

  // Any filter change goes back to the first page.
  function update(patch: Partial<GridFilters>) {
    setFilters((prev) => ({ ...prev, page: 0, ...patch }));
  }

  function resetFilters() {
    setFilters({ ...DEFAULT_GRID_FILTERS, sort: filters.sort });
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / GRID_PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">{header}</div>

      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink"
        >
          {mobileFiltersOpen ? "Hide filters" : "Show filters"}
        </button>
        <SortControl value={filters.sort} onChange={(sort) => update({ sort })} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={mobileFiltersOpen ? "block" : "hidden lg:block"}>
          <FilterSidebar
            services={services}
            service={filters.service}
            onServiceChange={(service) => update({ service })}
            localities={localities}
            locality={filters.locality}
            onLocalityChange={(locality) => update({ locality })}
            budgetMax={filters.budgetMax}
            onBudgetMaxChange={(budgetMax) => update({ budgetMax })}
            pricesOnly={filters.pricesOnly}
            onPricesOnlyChange={(pricesOnly) => update({ pricesOnly })}
            verifiedOnly={filters.verifiedOnly}
            onVerifiedOnlyChange={(verifiedOnly) => update({ verifiedOnly })}
            onReset={resetFilters}
          />
        </aside>

        <div>
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-ink-soft">
              {data ? `${data.total} agenc${data.total === 1 ? "y" : "ies"} found in ${cityName}` : " "}
            </p>
            <SortControl value={filters.sort} onChange={(sort) => update({ sort })} />
          </div>

          {error ? (
            <ListingError error={error} onRetry={retry} />
          ) : loading || !data ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <AgencyCardSkeleton key={i} />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-medium text-ink">No agencies match these filters</p>
              <button onClick={resetFilters} className="mt-2 text-sm font-medium text-accent hover:underline">
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((agency) => (
                  <AgencyCard key={agency.id} agency={agency} citySlug={citySlug} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <p className="text-xs text-ink-soft">
                    Page {filters.page + 1} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={filters.page === 0}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={filters.page + 1 >= totalPages}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ListingError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-danger/40 p-10 text-center">
      <p className="text-sm font-medium text-ink">We couldn&apos;t load agencies right now</p>
      <p className="mt-1 text-sm text-ink-soft">{errorMessage(error)}</p>
      <button onClick={onRetry} className="mt-3 text-sm font-medium text-accent hover:underline">
        Try again
      </button>
    </div>
  );
}
