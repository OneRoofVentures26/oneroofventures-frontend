"use client";

import { useEffect, useState } from "react";
import { listAgencies } from "@/lib/api/public";
import type { AgencyListItem, ListingParams, Page } from "@/lib/api/types";

function listingKey(citySlug: string, params: ListingParams): string {
  // Drop empty values so equivalent filter sets share a cache entry.
  const clean = Object.fromEntries(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== false)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return JSON.stringify([citySlug, clean]);
}

export interface ListingState {
  data: Page<AgencyListItem> | undefined;
  error: unknown;
  loading: boolean;
  retry: () => void;
}

/**
 * Fetches a city listing from the browser, caching each filter combination for
 * the lifetime of the component. `initial` seeds the cache with server-rendered data.
 */
export function useListing(
  citySlug: string,
  params: ListingParams,
  initial?: { params: ListingParams; data: Page<AgencyListItem> },
): ListingState {
  const key = listingKey(citySlug, params);
  const [cache, setCache] = useState(
    () => new Map<string, Page<AgencyListItem>>(initial ? [[listingKey(citySlug, initial.params), initial.data]] : []),
  );
  const [failure, setFailure] = useState<{ key: string; error: unknown } | null>(null);
  const [attempt, setAttempt] = useState(0);

  const data = cache.get(key);
  const cached = data !== undefined;
  const error = failure?.key === key ? failure.error : null;

  useEffect(() => {
    if (cached) return;
    const [city, query] = JSON.parse(key) as [string, ListingParams];
    const controller = new AbortController();
    listAgencies(city, query, controller.signal).then(
      (page) => setCache((prev) => new Map(prev).set(key, page)),
      (err) => {
        if (!controller.signal.aborted) setFailure({ key, error: err });
      },
    );
    return () => controller.abort();
  }, [key, cached, attempt]);

  function retry() {
    setFailure(null);
    setAttempt((n) => n + 1);
  }

  return { data, error, loading: !cached && !error, retry };
}
