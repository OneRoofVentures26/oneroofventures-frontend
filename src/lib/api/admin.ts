// Admin API (Bearer token, role ADMIN). Client-side only.

import { getSession, logout } from "@/lib/admin-auth";
import { ApiError, buildUrl, readJson, toApiError } from "@/lib/api/http";
import { refreshPublicCache, type RefreshRequest } from "@/app/admin/actions";
import type {
  AdminAgencyFilters,
  AdminContactFilters,
  AdminLeadFilters,
  AgencyBulkStatusResult,
  AgencyPatchRequest,
  AgencyRequest,
  AgencyRatingsRequest,
  AgencyResponse,
  AgencyStatus,
  CityLogoFetchResult,
  CityRequest,
  CityResponse,
  ContactRequestResponse,
  ContactStatus,
  ImportReport,
  LeadResponse,
  LeadStatus,
  LocalityRequest,
  LocalityResponse,
  PackageRequest,
  PackageResponse,
  PackageSuggestions,
  Page,
  RateLimitReset,
  ScoreRecomputeResult,
  ServiceRequest,
  ServiceResponse,
} from "@/lib/api/types";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  query?: Parameters<typeof buildUrl>[1];
  json?: unknown;
  form?: FormData;
}

async function request<T>(method: Method, path: string, { query, json, form }: RequestOptions = {}): Promise<T> {
  const session = getSession();
  if (!session) {
    logout();
    throw new ApiError(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
  };
  let body: BodyInit | undefined;
  if (form) {
    body = form;
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const res = await fetch(buildUrl(`/api/v1/admin${path}`, query), {
    method,
    headers,
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await toApiError(res);
    // Expired or forged token: send the admin back to the login screen.
    if (res.status === 401) logout();
    if (res.status === 403) {
      throw new ApiError(403, err.code, "Your account doesn't have admin access to do this.", err.fields);
    }
    throw err;
  }
  return readJson<T>(res);
}

// ---------------------------------------------------------------------------
// Public cache refresh
// ---------------------------------------------------------------------------

/**
 * Refreshes the public pages that show data changed by an admin write. Call only after the
 * write succeeds. Never throws: a missed refresh only delays the public site.
 */
export function refreshPublic(req: RefreshRequest): Promise<void> {
  const session = getSession();
  if (!session) return Promise.resolve();
  return refreshPublicCache(session.token, req).catch((err) => console.warn("Public cache refresh failed", err));
}

/** Tags for an agency write. Pass the stored agency before and after the change (or one of them for create/delete). */
export function agencyTags(
  before: Pick<AgencyResponse, "slug" | "citySlug" | "status"> | null,
  after: Pick<AgencyResponse, "slug" | "citySlug" | "status"> | null,
): string[] {
  const tags = new Set<string>();
  for (const a of [before, after]) {
    if (!a) continue;
    tags.add(`agency:${a.slug}`);
    tags.add(`city:${a.citySlug}`);
  }
  // Added, deleted, moved city, or published/hidden: city list and homepage stats change too.
  if (!before || !after || before.citySlug !== after.citySlug || before.status !== after.status) tags.add("cities");
  return [...tags];
}

// ---------------------------------------------------------------------------
// Agencies & packages
// ---------------------------------------------------------------------------

export function listAgencies(filters: AdminAgencyFilters = {}): Promise<Page<AgencyResponse>> {
  return request("GET", "/agencies", { query: { ...filters } });
}

export function getAgency(id: number): Promise<AgencyResponse> {
  return request("GET", `/agencies/${id}`);
}

export function createAgency(body: AgencyRequest): Promise<AgencyResponse> {
  return request("POST", "/agencies", { json: body });
}

/** Full replace: null text fields are cleared; null verified/status/serviceCodes are left unchanged. */
export function updateAgency(id: number, body: AgencyRequest): Promise<AgencyResponse> {
  return request("PUT", `/agencies/${id}`, { json: body });
}

export function patchAgency(id: number, body: AgencyPatchRequest): Promise<AgencyResponse> {
  return request("PATCH", `/agencies/${id}`, { json: body });
}

/** Sets one status on up to 200 agencies. All or nothing: an unknown id (404) changes none. */
export function setAgenciesStatus(agencyIds: number[], status: AgencyStatus): Promise<AgencyBulkStatusResult> {
  return request("PATCH", "/agencies/status", { json: { agencyIds, status } });
}

/**
 * FIXED and RANGE agencies promise prices, so the backend refuses to publish
 * them (400 on `fields.status` / `fields.agencyIds`) until they have a package.
 */
export function needsPackageToPublish(a: Pick<AgencyResponse, "pricingType" | "packageCount">): boolean {
  return a.pricingType !== "QUOTE_ONLY" && a.packageCount === 0;
}

export const NEEDS_PACKAGE_HINT = "Add a package first, or set the pricing type to Quote only.";

/**
 * Replaces all six rating values, like a row of the quality sheet: null clears
 * one. The score is recomputed a few seconds later, so the response still has
 * the old one. A later quality CSV upload overwrites these.
 */
export function updateAgencyRatings(id: number, body: AgencyRatingsRequest): Promise<AgencyResponse> {
  return request("PUT", `/agencies/${id}/ratings`, { json: body });
}

export function deleteAgency(id: number): Promise<void> {
  return request("DELETE", `/agencies/${id}`);
}

/**
 * Recomputes One Roof Scores now and waits until done; all active cities when
 * `city` is left out. Not needed day to day: scores follow every agency change
 * within seconds and are recomputed nightly.
 */
export function recomputeScores(city?: string): Promise<ScoreRecomputeResult[]> {
  return request("POST", "/scores/recompute", { query: { city } });
}

// Logos. Every endpoint gives 503 LOGO_STORAGE_NOT_CONFIGURED when the server has no storage set up.

/** Fetches the logo from the agency's website now. 409 when the logo was uploaded by hand: resend with force. */
export function fetchAgencyLogo(id: number, force = false): Promise<AgencyResponse> {
  return request("POST", `/agencies/${id}/logo/fetch`, { query: { force: force || undefined } });
}

/** Queues logo fetches for every agency in a city (any status); they arrive over the next minutes. */
export function fetchCityLogos(city: string, onlyMissing = true): Promise<CityLogoFetchResult> {
  return request("POST", "/agencies/logos/fetch", { query: { city, onlyMissing } });
}

/** PNG, JPEG, WebP, SVG, ICO or GIF under 500 KB. Sets logoSource to MANUAL. */
export function uploadAgencyLogo(id: number, file: File): Promise<AgencyResponse> {
  const form = new FormData();
  form.append("file", file);
  return request("PUT", `/agencies/${id}/logo`, { form });
}

export function deleteAgencyLogo(id: number): Promise<void> {
  return request("DELETE", `/agencies/${id}/logo`);
}

export function listPackages(agencyId: number): Promise<PackageResponse[]> {
  return request("GET", `/agencies/${agencyId}/packages`);
}

export function createPackage(agencyId: number, body: PackageRequest): Promise<PackageResponse> {
  return request("POST", `/agencies/${agencyId}/packages`, { json: body });
}

export function updatePackage(agencyId: number, packageId: number, body: PackageRequest): Promise<PackageResponse> {
  return request("PUT", `/agencies/${agencyId}/packages/${packageId}`, { json: body });
}

export function deletePackage(agencyId: number, packageId: number): Promise<void> {
  return request("DELETE", `/agencies/${agencyId}/packages/${packageId}`);
}

export function getPackageSuggestions(agencyId: number): Promise<PackageSuggestions> {
  return request("GET", `/agencies/${agencyId}/package-suggestions`);
}

/** All or nothing, 1–15 packages. */
export function bulkCreatePackages(agencyId: number, packages: PackageRequest[]): Promise<PackageResponse[]> {
  return request("POST", `/agencies/${agencyId}/packages/bulk`, { json: { packages } });
}

export function importAgenciesCsv(file: File): Promise<ImportReport> {
  const form = new FormData();
  form.append("file", file);
  return request("POST", "/import/agencies", { form });
}

/** Updates quality data on existing agencies only; `created` is always 0. Excluded or not-live rows become HIDDEN. */
export function importAgencyQualityCsv(file: File): Promise<ImportReport> {
  const form = new FormData();
  form.append("file", file);
  return request("POST", "/import/agency-quality", { form });
}

// ---------------------------------------------------------------------------
// Cities, localities, services
// ---------------------------------------------------------------------------

export function listCities(): Promise<CityResponse[]> {
  return request("GET", "/cities");
}

export function createCity(body: CityRequest): Promise<CityResponse> {
  return request("POST", "/cities", { json: body });
}

export function updateCity(id: number, body: CityRequest): Promise<CityResponse> {
  return request("PUT", `/cities/${id}`, { json: body });
}

export function deleteCity(id: number): Promise<void> {
  return request("DELETE", `/cities/${id}`);
}

export function listLocalities(cityId?: number): Promise<LocalityResponse[]> {
  return request("GET", "/localities", { query: { cityId } });
}

export function createLocality(body: LocalityRequest): Promise<LocalityResponse> {
  return request("POST", "/localities", { json: body });
}

export function updateLocality(id: number, body: LocalityRequest): Promise<LocalityResponse> {
  return request("PUT", `/localities/${id}`, { json: body });
}

export function deleteLocality(id: number): Promise<void> {
  return request("DELETE", `/localities/${id}`);
}

export function listServices(): Promise<ServiceResponse[]> {
  return request("GET", "/services");
}

export function createService(body: ServiceRequest): Promise<ServiceResponse> {
  return request("POST", "/services", { json: body });
}

export function updateService(id: number, body: ServiceRequest): Promise<ServiceResponse> {
  return request("PUT", `/services/${id}`, { json: body });
}

export function deleteService(id: number): Promise<void> {
  return request("DELETE", `/services/${id}`);
}

// ---------------------------------------------------------------------------
// Leads & rate limits
// ---------------------------------------------------------------------------

export function listLeads(filters: AdminLeadFilters = {}): Promise<Page<LeadResponse>> {
  return request("GET", "/leads", { query: { ...filters } });
}

export function updateLeadStatus(id: number, status: LeadStatus): Promise<LeadResponse> {
  return request("PATCH", `/leads/${id}`, { json: { status } });
}

/** 202: emails are re-sent in the background. */
export function resendLead(id: number): Promise<void> {
  return request("POST", `/leads/${id}/resend`);
}

export function resetLeadRateLimit(ip: string): Promise<RateLimitReset> {
  return request("DELETE", "/rate-limits/leads", { query: { ip } });
}

// ---------------------------------------------------------------------------
// Contact requests ("Contact us" form; nothing is emailed, so this is the only place they show)
// ---------------------------------------------------------------------------

export function listContactRequests(filters: AdminContactFilters = {}): Promise<Page<ContactRequestResponse>> {
  return request("GET", "/contact-requests", { query: { ...filters } });
}

export function updateContactRequestStatus(id: number, status: ContactStatus): Promise<ContactRequestResponse> {
  return request("PATCH", `/contact-requests/${id}`, { json: { status } });
}

/** The contact form has its own limit, separate from quote requests. */
export function resetContactRateLimit(ip: string): Promise<RateLimitReset> {
  return request("DELETE", "/rate-limits/contact", { query: { ip } });
}
