"use client";

import { createContext, useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CityItem, ServiceItem } from "@/lib/api/types";
import { useLocalStore } from "@/lib/local-store";
import { quizStore, parseSearchQuery } from "@/lib/quiz";
import GuidedQuiz from "@/components/GuidedQuiz";
import { ctaButton } from "@/lib/styles";
import { cn } from "@/lib/utils";

/*
 * The homepage entry points: free-text search (in the hero) and the guided
 * quiz (its own section). They share state because a search that doesn't name
 * a city pre-fills the quiz and hands off to it.
 */

interface HomeEntryState {
  cities: CityItem[];
  services: ServiceItem[];
  quizKey: number;
  prefill: { service: string | null; budgetBand: string };
  go: (citySlug: string, service: string | null, budgetBand: string) => void;
  handOffToQuiz: (prefill: { service: string | null; budgetBand: string }) => void;
  quizRef: React.RefObject<HTMLDivElement | null>;
}

const HomeEntryContext = createContext<HomeEntryState | null>(null);

function useHomeEntry() {
  const ctx = useContext(HomeEntryContext);
  if (!ctx) throw new Error("HomeSearch and HomeQuiz must be inside HomeEntryProvider");
  return ctx;
}

export function HomeEntryProvider({
  cities,
  services,
  children,
}: {
  cities: CityItem[];
  services: ServiceItem[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const quizRef = useRef<HTMLDivElement>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [prefill, setPrefill] = useState<{ service: string | null; budgetBand: string }>({
    service: null,
    budgetBand: "",
  });

  function go(citySlug: string, service: string | null, budgetBand: string) {
    quizStore.write({ service, budgetBand, citySlug });
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (budgetBand) params.set("budget", budgetBand);
    const queryString = params.toString();
    router.push(`/${citySlug}${queryString ? `?${queryString}` : ""}`);
  }

  function handOffToQuiz(next: { service: string | null; budgetBand: string }) {
    setPrefill(next);
    setQuizKey((k) => k + 1);
    const el = quizRef.current;
    if (el) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
      el.focus({ preventScroll: true });
    }
  }

  return (
    <HomeEntryContext.Provider value={{ cities, services, quizKey, prefill, go, handOffToQuiz, quizRef }}>
      {children}
    </HomeEntryContext.Provider>
  );
}

export function HomeSearch() {
  const { cities, services, go, handOffToQuiz } = useHomeEntry();
  const stored = useLocalStore(quizStore);
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const parsed = parseSearchQuery(query, services, cities);
    // Only one live city: no need to ask which one.
    const citySlug = parsed.citySlug ?? (cities.length === 1 ? cities[0].slug : null);
    if (citySlug) {
      go(citySlug, parsed.service, parsed.budgetBand);
    } else {
      handOffToQuiz({ service: parsed.service, budgetBand: parsed.budgetBand });
    }
  }

  const lastCitySlug = stored.citySlug;
  const lastService = stored.service;
  const lastCityName = cities.find((c) => c.slug === lastCitySlug)?.name;
  const exampleCity = cities[0]?.name ?? "Bangalore";

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={handleSearch}
        role="search"
        className="glass flex items-center gap-2 rounded-2xl border border-border p-2 shadow-raised transition-[border-color,box-shadow] duration-200 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-ring/15"
      >
        <svg
          viewBox="0 0 20 20"
          className="ml-2 h-5 w-5 flex-shrink-0 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M17 17l-4-4" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Try "affordable SEO agency in ${exampleCity}"`}
          aria-label="Search for an agency"
          className="min-h-11 w-full min-w-0 bg-transparent py-2 text-base text-text outline-none placeholder:text-text-muted focus-visible:outline-none"
        />
        <button type="submit" className={cn(ctaButton, "flex-shrink-0")}>
          Go
        </button>
      </form>

      {lastCitySlug && lastService && lastCityName && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/8 py-1 pl-4 pr-2">
          <p className="text-sm text-text">
            Continue to your last results in <span className="font-semibold">{lastCityName}</span>
          </p>
          <button
            type="button"
            onClick={() => go(lastCitySlug, lastService, stored.budgetBand)}
            className="inline-flex min-h-11 flex-shrink-0 items-center rounded-lg px-2 text-sm font-semibold text-primary-text transition-colors hover:underline"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

export function HomeQuiz({ className }: { className?: string }) {
  const { cities, services, quizKey, prefill, go, quizRef } = useHomeEntry();

  return (
    <div ref={quizRef} tabIndex={-1} className={cn("scroll-mt-24 rounded-2xl outline-none", className)}>
      <GuidedQuiz
        key={quizKey}
        services={services}
        cities={cities}
        initialService={prefill.service}
        initialBudgetBand={prefill.budgetBand}
        onComplete={(answers) => go(answers.citySlug as string, answers.service, answers.budgetBand)}
      />
    </div>
  );
}
