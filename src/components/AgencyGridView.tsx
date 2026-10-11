"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AgencyListItem, LocalityItem, Page, ServiceItem } from "@/lib/api/types";
import { DEFAULT_GRID_FILTERS, GRID_PAGE_SIZE, gridParams, type GridFilters } from "@/lib/grid";
import { useListing } from "@/lib/use-listing";
import { errorMessage } from "@/lib/api/http";
import AgencyCard, { AgencyCardGrid } from "@/components/AgencyCard";
import AgencyCardSkeleton from "@/components/AgencyCardSkeleton";
import FilterSidebar from "@/components/FilterSidebar";
import SortControl from "@/components/SortControl";
import { Container } from "@/components/Container";
import { DURATION, EASE, SPRING } from "@/lib/motion";
import { primaryButton, secondaryButton } from "@/lib/styles";
import { cn } from "@/lib/utils";

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
  const closeFilters = useCallback(() => setMobileFiltersOpen(false), []);
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

  const activeFilters =
    (filters.service ? 1 : 0) +
    (filters.locality ? 1 : 0) +
    (filters.budgetMax != null ? 1 : 0) +
    (filters.pricesOnly ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  const sidebar = (
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
  );

  const countLabel = data ? `${data.total} agenc${data.total === 1 ? "y" : "ies"} found in ${cityName}` : " ";

  return (
    <Container className="pb-12 pt-6 md:pb-16 md:pt-8 lg:pb-20">
      <div className="mb-6">{header}</div>

      {/* Mobile + tablet: result count, then Filters and a compact sort button. */}
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <p className="min-w-0 text-sm text-text-muted">{countLabel}</p>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            aria-haspopup="dialog"
            className={cn(secondaryButton, "px-4")}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M3 5h14M6 10h8M8.5 15h3" />
            </svg>
            Filters
            {activeFilters > 0 && (
              <span className="num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[13px] text-primary-fg">
                {activeFilters}
              </span>
            )}
          </button>
          <SortControl compact value={filters.sort} onChange={(sort) => update({ sort })} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{sidebar}</aside>

        <div className="min-w-0">
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-text-muted">{countLabel}</p>
            <SortControl value={filters.sort} onChange={(sort) => update({ sort })} />
          </div>

          {error ? (
            <ListingError error={error} onRetry={retry} />
          ) : loading || !data ? (
            <AgencyCardGrid withSidebar>
              {Array.from({ length: 6 }).map((_, i) => (
                <AgencyCardSkeleton key={i} />
              ))}
            </AgencyCardGrid>
          ) : data.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm font-medium text-text">No agencies match these filters</p>
              <button onClick={resetFilters} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary-text hover:underline">
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <AgencyCardGrid withSidebar>
                {data.items.map((agency) => (
                  <AgencyCard key={agency.id} agency={agency} citySlug={citySlug} />
                ))}
              </AgencyCardGrid>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between gap-3">
                  <p className="text-[13px] text-text-muted">
                    Page {filters.page + 1} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={filters.page === 0}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                      className={cn(secondaryButton, "px-4")}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={filters.page + 1 >= totalPages}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                      className={cn(secondaryButton, "px-4")}
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

      <FilterSheet
        open={mobileFiltersOpen}
        onClose={closeFilters}
        resultLabel={data ? `Show ${data.total} agenc${data.total === 1 ? "y" : "ies"}` : "Show agencies"}
      >
        {sidebar}
      </FilterSheet>
    </Container>
  );
}

/** Filters on mobile and tablet: a bottom sheet over the list. */
function FilterSheet({
  open,
  onClose,
  resultLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  resultLabel: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-bg/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.ui, ease: EASE }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-3xl border-t border-border bg-surface shadow-raised outline-none"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SPRING}
          >
            <div className="flex justify-center pt-2.5" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 pb-4 pt-2 sm:px-6">{children}</div>
            <div className="pb-safe border-t border-border px-4 pt-3 sm:px-6">
              <button type="button" onClick={onClose} className={cn(primaryButton, "w-full")}>
                {resultLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ListingError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-danger/40 px-4 py-10 text-center">
      <p className="text-sm font-medium text-text">We couldn&apos;t load agencies right now</p>
      <p className="mt-1 text-sm text-text-muted">{errorMessage(error)}</p>
      <button onClick={onRetry} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary-text hover:underline">
        Try again
      </button>
    </div>
  );
}
