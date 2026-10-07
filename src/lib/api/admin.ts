// Admin API (Bearer token, role ADMIN). Client-side only.

import { getSession, logout } from "@/lib/admin-auth";
import { ApiError, buildUrl, readJson, toApiError } from "@/lib/api/http";
import type {
  AdminAgencyFilters,
  AdminLeadFilters,
  AgencyPatchRequest,
  AgencyRequest,
  AgencyResponse,
  CityRequest,
  CityResponse,
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

export function deleteAgency(id: number): Promise<void> {
  return request("DELETE", `/agencies/${id}`);
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
