"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { compareAgencies, getAgencyProfile } from "@/lib/api/public";
import { ApiError, errorMessage } from "@/lib/api/http";
import type { AgencyProfile, CompareAgency, CompareResponse, ServiceItem, Tier } from "@/lib/api/types";
import { MAX_COMPARE, MIN_COMPARE, useCompare } from "@/lib/compare-context";
import { cn } from "@/lib/utils";
import { chip, ctaButton, primaryButton, secondaryButton } from "@/lib/styles";
import ComparisonTable from "@/components/ComparisonTable";

interface Result {
  key: string;
  data?: CompareResponse;
  profiles?: Map<number, AgencyProfile>;
  error?: unknown;
}

const noopSubscribe = () => () => {};

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  return Array.from(new Set(raw.split(",").map((x) => Number(x.trim())))).filter(
    (n) => Number.isInteger(n) && n > 0,
  );
}

export default function CompareClient({ services }: { services: ServiceItem[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, remove, setAll, clear } = useCompare();
  // The selection lives in localStorage; wait for it before deciding the list is empty.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const urlIds = parseIds(searchParams.get("ids"));
  const ids = urlIds.length > 0 ? urlIds : items.map((i) => i.id);
  const citySlug = searchParams.get("city") ?? items[0]?.citySlug ?? null;
  const key = ids.join(",");
  const validCount = ids.length >= MIN_COMPARE && ids.length <= MAX_COMPARE;

  const [result, setResult] = useState<Result | null>(null);
  const [activeService, setActiveService] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!validCount) return;
    const requestIds = key.split(",").map(Number);
    const controller = new AbortController();

    (async () => {
      try {
        const data = await compareAgencies(requestIds, undefined, controller.signal);
        // Compare cells have no package id; resolve them from each profile for quote links.
        const profiles = new Map<number, AgencyProfile>();
        if (citySlug) {
          const fetched = await Promise.all(
            data.agencies.map((a) => getAgencyProfile(citySlug, a.slug).catch(() => null)),
          );
          fetched.forEach((p) => p && profiles.set(p.id, p));
        }
        if (controller.signal.aborted) return;
        setResult({ key, data, profiles });
        // Shared links: adopt the URL's agencies as the current selection.
        if (citySlug) {
          setAll(data.agencies.map((a) => ({ id: a.id, name: a.name, slug: a.slug, citySlug })));
        }
      } catch (err) {
        if (!controller.signal.aborted) setResult({ key, error: err });
      }
    })();

    return () => controller.abort();
  }, [key, validCount, citySlug, setAll, attempt]);

  function handleRemove(id: number) {
    remove(id);
    const next = ids.filter((x) => x !== id);
    const params = new URLSearchParams();
    if (next.length > 0) params.set("ids", next.join(","));
    if (citySlug && next.length > 0) params.set("city", citySlug);
    router.replace(params.size > 0 ? `/compare?${params.toString()}` : "/compare");
  }

  function handleClear() {
    clear();
    router.replace("/compare");
  }

  if (!hydrated) return <CompareSkeleton />;

  if (!validCount) {
    return (
      <div className="border-y border-mist px-4 py-10 text-center">
        <p className="text-sm font-medium text-ink">
          {ids.length === 0 ? "No agencies selected yet" : "Add at least one more agency"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Browse a city and tick &quot;Compare&quot; on {MIN_COMPARE}–{MAX_COMPARE} agencies from the same city to
          see their packages side by side.
        </p>
        <Link
          href={citySlug ? `/${citySlug}` : "/"}
          className={cn(primaryButton, "mt-4")}
        >
          {citySlug ? "Browse agencies" : "Browse cities"}
        </Link>
      </div>
    );
  }

  const current = result?.key === key ? result : null;

  if (current?.error) {
    const err = current.error;
    const message =
      err instanceof ApiError && err.status === 404
        ? "One or more of these agencies is no longer listed."
        : err instanceof ApiError && err.status === 400
          ? (err.fields.agencyIds ?? "These agencies can't be compared together. Pick 2–4 agencies from the same city.")
          : errorMessage(err);
    return (
      <div className="border-y border-danger/40 px-4 py-10 text-center">
        <p className="text-sm font-medium text-ink">We couldn&apos;t load this comparison</p>
        <p className="mt-1 text-sm text-ink-soft">{message}</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className={secondaryButton}
          >
            Try again
          </button>
          <button
            onClick={handleClear}
            className={cn(secondaryButton, "border-mist text-ink hover:border-danger hover:bg-transparent hover:text-danger")}
          >
            Clear selection
          </button>
        </div>
      </div>
    );
  }

  if (!current?.data) return <CompareSkeleton />;

  const { data, profiles } = current;
  const serviceByCode = new Map(services.map((s) => [s.code, s]));
  const grids = data.services ?? {};
  const codes = Object.keys(grids);
  const activeTab = codes.includes(activeService) ? activeService : "";
  const shownCodes = activeTab ? [activeTab] : codes;

  function quoteHrefFor(code: string) {
    return (agency: CompareAgency, tier: Tier) => {
      if (!citySlug) return null;
      const pkg = profiles?.get(agency.id)?.packages[code]?.find((p) => p.tier === tier);
      if (!pkg) return null;
      const service = serviceByCode.get(code);
      return `/quote?city=${citySlug}&agency=${agency.slug}&package=${pkg.id}${service ? `&service=${service.slug}` : ""}`;
    };
  }

  const quoteAll = citySlug
    ? `/quote?city=${citySlug}&agencies=${data.agencies.map((a) => a.slug).join(",")}${
        shownCodes.length === 1 && serviceByCode.get(shownCodes[0]) ? `&service=${serviceByCode.get(shownCodes[0])!.slug}` : ""
      }`
    : null;

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] leading-tight text-ink sm:text-[32px]">Comparing {data.agencies.length} agencies</h1>
          <p className="mt-1 text-sm text-ink-soft">Packages side by side by Starter, Growth and Pro tier.</p>
        </div>
        {quoteAll && (
          <Link
            href={quoteAll}
            className={ctaButton}
          >
            Request quotes from these agencies
          </Link>
        )}
      </div>

      {codes.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {[{ code: "", label: "All services" }, ...codes.map((c) => ({ code: c, label: serviceByCode.get(c)?.name ?? c }))].map(
            (tab) => (
              <button
                key={tab.code || "all"}
                type="button"
                onClick={() => setActiveService(tab.code)}
                className={chip(tab.code === activeTab)}
              >
                {tab.label}
              </button>
            ),
          )}
        </div>
      )}

      {codes.length === 0 ? (
        <div className="border-y border-mist px-4 py-10 text-center">
          <p className="text-sm font-medium text-ink">None of these agencies have published packages yet</p>
          <p className="mt-1 text-sm text-ink-soft">Request quotes to get their prices directly.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {shownCodes.map((code) => (
            <section key={code}>
              <h2 className="mb-3 text-2xl text-ink">
                {serviceByCode.get(code)?.name ?? code}
              </h2>
              <ComparisonTable
                agencies={data.agencies}
                grid={grids[code]}
                citySlug={citySlug}
                quoteHref={quoteHrefFor(code)}
                onRemove={handleRemove}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 rounded-sm bg-mist/70" />
      <div className="h-72 border-y border-mist" />
    </div>
  );
}
