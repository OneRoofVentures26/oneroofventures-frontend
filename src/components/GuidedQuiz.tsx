"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CityItem, ServiceItem } from "@/lib/api/types";
import { QUIZ_BUDGET_BANDS } from "@/lib/quiz";
import { DURATION, EASE } from "@/lib/motion";
import { chip, glassPanel } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface GuidedQuizProps {
  services: ServiceItem[];
  cities: CityItem[];
  skipCity?: boolean;
  cityName?: string;
  /** Service slug. */
  initialService?: string | null;
  initialBudgetBand?: string;
  onComplete: (answers: { service: string; budgetBand: string; citySlug: string | null }) => void;
  className?: string;
}

/** Long enough to see the chip fill before the step changes. */
const SELECT_PAUSE_MS = 180;

const backButton =
  "-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:text-primary-text lg:min-h-9";

export default function GuidedQuiz({
  services,
  cities,
  skipCity = false,
  cityName,
  initialService = null,
  initialBudgetBand = "",
  onComplete,
  className,
}: GuidedQuizProps) {
  const reduceMotion = useReducedMotion();
  const totalSteps = skipCity ? 2 : 3;
  const [step, setStep] = useState(() => {
    if (initialService && initialBudgetBand && !skipCity) return 3;
    if (initialService) return 2;
    return 1;
  });
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<string | null>(initialService);
  const [budgetBand, setBudgetBand] = useState(initialBudgetBand);
  const [pendingCity, setPendingCity] = useState<string | null>(null);

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
    if (skipCity) {
      afterPause(() => onComplete({ service: service as string, budgetBand: key, citySlug: null }));
    } else {
      afterPause(() => goTo(3));
    }
  }

  function chooseCity(slug: string) {
    setPendingCity(slug);
    afterPause(() => onComplete({ service: service as string, budgetBand, citySlug: slug }));
  }

  const offset = reduceMotion ? 0 : 28;
  const stepVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * offset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -offset }),
  };

  return (
    <div className={cn(glassPanel, "overflow-hidden p-6 text-left sm:p-8", className)}>
      {skipCity && cityName && (
        <p className="mb-3 text-sm text-text-muted">
          Showing results for <span className="font-semibold text-text">{cityName}</span>
        </p>
      )}

      <p className="text-sm font-medium text-text-muted" aria-live="polite">
        Step <span className="num text-text">{step}</span> of {totalSteps}
      </p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={step}
      >
        <motion.div
          className="h-full w-full origin-left rounded-full bg-gradient-brand"
          initial={false}
          animate={{ scaleX: step / totalSteps }}
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
          className="mt-5"
        >
          {step === 1 && (
            <div>
              <h2 className="text-card font-semibold text-text sm:text-xl">What do you need help with?</h2>
              {services.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">Services are loading — please refresh in a moment.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {services.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => chooseService(s.slug)}
                      aria-pressed={service === s.slug}
                      className={chip(service === s.slug)}
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
              <div className="mt-4 flex flex-wrap gap-2">
                {QUIZ_BUDGET_BANDS.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => chooseBudget(b.key)}
                    aria-pressed={budgetBand === b.key}
                    className={chip(budgetBand === b.key)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && !skipCity && (
            <div>
              <button type="button" onClick={() => goTo(2)} className={backButton}>
                <span aria-hidden="true">←</span> Back
              </button>
              <h2 className="mt-1 text-card font-semibold text-text sm:text-xl">Which city are you in?</h2>
              {cities.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">No cities are live yet — check back soon.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {cities.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => chooseCity(c.slug)}
                      aria-pressed={pendingCity === c.slug}
                      className={chip(pendingCity === c.slug)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
