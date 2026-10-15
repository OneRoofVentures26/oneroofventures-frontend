"use server";

// Admin writes go from the browser straight to the backend, so the admin UI calls this
// after a write succeeds to refresh the public pages that show the changed data.

import { updateTag } from "next/cache";
import { buildUrl } from "@/lib/api/http";
import { isCacheTag } from "@/lib/cache-tags";

export interface RefreshRequest {
  tags?: string[];
  /** Refreshes `agency:<slug>` and `city:<city>` for each agency, looked up by id. */
  agencyIds?: number[];
  /** Refreshes `city:<slug>` for every city. */
  allCities?: boolean;
}

const MAX_AGENCY_IDS = 20;

async function adminGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(buildUrl(`/api/v1/admin${path}`), {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? "Unauthorized" : `Request failed (${res.status})`);
  return (await res.json()) as T;
}

export async function refreshPublicCache(token: string, { tags = [], agencyIds = [], allCities = false }: RefreshRequest): Promise<void> {
  if (typeof token !== "string" || !token) throw new Error("Unauthorized");

  // Server Actions are publicly reachable: this admin-only call doubles as the token check.
  const cities = await adminGet<Array<{ slug: string }>>("/cities", token);

  const toRefresh = new Set<string>(Array.isArray(tags) ? tags : []);
  if (allCities === true) {
    for (const c of cities) toRefresh.add(`city:${c.slug}`);
  }
  const ids = (Array.isArray(agencyIds) ? agencyIds : []).filter(Number.isInteger).slice(0, MAX_AGENCY_IDS);
  const agencies = await Promise.all(
    ids.map((id) => adminGet<{ slug: string; citySlug: string }>(`/agencies/${id}`, token).catch(() => null)),
  );
  for (const a of agencies) {
    if (!a) continue;
    toRefresh.add(`agency:${a.slug}`);
    toRefresh.add(`city:${a.citySlug}`);
  }

  for (const tag of toRefresh) {
    if (isCacheTag(tag)) updateTag(tag);
  }
}
