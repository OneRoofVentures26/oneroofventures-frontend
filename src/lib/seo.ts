import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

/**
 * Metadata for a dynamic page whose city, agency, service or area doesn't
 * exist, so the 404 doesn't fall back to the homepage title. Never indexed.
 */
export const NOT_FOUND_METADATA: Metadata = {
  title: "Page not found | OneRoof Ventures",
  robots: { index: false },
};

/** The publisher for Article and FAQ structured data. */
export const ORGANIZATION_LD = {
  "@type": "Organization",
  name: "OneRoof Ventures",
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
};

/** BreadcrumbList structured data from [name, path] pairs, home first. */
export function breadcrumbLd(items: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  };
}
