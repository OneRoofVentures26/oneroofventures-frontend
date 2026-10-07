"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { CityItem, LocalityItem, ServiceItem } from "@/lib/api/types";
import { useLocalStore } from "@/lib/local-store";
import { getQuizBudgetBand, quizStore } from "@/lib/quiz";
import GuidedQuiz from "@/components/GuidedQuiz";
import TopPicksView from "@/components/TopPicksView";
import AgencyGridView from "@/components/AgencyGridView";
import CompareBar from "@/components/CompareBar";

interface CityPageClientProps {
  city: CityItem;
  services: ServiceItem[];
  localities: LocalityItem[];
}

export default function CityPageClient({
  city,
  services,
  localities,
}: CityPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");
  const initialService = serviceParam && services.some((s) => s.slug === serviceParam) ? serviceParam : null;
  const initialBudgetBand = searchParams.get("budget") ?? "";
  const stored = useLocalStore(quizStore);
  const [expanded, setExpanded] = useState(false);

  // Only trust stored answers that were given for this city and still exist.
  const storedService = stored.citySlug === city.slug ? stored.service : null;
  const serviceSlug = initialService ?? storedService;
  const service = services.find((s) => s.slug === serviceSlug) ?? null;
  const budgetBand = initialBudgetBand || (stored.citySlug === city.slug ? stored.budgetBand : "");
  const band = getQuizBudgetBand(budgetBand);

  // Keep persisted answers in sync when arriving via a URL (shared link or
  // quiz-driven navigation) that carries different answers than storage.
  useEffect(() => {
    if (
      initialService &&
      (initialService !== stored.service ||
        initialBudgetBand !== stored.budgetBand ||
        stored.citySlug !== city.slug)
    ) {
      quizStore.write({
        service: initialService,
        budgetBand: initialBudgetBand || stored.budgetBand,
        citySlug: city.slug,
      });
    }
  }, [initialService, initialBudgetBand, stored.service, stored.budgetBand, stored.citySlug, city.slug]);

  function completeQuiz(answers: { service: string; budgetBand: string }) {
    quizStore.write({ service: answers.service, budgetBand: answers.budgetBand, citySlug: city.slug });
    router.replace(`${pathname}?service=${encodeURIComponent(answers.service)}&budget=${answers.budgetBand}`);
  }

  function retakeQuiz() {
    quizStore.write({ service: null, budgetBand: "", citySlug: city.slug });
    router.replace(pathname);
    setExpanded(false);
  }

  const grid = (
    <AgencyGridView
      citySlug={city.slug}
      cityName={city.name}
      services={services}
      localities={localities}
      initialFilters={{ service: service?.slug ?? "" }}
      header={
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-sm font-medium text-ink-soft hover:text-accent"
            >
              {service ? "← Back to top picks" : "← Back to quiz"}
            </button>
            <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">All marketing agencies in {city.name}</h1>
          </div>
          {service && (
            <button type="button" onClick={retakeQuiz} className="text-sm font-medium text-accent hover:underline">
              Retake quiz
            </button>
          )}
        </div>
      }
    />
  );

  if (!service) {
    if (expanded) {
      return (
        <>
          {grid}
          <CompareBar />
        </>
      );
    }
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <GuidedQuiz
          skipCity
          cityName={city.name}
          services={services}
          cities={[]}
          onComplete={(answers) => completeQuiz({ service: answers.service, budgetBand: answers.budgetBand })}
        />
        <p className="mt-4 text-center text-sm text-ink-soft">
          or{" "}
          <button type="button" onClick={() => setExpanded(true)} className="font-medium text-accent hover:underline">
            browse all {city.agencyCount > 0 ? `${city.agencyCount} ` : ""}agencies in {city.name}
          </button>
        </p>
      </div>
    );
  }

  return (
    <>
      <TopPicksView
        key={`${service.slug}-${budgetBand}-${city.slug}`}
        citySlug={city.slug}
        cityName={city.name}
        service={service}
        band={band}
        totalInCity={city.agencyCount}
        expanded={expanded}
        onExpand={() => setExpanded(true)}
        onRetake={retakeQuiz}
        expandedContent={grid}
      />
      <CompareBar />
    </>
  );
}
