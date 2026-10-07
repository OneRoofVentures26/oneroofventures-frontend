"use client";

import { useState } from "react";
import type { CityItem, ServiceItem } from "@/lib/api/types";
import { QUIZ_BUDGET_BANDS } from "@/lib/quiz";

interface GuidedQuizProps {
  services: ServiceItem[];
  cities: CityItem[];
  skipCity?: boolean;
  cityName?: string;
  /** Service slug. */
  initialService?: string | null;
  initialBudgetBand?: string;
  onComplete: (answers: { service: string; budgetBand: string; citySlug: string | null }) => void;
}

const chipClass =
  "rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition hover:border-accent hover:bg-accent-light hover:text-accent-dark";

export default function GuidedQuiz({
  services,
  cities,
  skipCity = false,
  cityName,
  initialService = null,
  initialBudgetBand = "",
  onComplete,
}: GuidedQuizProps) {
  const totalSteps = skipCity ? 2 : 3;
  const [step, setStep] = useState(() => {
    if (initialService && initialBudgetBand && !skipCity) return 3;
    if (initialService) return 2;
    return 1;
  });
  const [service, setService] = useState<string | null>(initialService);
  const [budgetBand, setBudgetBand] = useState(initialBudgetBand);

  function chooseService(slug: string) {
    setService(slug);
    setStep(2);
  }

  function chooseBudget(key: string) {
    setBudgetBand(key);
    if (skipCity) {
      onComplete({ service: service as string, budgetBand: key, citySlug: null });
    } else {
      setStep(3);
    }
  }

  function chooseCity(slug: string) {
    onComplete({ service: service as string, budgetBand, citySlug: slug });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-left sm:p-8">
      {skipCity && cityName && (
        <p className="mb-3 text-xs text-ink-soft">
          Showing results for <span className="font-semibold text-ink">{cityName}</span>
        </p>
      )}

      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-accent" : "bg-muted"}`} />
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Step {step} of {totalSteps}
      </p>

      {step === 1 && (
        <div>
          <h2 className="mt-2 text-lg font-bold text-ink">What do you need help with?</h2>
          {services.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">Services are loading — please refresh in a moment.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {services.map((s) => (
                <button key={s.slug} type="button" onClick={() => chooseService(s.slug)} className={chipClass}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <button type="button" onClick={() => setStep(1)} className="text-xs font-medium text-ink-soft hover:text-accent">
            ← Back
          </button>
          <h2 className="mt-2 text-lg font-bold text-ink">What&apos;s your monthly budget?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUIZ_BUDGET_BANDS.map((b) => (
              <button key={b.key} type="button" onClick={() => chooseBudget(b.key)} className={chipClass}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && !skipCity && (
        <div>
          <button type="button" onClick={() => setStep(2)} className="text-xs font-medium text-ink-soft hover:text-accent">
            ← Back
          </button>
          <h2 className="mt-2 text-lg font-bold text-ink">Which city are you in?</h2>
          {cities.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No cities are live yet — check back soon.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cities.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => chooseCity(c.slug)}
                  className="rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-ink transition hover:border-accent hover:bg-accent-light hover:text-accent-dark"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
