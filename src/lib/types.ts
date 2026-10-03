export type Service =
  | "SEO"
  | "Social Media"
  | "Paid Ads"
  | "Branding"
  | "Web Development"
  | "Content Marketing"
  | "Video Production";

export const ALL_SERVICES: Service[] = [
  "SEO",
  "Social Media",
  "Paid Ads",
  "Branding",
  "Web Development",
  "Content Marketing",
  "Video Production",
];

export interface PricingPackage {
  name: string;
  priceMin: number;
  priceMax: number;
  inclusions: string[];
}

export interface Review {
  id: string;
  author: string;
  company: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

export interface CaseStudy {
  title: string;
  client: string;
  before: string;
  after: string;
  metric: string;
}

export interface ScoreBreakdown {
  ratings: number;
  retention: number;
  results: number;
  responseTime: number;
}

export interface Agency {
  id: string;
  slug: string;
  city: string;
  name: string;
  logoUrl?: string;
  tagline: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  rating: number;
  reviewCount: number;
  teamSize: string;
  yearsActive: number;
  responseTime: string;
  services: Service[];
  industries: string[];
  languages: string[];
  packages: PricingPackage[];
  reviews: Review[];
  caseStudies: CaseStudy[];
  notableClients: string[];
  lastUpdated: string;
  premium?: boolean;
}

export interface City {
  slug: string;
  name: string;
  state: string;
  tagline: string;
}
