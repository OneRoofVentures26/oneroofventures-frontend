"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CityItem, ServiceItem } from "@/lib/api/types";
import { useLocalStore } from "@/lib/local-store";
import { quizStore, parseSearchQuery } from "@/lib/quiz";
import GuidedQuiz from "@/components/GuidedQuiz";

export default function HomeEntry({ cities, services }: { cities: CityItem[]; services: ServiceItem[] }) {
  const router = useRouter();
  const stored = useLocalStore(quizStore);
  const [query, setQuery] = useState("");
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const parsed = parseSearchQuery(query, services, cities);
    // Only one live city: no need to ask which one.
    const citySlug = parsed.citySlug ?? (cities.length === 1 ? cities[0].slug : null);
    if (citySlug) {
      go(citySlug, parsed.service, parsed.budgetBand);
    } else {
      setPrefill({ service: parsed.service, budgetBand: parsed.budgetBand });
      setQuizKey((k) => k + 1);
    }
  }

  const lastCitySlug = stored.citySlug;
  const lastService = stored.service;
  const lastCityName = cities.find((c) => c.slug === lastCitySlug)?.name;
  const exampleCity = cities[0]?.name ?? "Bangalore";

  return (
    <div className="mx-auto w-full max-w-xl">
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2 shadow-sm"
      >
        <svg
          viewBox="0 0 20 20"
          className="ml-1 h-5 w-5 flex-shrink-0 text-ink-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M17 17l-4-4" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Try "affordable SEO agency in ${exampleCity}"`}
          className="min-w-0 w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-soft"
        />
        <button
          type="submit"
          className="flex-shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Go
        </button>
      </form>

      {lastCitySlug && lastService && lastCityName && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/30 bg-accent-light px-4 py-3">
          <p className="text-sm text-accent-dark">
            Continue to your last results in <span className="font-semibold">{lastCityName}</span>
          </p>
          <button
            type="button"
            onClick={() => go(lastCitySlug, lastService, stored.budgetBand)}
            className="flex-shrink-0 text-sm font-semibold text-accent-dark hover:underline"
          >
            Continue →
          </button>
        </div>
      )}

      <div className="mt-6">
        <GuidedQuiz
          key={quizKey}
          services={services}
          cities={cities}
          initialService={prefill.service}
          initialBudgetBand={prefill.budgetBand}
          onComplete={(answers) => go(answers.citySlug as string, answers.service, answers.budgetBand)}
        />
      </div>
    </div>
  );
}
