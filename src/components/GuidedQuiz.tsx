"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CityItem, ServiceItem } from "@/lib/api/types";
import { getQuizBudgetBand, QUIZ_BUDGET_BANDS } from "@/lib/quiz";
import { DURATION, EASE } from "@/lib/motion";
import { chip, ctaButton, glassPanel, secondaryButton } from "@/lib/styles";
import { cn } from "@/lib/utils";

/*
 * The quiz records what the visitor needs (service, budget, city) as a brief.
 * It never filters a listing or navigates on its own: the last step shows the
 * brief and the visitor chooses what to do with it. Filtering agencies is the
 * listing's job (search bar and the filter sidebar), kept separate on purpose.
 */

interface GuidedQuizProps {
  services: ServiceItem[];
  cities: CityItem[];
  /** Service slug. */
  initialService?: string | null;
  initialBudgetBand?: string;
  className?: string;
}

/** Long enough to see the chip fill before the step changes. */
const SELECT_PAUSE_MS = 180;
const TOTAL_STEPS = 3;

/** Equal-height rows (auto-rows-fr), so a one-line chip matches its two-line neighbours. */
const chipGrid = "mt-4 grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3";

/** A chip left alone on the last row stretches across it instead of sitting stranded. */
function loneChipSpan(index: number, count: number): string | undefined {
  if (index !== count - 1) return undefined;
  return cn(count % 2 === 1 && "max-sm:col-span-2", count % 3 === 1 && "sm:col-span-3");
}

const backButton =
  "-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:text-primary-text lg:min-h-9";

export default function GuidedQuiz({
  services,
  cities,
  initialService = null,
  initialBudgetBand = "",
  className,
}: GuidedQuizProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(() => {
    if (initialService && initialBudgetBand) return 3;
    if (initialService) return 2;
    return 1;
  });
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<string | null>(initialService);
  const [budgetBand, setBudgetBand] = useState(initialBudgetBand);
  const [citySlug, setCitySlug] = useState<string | null>(null);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function afterPause(fn: () => void) {
    if (reduceMotion) fn();
    else window.setTimeout(fn, SELECT_PAUSE_MS);
  }

  function chooseService(slug: string) {
    setService(slug);
    afterPause(() => goTo(2));
  }

  function chooseBudget(key: string) {
    setBudgetBand(key);
    afterPause(() => goTo(3));
  }

  function chooseCity(slug: string) {
    setCitySlug(slug);
    afterPause(() => goTo(4));
  }

  function startOver() {
    setService(null);
    setBudgetBand("");
    setCitySlug(null);
    goTo(1);
  }

  const offset = reduceMotion ? 0 : 28;
  const stepVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * offset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -offset }),
  };

  const done = step > TOTAL_STEPS;
  const serviceItem = services.find((s) => s.slug === service);
  const band = getQuizBudgetBand(budgetBand);
  const city = cities.find((c) => c.slug === citySlug);

  const quoteParams = new URLSearchParams();
  if (city) quoteParams.set("city", city.slug);
  if (serviceItem) quoteParams.set("service", serviceItem.slug);
  if (band?.max != null) quoteParams.set("budget", String(band.max));

  return (
    <div className={cn(glassPanel, "overflow-hidden p-5 text-left sm:p-8", className)}>
      <p className="text-sm font-medium text-text-muted" aria-live="polite">
        {done ? (
          "Your brief is ready"
        ) : (
          <>
            Step <span className="num text-text">{step}</span> of {TOTAL_STEPS}
          </>
        )}
      </p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={Math.min(step - 1, TOTAL_STEPS)}
      >
        <motion.div
          className="h-full w-full origin-left rounded-full bg-gradient-brand"
          initial={false}
          animate={{ scaleX: Math.max(step - 1, 0.35) / TOTAL_STEPS }}
          transition={{ duration: 0.45, ease: EASE }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: DURATION.ui, ease: EASE }}
          className="mt-4 sm:mt-5"
        >
          {step === 1 && (
            <div>
              <h2 className="text-card font-semibold text-text sm:text-xl">What do you need help with?</h2>
              {services.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">Services are loading — please refresh in a moment.</p>
              ) : (
                <div className={chipGrid}>
                  {services.map((s, i) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => chooseService(s.slug)}
                      aria-pressed={service === s.slug}
                      className={cn(chip(service === s.slug, true), loneChipSpan(i, services.length))}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <button type="button" onClick={() => goTo(1)} className={backButton}>
                <span aria-hidden="true">←</span> Back
              </button>
              <h2 className="mt-1 text-card font-semibold text-text sm:text-xl">What&apos;s your monthly budget?</h2>
              <div className={chipGrid}>
                {QUIZ_BUDGET_BANDS.map((b, i) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => chooseBudget(b.key)}
                    aria-pressed={budgetBand === b.key}
                    className={cn(chip(budgetBand === b.key, true), loneChipSpan(i, QUIZ_BUDGET_BANDS.length))}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <button type="button" onClick={() => goTo(2)} className={backButton}>
                <span aria-hidden="true">←</span> Back
              </button>
              <h2 className="mt-1 text-card font-semibold text-text sm:text-xl">Which city are you in?</h2>
              {cities.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">No cities are live yet — check back soon.</p>
              ) : (
                <div className={chipGrid}>
                  {cities.map((c, i) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => chooseCity(c.slug)}
                      aria-pressed={citySlug === c.slug}
                      className={cn(chip(citySlug === c.slug, true), loneChipSpan(i, cities.length))}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {done && (
            <div>
              <h2 className="text-card font-semibold text-text sm:text-xl">Here&apos;s what you need</h2>
              <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
                {[
                  { label: "Service", value: serviceItem?.name, step: 1 },
                  { label: "Budget", value: band?.label, step: 2 },
                  { label: "City", value: city?.name, step: 3 },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 py-1 pl-4 pr-2">
                    <dt className="text-sm text-text-muted">{row.label}</dt>
                    <dd className="flex min-w-0 items-center gap-1">
                      <span className="truncate text-sm font-semibold text-text">{row.value ?? "—"}</span>
                      <button
                        type="button"
                        onClick={() => goTo(row.step)}
                        className="inline-flex min-h-11 items-center rounded-lg px-2 text-[13px] font-medium text-primary-text hover:underline lg:min-h-9"
                      >
                        Edit
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Link href={`/quote?${quoteParams}`} className={ctaButton}>
                  Get quotes for this
                </Link>
                {city && city.agencyCount > 0 && (
                  <Link href={`/${city.slug}`} className={secondaryButton}>
                    Browse agencies in {city.name}
                  </Link>
                )}
              </div>
              <button type="button" onClick={startOver} className={cn(backButton, "ml-0 mt-3")}>
                Start over
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
