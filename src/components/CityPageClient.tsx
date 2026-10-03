"use client";

import { useMemo, useState } from "react";
import type { Agency, City, Service } from "@/lib/types";
import AgencyCard from "@/components/AgencyCard";
import CompareBar from "@/components/CompareBar";
import FilterSidebar, { BUDGET_BANDS } from "@/components/FilterSidebar";
import SortControl, { type SortKey } from "@/components/SortControl";

function startingPrice(a: Agency): number {
  return Math.min(...a.packages.map((p) => p.priceMin));
}

export default function CityPageClient({
  city,
  agencies,
}: {
  city: City;
  agencies: Agency[];
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [budgetBand, setBudgetBand] = useState("any");
  const [sort, setSort] = useState<SortKey>("score");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const availableIndustries = useMemo(
    () => Array.from(new Set(agencies.flatMap((a) => a.industries))).sort(),
    [agencies],
  );
  const availableLanguages = useMemo(
    () => Array.from(new Set(agencies.flatMap((a) => a.languages))).sort(),
    [agencies],
  );

  function toggle<T>(list: T[], item: T, setList: (next: T[]) => void) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  const maxBudget = BUDGET_BANDS.find((b) => b.key === budgetBand)?.max ?? Infinity;

  const filtered = useMemo(() => {
    const result = agencies.filter((a) => {
      if (services.length > 0 && !services.every((s) => a.services.includes(s))) return false;
      if (industries.length > 0 && !industries.some((i) => a.industries.includes(i))) return false;
      if (languages.length > 0 && !languages.some((l) => a.languages.includes(l))) return false;
      if (startingPrice(a) > maxBudget) return false;
      return true;
    });

    const sorted = [...result];
    if (sort === "score") sorted.sort((a, b) => b.score - a.score);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "price") sorted.sort((a, b) => startingPrice(a) - startingPrice(b));
    return sorted;
  }, [agencies, services, industries, languages, maxBudget, sort]);

  function resetFilters() {
    setServices([]);
    setIndustries([]);
    setLanguages([]);
    setBudgetBand("any");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">
          Top marketing agencies in {city.name}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{city.tagline}</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink"
        >
          {mobileFiltersOpen ? "Hide filters" : "Show filters"}
        </button>
        <SortControl value={sort} onChange={setSort} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={mobileFiltersOpen ? "block" : "hidden lg:block"}>
          <FilterSidebar
            services={services}
            onToggleService={(s) => toggle(services, s, setServices)}
            industries={industries}
            onToggleIndustry={(i) => toggle(industries, i, setIndustries)}
            availableIndustries={availableIndustries}
            languages={languages}
            onToggleLanguage={(l) => toggle(languages, l, setLanguages)}
            availableLanguages={availableLanguages}
            budgetBand={budgetBand}
            onBudgetBandChange={setBudgetBand}
            onReset={resetFilters}
          />
        </aside>

        <div>
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-ink-soft">
              {filtered.length} agenc{filtered.length === 1 ? "y" : "ies"} found
            </p>
            <SortControl value={sort} onChange={setSort} />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-medium text-ink">No agencies match these filters</p>
              <button
                onClick={resetFilters}
                className="mt-2 text-sm font-medium text-accent hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CompareBar />
    </div>
  );
}
