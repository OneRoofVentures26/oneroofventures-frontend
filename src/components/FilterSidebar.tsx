"use client";

import { ALL_SERVICES, type Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export const BUDGET_BANDS = [
  { key: "any", label: "Any budget", max: Infinity },
  { key: "50k", label: "Under ₹50k/mo", max: 50000 },
  { key: "150k", label: "Under ₹1.5L/mo", max: 150000 },
  { key: "300k", label: "Under ₹3L/mo", max: 300000 },
  { key: "600k", label: "Under ₹6L/mo", max: 600000 },
] as const;

export interface FilterSidebarProps {
  services: Service[];
  onToggleService: (s: Service) => void;
  industries: string[];
  onToggleIndustry: (i: string) => void;
  availableIndustries: string[];
  languages: string[];
  onToggleLanguage: (l: string) => void;
  availableLanguages: string[];
  budgetBand: string;
  onBudgetBandChange: (key: string) => void;
  onReset: () => void;
  className?: string;
}

export default function FilterSidebar({
  services,
  onToggleService,
  industries,
  onToggleIndustry,
  availableIndustries,
  languages,
  onToggleLanguage,
  availableLanguages,
  budgetBand,
  onBudgetBandChange,
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
        <legend className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Service type
        </legend>
        <div className="mt-3 space-y-2">
          {ALL_SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={services.includes(s)}
                onChange={() => onToggleService(s)}
                className="h-4 w-4 accent-accent"
              />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Budget
        </legend>
        <div className="mt-3 space-y-2">
          {BUDGET_BANDS.map((band) => (
            <label key={band.key} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="budget"
                checked={budgetBand === band.key}
                onChange={() => onBudgetBandChange(band.key)}
                className="h-4 w-4 accent-accent"
              />
              {band.label}
            </label>
          ))}
        </div>
      </fieldset>

      {availableIndustries.length > 0 && (
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Industry served
          </legend>
          <div className="mt-3 space-y-2">
            {availableIndustries.map((i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={industries.includes(i)}
                  onChange={() => onToggleIndustry(i)}
                  className="h-4 w-4 accent-accent"
                />
                {i}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {availableLanguages.length > 0 && (
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Language
          </legend>
          <div className="mt-3 space-y-2">
            {availableLanguages.map((l) => (
              <label key={l} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={languages.includes(l)}
                  onChange={() => onToggleLanguage(l)}
                  className="h-4 w-4 accent-accent"
                />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
