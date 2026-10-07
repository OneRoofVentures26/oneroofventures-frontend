"use client";

import type { LocalityItem, ServiceItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const BUDGET_BANDS: Array<{ label: string; max: number | null }> = [
  { label: "Any budget", max: null },
  { label: "Under ₹10k/mo", max: 10000 },
  { label: "Under ₹25k/mo", max: 25000 },
  { label: "Under ₹50k/mo", max: 50000 },
  { label: "Under ₹1L/mo", max: 100000 },
  { label: "Under ₹2L/mo", max: 200000 },
];

export interface FilterSidebarProps {
  services: ServiceItem[];
  service: string;
  onServiceChange: (slug: string) => void;
  localities: LocalityItem[];
  locality: string;
  onLocalityChange: (slug: string) => void;
  budgetMax: number | null;
  onBudgetMaxChange: (max: number | null) => void;
  pricesOnly: boolean;
  onPricesOnlyChange: (value: boolean) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (value: boolean) => void;
  onReset: () => void;
  className?: string;
}

const legendClass = "text-xs font-semibold uppercase tracking-wide text-ink-soft";
const optionClass = "flex items-center gap-2 text-sm text-ink";

export default function FilterSidebar({
  services,
  service,
  onServiceChange,
  localities,
  locality,
  onLocalityChange,
  budgetMax,
  onBudgetMaxChange,
  pricesOnly,
  onPricesOnlyChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  onReset,
  className,
}: FilterSidebarProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">Filters</h2>
        <button onClick={onReset} className="text-xs font-medium text-accent hover:underline">
          Reset
        </button>
      </div>

      <fieldset>
        <legend className={legendClass}>Service</legend>
        <div className="mt-3 space-y-2">
          {[{ slug: "", name: "All services" }, ...services].map((s) => (
            <label key={s.slug || "all"} className={optionClass}>
              <input
                type="radio"
                name="service"
                checked={service === s.slug}
                onChange={() => onServiceChange(s.slug)}
                className="h-4 w-4 accent-accent"
              />
              {s.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legendClass}>Budget</legend>
        <div className="mt-3 space-y-2">
          {BUDGET_BANDS.map((band) => (
            <label key={band.label} className={optionClass}>
              <input
                type="radio"
                name="budget"
                checked={budgetMax === band.max}
                onChange={() => onBudgetMaxChange(band.max)}
                className="h-4 w-4 accent-accent"
              />
              {band.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          Shows agencies with at least one package in budget. Quote-only agencies are hidden.
        </p>
      </fieldset>

      {localities.length > 0 && (
        <fieldset>
          <legend className={legendClass}>Locality</legend>
          <select
            value={locality}
            onChange={(e) => onLocalityChange(e.target.value)}
            className="mt-3 w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
          >
            <option value="">All localities</option>
            {localities.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      <fieldset>
        <legend className={legendClass}>Show only</legend>
        <div className="mt-3 space-y-2">
          <label className={optionClass}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Verified agencies
          </label>
          <label className={optionClass}>
            <input
              type="checkbox"
              checked={pricesOnly}
              onChange={(e) => onPricesOnlyChange(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Agencies that show prices
          </label>
        </div>
      </fieldset>
    </div>
  );
}
