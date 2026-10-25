import type { MetadataRoute } from "next";
import { getCities, getServices, getSitemapEntries } from "@/lib/api/public";
import type { SitemapEntry } from "@/lib/api/types";
import { SITE_URL } from "@/lib/config";

/*
 * /sitemap.xml, linked from robots.txt. Built from the backend's sitemap feed
 * (every city, city + service, city + area and agency page, with last-modified
 * dates). If that feed is down, it falls back to the cities and services lists
 * so search engines still get every city page instead of only the static ones.
 * /admin and /quote are left out on purpose (robots.txt disallows them).
 */

export const revalidate = 3600;

type Sitemap = MetadataRoute.Sitemap;

const STATIC_PAGES: Sitemap = [
  { url: SITE_URL, changeFrequency: "daily", priority: 1 },
  { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.4 },
];

function lastModified(entry: SitemapEntry): Date | undefined {
  return entry.updatedAt ? new Date(entry.updatedAt) : undefined;
}

async function fromFeed(): Promise<Sitemap | null> {
  const entries = await getSitemapEntries().catch(() => null);
  if (!entries) return null;

  return [
    ...entries.cities.map((e) => ({
      url: `${SITE_URL}/${e.citySlug}`,
      lastModified: lastModified(e),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...entries.cityServices
      .filter((e) => e.serviceSlug)
      .map((e) => ({
        url: `${SITE_URL}/${e.citySlug}/services/${e.serviceSlug}`,
        lastModified: lastModified(e),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ...entries.cityLocalities
      .filter((e) => e.localitySlug)
      .map((e) => ({
        url: `${SITE_URL}/${e.citySlug}/areas/${e.localitySlug}`,
        lastModified: lastModified(e),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...entries.agencies
      .filter((e) => e.agencySlug)
      .map((e) => ({
        url: `${SITE_URL}/${e.citySlug}/${e.agencySlug}`,
        lastModified: lastModified(e),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ];
}

/** Live cities and every city + service page, without dates. */
async function fromLists(): Promise<Sitemap> {
  const [cities, services] = await Promise.all([
    getCities().catch(() => []),
    getServices().catch(() => []),
  ]);
  const live = cities.filter((c) => c.agencyCount > 0);
  return live.flatMap((city) => [
    { url: `${SITE_URL}/${city.slug}`, changeFrequency: "daily" as const, priority: 0.9 },
    ...services.map((service) => ({
      url: `${SITE_URL}/${city.slug}/services/${service.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]);
}

export default async function sitemap(): Promise<Sitemap> {
  const dynamic = (await fromFeed()) ?? (await fromLists());
  // De-duplicate in case the feed repeats a URL.
  const seen = new Set<string>();
  return [...STATIC_PAGES, ...dynamic].filter((e) => !seen.has(e.url) && seen.add(e.url));
}
