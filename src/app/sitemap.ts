import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/api/public";
import type { SitemapEntry } from "@/lib/api/types";
import { SITE_URL } from "@/lib/config";

export const revalidate = 3600;

const STATIC_PATHS = ["/", "/compare", "/services", "/about"];

function lastModified(entry: SitemapEntry): Date | undefined {
  return entry.updatedAt ? new Date(entry.updatedAt) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
  }));

  const entries = await getSitemapEntries().catch(() => null);
  if (!entries) return staticEntries;

  return [
    ...staticEntries,
    ...entries.cities.map((e) => ({
      url: `${SITE_URL}/${e.citySlug}`,
      lastModified: lastModified(e),
      priority: 0.9,
    })),
    ...entries.cityServices.map((e) => ({
      url: `${SITE_URL}/${e.citySlug}/services/${e.serviceSlug}`,
      lastModified: lastModified(e),
      priority: 0.8,
    })),
    ...entries.cityLocalities.map((e) => ({
      url: `${SITE_URL}/${e.citySlug}/areas/${e.localitySlug}`,
      lastModified: lastModified(e),
      priority: 0.7,
    })),
    ...entries.agencies.map((e) => ({
      url: `${SITE_URL}/${e.citySlug}/${e.agencySlug}`,
      lastModified: lastModified(e),
      priority: 0.6,
    })),
  ];
}
