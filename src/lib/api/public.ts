// Public (no-auth) API. Usable from server and client components.
// Never attach the admin token here: an expired token makes public calls fail with 401.

import { API_BASE_URL, PUBLIC_REVALIDATE_SECONDS } from "@/lib/config";
import { buildUrl, readJson, toApiError } from "@/lib/api/http";
import type {
  AgencyListItem,
  AgencyProfile,
  CityItem,
  CompareResponse,
  LeadCreated,
  LeadRequest,
  ListingParams,
  LocalityItem,
  Page,
  ServiceItem,
  SitemapEntries,
} from "@/lib/api/types";

interface GetOptions {
  query?: Parameters<typeof buildUrl>[1];
  signal?: AbortSignal;
}

async function get<T>(path: string, { query, signal }: GetOptions = {}): Promise<T> {
  const res = await fetch(buildUrl(path, query), {
    headers: { Accept: "application/json" },
    signal,
    next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw await toApiError(res);
  return readJson<T>(res);
}

const enc = encodeURIComponent;

export function getCities(): Promise<CityItem[]> {
  return get("/api/v1/cities");
}

export function getServices(): Promise<ServiceItem[]> {
  return get("/api/v1/services");
}

/** Localities in a city that have at least one published agency. 404 for unknown city. */
export function getLocalities(citySlug: string): Promise<LocalityItem[]> {
  return get(`/api/v1/cities/${enc(citySlug)}/localities`);
}

export function listAgencies(
  citySlug: string,
  params: ListingParams = {},
  signal?: AbortSignal,
): Promise<Page<AgencyListItem>> {
  return get(`/api/v1/cities/${enc(citySlug)}/agencies`, {
    signal,
    query: {
      service: params.service,
      locality: params.locality,
      budgetMax: params.budgetMax,
      pricesOnly: params.pricesOnly || undefined,
      verifiedOnly: params.verifiedOnly || undefined,
      sort: params.sort,
      page: params.page,
      size: params.size,
    },
  });
}

export function getAgencyProfile(citySlug: string, agencySlug: string): Promise<AgencyProfile> {
  return get(`/api/v1/cities/${enc(citySlug)}/agencies/${enc(agencySlug)}`);
}

/** 2–4 published agencies from the same city. `service` accepts a code or slug. */
export function compareAgencies(
  agencyIds: number[],
  service?: string,
  signal?: AbortSignal,
): Promise<CompareResponse> {
  return get("/api/v1/compare", { query: { agencyIds, service }, signal });
}

export function getSitemapEntries(): Promise<SitemapEntries> {
  return get("/api/v1/sitemap-entries");
}

/**
 * Submit a quote request. Must be called from the browser so the backend's
 * per-IP rate limit applies to the visitor, not to the Next.js server.
 */
export async function createLead(body: LeadRequest): Promise<LeadCreated> {
  const res = await fetch(buildUrl("/api/v1/leads"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw await toApiError(res);
  return readJson<LeadCreated>(res);
}

let warmedUp = false;

/**
 * Fire-and-forget request that wakes the backend if Render has put it to sleep,
 * so it's ready by the time the visitor submits a form. Browser only.
 */
export function warmUpBackend(): void {
  if (warmedUp || typeof window === "undefined") return;
  warmedUp = true;
  // no-cors: we only need the request to arrive, not to read the response.
  fetch(`${API_BASE_URL}/actuator/health`, { mode: "no-cors", cache: "no-store" }).catch(() => {
    warmedUp = false;
  });
}
