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
import { Container } from "@/components/Container";
import StickyActionBar from "@/components/StickyActionBar";
import Link from "next/link";
import { ctaButton, secondaryButton, sectionTitle } from "@/lib/styles";
import { formatDate } from "@/lib/utils";

interface CityPageClientProps {
  city: CityItem;
  services: ServiceItem[];
  localities: LocalityItem[];
  /** ISO date of the latest change to this city's listings. */
  updatedAt?: string | null;
}

const TRUST_POINTS = [
  "Matched on your service and budget",
  "Real, published prices where agencies share them",
  "One free quote request to your shortlist",
];

export default function CityPageClient({
  city,
  services,
  localities,
  updatedAt,
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

  const quoteHref = `/quote?city=${city.slug}${service ? `&service=${service.slug}` : ""}`;
  const quoteAction = (
    <Link href={quoteHref} className={ctaButton}>
      Request a quote
    </Link>
  );

  function backToTop3() {
    setExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const grid = (
    <AgencyGridView
      citySlug={city.slug}
      cityName={city.name}
      services={services}
      localities={localities}
      initialFilters={{ service: service?.slug ?? "" }}
      header={
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-text-muted hover:text-primary-text"
            >
              {service ? "← Back to top picks" : "← Back to quiz"}
            </button>
            <h1 className={sectionTitle}>All marketing agencies in {city.name}</h1>
          </div>
          {service && (
            <button type="button" onClick={retakeQuiz} className="inline-flex min-h-11 items-center text-sm font-medium text-primary-text hover:underline">
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
          <StickyActionBar>
            <button type="button" onClick={backToTop3} className={secondaryButton}>
              Find my top 3
            </button>
            {quoteAction}
          </StickyActionBar>
        </>
      );
    }
    return (
      <>
        <Container className="pb-12 pt-6 md:pb-16 md:pt-10 lg:pb-20">
          <header className="max-w-3xl">
            <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-section">
              Marketing agencies in {city.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
              <span>
                <span className="num font-semibold text-text">{city.agencyCount}</span> agencies listed
              </span>
              {updatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatDate(updatedAt)}</span>
                </>
              )}
            </p>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7 lg:order-2">
              <GuidedQuiz
                skipCity
                services={services}
                cities={[]}
                onComplete={(answers) => completeQuiz({ service: answers.service, budgetBand: answers.budgetBand })}
              />
            </div>
            <div className="lg:col-span-5 lg:order-1 lg:pt-2">
              <h2 className="hidden text-card font-semibold text-text lg:block">Get your top 3 in two taps</h2>
              <p className="hidden text-base text-text-muted lg:mt-2 lg:block">
                Tell us what you need and your monthly budget. We&apos;ll pick the three best-matched
                agencies in {city.name} — the full list is always one tap away.
              </p>
              <ul className="space-y-2 lg:mt-6 lg:space-y-3">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-text lg:text-base">
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-text" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary-text underline-offset-4 hover:underline lg:mt-6"
              >
                Or browse all {city.agencyCount > 0 ? `${city.agencyCount} ` : ""}agencies in {city.name} →
              </button>
            </div>
          </div>
        </Container>
        <StickyActionBar>
          <button type="button" onClick={() => setExpanded(true)} className={secondaryButton}>
            Browse all
          </button>
          {quoteAction}
        </StickyActionBar>
      </>
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
      <StickyActionBar>
        {expanded ? (
          <button type="button" onClick={backToTop3} className={secondaryButton}>
            Find my top 3
          </button>
        ) : (
          <button type="button" onClick={() => setExpanded(true)} className={secondaryButton}>
            See all agencies
          </button>
        )}
        {quoteAction}
      </StickyActionBar>
    </>
  );
}
