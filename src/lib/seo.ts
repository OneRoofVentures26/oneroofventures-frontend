import type { Metadata } from "next";

/**
 * Metadata for a dynamic page whose city, agency, service or area doesn't
 * exist, so the 404 doesn't fall back to the homepage title. Never indexed.
 */
export const NOT_FOUND_METADATA: Metadata = {
  title: "Page not found | OneRoof Ventures",
  robots: { index: false },
};
