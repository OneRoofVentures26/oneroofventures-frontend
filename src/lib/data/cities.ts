import type { City } from "@/lib/types";

export const CITIES: City[] = [
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    state: "Delhi / Haryana / UP",
    tagline: "India's largest hub for performance marketing & branding agencies",
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    tagline: "Home to the country's biggest creative and media agencies",
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    tagline: "The growth-marketing capital for startups and SaaS brands",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    tagline: "A fast-growing market for digital-first marketing teams",
  },
  {
    slug: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    tagline: "Strong regional expertise across D2C and manufacturing brands",
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    tagline: "Established agencies with deep regional market knowledge",
  },
  {
    slug: "pune",
    name: "Pune",
    state: "Maharashtra",
    tagline: "A rising base for B2B and IT-sector marketing specialists",
  },
  {
    slug: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    tagline: "Trusted partners for D2C, retail and manufacturing brands",
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    tagline: "Boutique agencies serving hospitality, retail and exports",
  },
  {
    slug: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    tagline: "Emerging agency talent serving North India's growing brands",
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}
