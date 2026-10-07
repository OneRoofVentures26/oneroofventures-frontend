import type { Billing, PricingType, Tier } from "@/lib/api/types";

/** Compact INR, e.g. ₹25k, ₹1.5L — for budget labels. */
export function formatPrice(value: number): string {
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${Math.round(value / 1000)}k`;
  }
  return `₹${value}`;
}

/** Exact INR with Indian digit grouping, e.g. ₹1,50,000. */
export function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function billingSuffix(billing: Billing | null | undefined): string {
  return billing === "ONE_TIME" ? " one-time" : "/mo";
}

/**
 * min == max → fixed price; min < max → range; both null → price on request.
 */
export function formatPackagePrice(
  priceMin: number | null,
  priceMax: number | null,
  billing: Billing | null | undefined,
): string {
  if (priceMin == null && priceMax == null) return "Price on request";
  const min = priceMin ?? priceMax!;
  const max = priceMax ?? priceMin!;
  const suffix = billingSuffix(billing);
  if (min === max) return `${formatINR(min)}${suffix}`;
  return `${formatINR(min)} – ${formatINR(max)}${suffix}`;
}

export function formatStartingPrice(price: number | null, billing: Billing | null): string {
  return price == null ? "Price on request" : `${formatINR(price)}${billingSuffix(billing)}`;
}

export const TIER_LABELS: Record<Tier, string> = {
  STARTER: "Starter",
  GROWTH: "Growth",
  PRO: "Pro",
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  FIXED: "Fixed prices",
  RANGE: "Price ranges",
  QUOTE_ONLY: "Quote only",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter((w) => /^[A-Za-z0-9&]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
