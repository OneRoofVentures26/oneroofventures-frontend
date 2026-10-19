import type { CityItem, ServiceItem } from "@/lib/api/types";

export interface QuizBudgetBand {
  key: string;
  label: string;
  phrase: string;
  /** Sent to the API as `budgetMax`; null = no limit. */
  max: number | null;
}

export const QUIZ_BUDGET_BANDS: QuizBudgetBand[] = [
  { key: "under10k", label: "Under ₹10k", phrase: "under ₹10k/mo", max: 10000 },
  { key: "under25k", label: "Under ₹25k", phrase: "under ₹25k/mo", max: 25000 },
  { key: "under50k", label: "Under ₹50k", phrase: "under ₹50k/mo", max: 50000 },
  { key: "under1l", label: "Under ₹1L", phrase: "under ₹1L/mo", max: 100000 },
  { key: "any", label: "Not sure yet", phrase: "", max: null },
];

export function getQuizBudgetBand(key: string): QuizBudgetBand | undefined {
  return QUIZ_BUDGET_BANDS.find((b) => b.key === key);
}

// ---------------------------------------------------------------------------
// Free-text search, e.g. "affordable SEO agency in Bangalore"
// ---------------------------------------------------------------------------

interface SearchParseResult {
  service: string | null;
  budgetBand: string;
  citySlug: string | null;
}

// Extra phrases per seeded service slug; service names and slugs are always matched too.
const SERVICE_ALIASES: Record<string, string[]> = {
  seo: ["seo", "search engine"],
  "social-media": ["social media", "social", "instagram", "smm"],
  ppc: ["ppc", "paid ads", "google ads", "facebook ads", "meta ads", "performance marketing", "ads"],
  website: ["website", "web design", "web dev", "web development", "landing page"],
  combo: ["combo", "full service", "full-service", "all in one"],
};

const CITY_ALIASES: Record<string, string[]> = {
  bangalore: ["bengaluru"],
  bengaluru: ["bangalore"],
  mumbai: ["bombay"],
  "delhi-ncr": ["delhi", "gurgaon", "gurugram", "noida", "ncr"],
  delhi: ["new delhi", "ncr"],
  chennai: ["madras"],
  kolkata: ["calcutta"],
};

const BUDGET_KEYWORDS: Array<{ key: string; keywords: string[] }> = [
  { key: "under10k", keywords: ["cheap", "cheapest", "low cost", "under 10"] },
  { key: "under25k", keywords: ["affordable", "budget", "inexpensive", "under 25"] },
  { key: "under50k", keywords: ["mid range", "moderate", "under 50"] },
  { key: "any", keywords: ["premium", "high end", "enterprise", "top tier"] },
];

export function parseSearchQuery(
  text: string,
  services: ServiceItem[],
  cities: CityItem[],
): SearchParseResult {
  const q = ` ${text.toLowerCase()} `;
  const has = (k: string) => q.includes(` ${k.toLowerCase()} `) || q.includes(` ${k.toLowerCase()}`);

  const service =
    services.find((s) =>
      [s.name, s.slug.replace(/-/g, " "), s.code.replace(/_/g, " "), ...(SERVICE_ALIASES[s.slug] ?? [])].some(has),
    )?.slug ?? null;

  const citySlug =
    cities.find((c) => [c.name, c.slug.replace(/-/g, " "), ...(CITY_ALIASES[c.slug] ?? [])].some(has))?.slug ??
    null;

  const budgetBand = BUDGET_KEYWORDS.find((b) => b.keywords.some(has))?.key ?? "";
  return { service, budgetBand, citySlug };
}
