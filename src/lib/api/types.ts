// DTOs for the oneroofventures backend (see frontend-api-guide.md / Swagger).

export type PricingType = "FIXED" | "RANGE" | "QUOTE_ONLY";
export type Tier = "STARTER" | "GROWTH" | "PRO";
export type Billing = "MONTHLY" | "ONE_TIME";
export type AgencyStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";
export type LeadStatus = "NEW" | "SENT" | "CONTACTED" | "CLOSED" | "SPAM";
export type EmailStatus = "SENT" | "FAILED" | "NO_EMAIL";
export type ListingSort = "recent" | "price_asc" | "price_desc" | "name" | "score";

export const TIERS: Tier[] = ["STARTER", "GROWTH", "PRO"];

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  fields?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export interface CityItem {
  name: string;
  slug: string;
  agencyCount: number;
}

export interface LocalityItem {
  name: string;
  slug: string;
}

export interface ServiceItem {
  code: string;
  name: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// One Roof Score (Beta) and public quality data
// ---------------------------------------------------------------------------

/** "Beta" = scored (number shown); "New" = too little data (badge, no number); null = not scored yet. */
export type ScoreLabel = "Beta" | "New";
export type ScorePillar = "transparency" | "profile" | "reputation";

/** Raw points for one fact. Lines don't sum to the pillar totals (pillars are scaled to their weight). */
export interface ScoreLine {
  pillar: ScorePillar;
  /** Stable, e.g. "pricing_type", "google_rating". */
  code: string;
  label: string;
  points: number;
  max: number;
}

/**
 * Pillars add up to the score (out of 100). Each is out of maxPoints: 40 / 25 / 35
 * for priced agencies; quote-only agencies have no transparency pillar (null) and
 * profile / reputation are scaled up to fill 100.
 */
export interface ScoreBreakdown {
  transparency: number | null;
  profile: number;
  reputation: number;
  maxPoints: {
    transparency: number | null;
    profile: number;
    reputation: number;
  };
  /** One line per fact, grouped by pillar; the count varies (10 priced, 7 quote-only). */
  lines: ScoreLine[];
}

export interface ScoreFields {
  score: number | null;
  scoreLabel: ScoreLabel | null;
}

export interface ScoreDetailFields extends ScoreFields {
  /** Null unless scoreLabel is "Beta". */
  scoreBreakdown: ScoreBreakdown | null;
}

/** Public quality data. Always present; any field is null when it wasn't checked. */
export interface PublicQuality {
  googleRating: number | null;
  googleReviews: number | null;
  clutchRating: number | null;
  clutchReviews: number | null;
  goodFirmsRating: number | null;
  goodFirmsReviews: number | null;
  caseStudies: number | null;
  /** Case studies show measurable results. */
  resultsShown: boolean | null;
  caseStudyUrl: string | null;
  foundedYear: number | null;
  lastCheckedOn: string | null;
}

export interface AgencyListItem extends ScoreFields {
  id: number;
  slug: string;
  name: string;
  /** Locality name (not slug), or null. */
  locality: string | null;
  teamSize: string | null;
  services: ServiceItem[];
  pricingType: PricingType;
  verified: boolean;
  startingPrice: number | null;
  billing: Billing | null;
  tiersAvailable: Tier[];
  googleRating: number | null;
  googleReviews: number | null;
  caseStudies: number | null;
  /** Stored logo (Supabase Storage), or null: show initials. */
  logoUrl: string | null;
}

export interface ListingParams {
  service?: string;
  locality?: string;
  budgetMax?: number;
  pricesOnly?: boolean;
  verifiedOnly?: boolean;
  sort?: ListingSort;
  page?: number;
  size?: number;
}

export interface PackageView {
  id: number;
  tier: Tier;
  name: string;
  priceMin: number | null;
  priceMax: number | null;
  billing: Billing;
  inclusions: string[];
  sourceUrl: string | null;
}

export interface AgencyProfile extends ScoreDetailFields {
  id: number;
  slug: string;
  name: string;
  city: LocalityItem;
  locality: LocalityItem | null;
  website: string | null;
  phone: string | null;
  teamSize: string | null;
  description: string | null;
  targetClients: string | null;
  pricingType: PricingType;
  pricingPageUrl: string | null;
  verified: boolean;
  lastCheckedOn: string | null;
  services: ServiceItem[];
  /** Keyed by service code. */
  packages: Record<string, PackageView[]>;
  quality: PublicQuality;
  logoUrl: string | null;
}

export interface CompareAgency extends ScoreDetailFields {
  id: number;
  name: string;
  slug: string;
  pricingType: PricingType;
  verified: boolean;
  quality: PublicQuality;
  logoUrl: string | null;
}

export interface TierCell {
  name: string;
  priceMin: number | null;
  priceMax: number | null;
  billing: Billing;
  inclusions: string[];
}

/** tier -> agencyId (string) -> cell */
export type TierGrid = Record<Tier, Record<string, TierCell | null>>;

/**
 * The CITY's typical starting price for one service and tier (not an agency's
 * price), from every published priced package in the city. Rupees.
 */
export interface PriceRange {
  p25: number;
  median: number;
  p75: number;
  billing: Billing;
  sampleSize: number;
}

/** tier -> range, or null when fewer than 5 priced packages exist for that tier. */
export type CityRange = Record<Tier, PriceRange | null>;

export interface CompareResponse {
  service?: string;
  agencies: CompareAgency[];
  tiers?: TierGrid;
  /** Only when a service was requested. */
  cityRange?: CityRange;
  /** service code -> tier grid (only when no service was requested) */
  services?: Record<string, TierGrid>;
  /** service code -> city range (only when no service was requested) */
  cityRanges?: Record<string, CityRange>;
}

export interface SitemapEntry {
  citySlug: string;
  serviceSlug: string | null;
  localitySlug: string | null;
  agencySlug: string | null;
  updatedAt: string | null;
}

export interface SitemapEntries {
  cities: SitemapEntry[];
  cityServices: SitemapEntry[];
  cityLocalities: SitemapEntry[];
  agencies: SitemapEntry[];
}

export interface LeadRequest {
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  businessType?: string;
  citySlug: string;
  localitySlug?: string;
  serviceSlug: string;
  budgetMonthly?: number;
  message?: string;
  agencyId?: number;
  agencyIds?: number[];
  packageId?: number;
  captchaToken: string;
}

export interface LeadCreated {
  leadId: number;
  sentTo: Array<{ id: number; name: string }>;
}

/** "Contact us" form. Saved for the admin inbox only; nothing is emailed. */
export interface ContactRequest {
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  monthlyBudget?: number;
  /** One comma separated string, e.g. "SEO, Social Media". Up to 10 items of 60 characters. */
  servicesNeeded?: string;
  aboutYou?: string;
  captchaToken: string;
}

export interface ContactCreated {
  id: number;
  message: string;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AgencyRequest {
  cityId: number;
  localityId: number | null;
  name: string;
  slug: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  teamSize: string | null;
  description: string | null;
  targetClients: string | null;
  pricingType: PricingType;
  rawPrices: string | null;
  pricingPageUrl: string | null;
  verified: boolean | null;
  lastCheckedOn: string | null;
  status: AgencyStatus | null;
  serviceCodes: string[] | null;
}

export interface AgencyResponse extends ScoreDetailFields {
  id: number;
  cityId: number;
  citySlug: string;
  localityId: number | null;
  localitySlug: string | null;
  name: string;
  slug: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  teamSize: string | null;
  description: string | null;
  targetClients: string | null;
  pricingType: PricingType;
  rawPrices: string | null;
  pricingPageUrl: string | null;
  verified: boolean;
  lastCheckedOn: string | null;
  status: AgencyStatus;
  serviceCodes: string[];
  packageCount: number;
  fitForUs: string | null;
  researchNotes: string | null;
  researchSource: string | null;
  rawLocation: string | null;
  rawTeamSize: string | null;
  /** Admin only. Always present; every field is null until a quality sheet has been imported. */
  quality: AgencyQuality;
  createdAt: string;
  updatedAt: string;
  /** How many of the 5 key facts are known; 3 or more makes the score public. Null until scored. */
  knownInputs: number | null;
  formulaVersion: string | null;
  computedAt: string | null;
  logoUrl: string | null;
  /** AUTO = fetched from the website; MANUAL = uploaded (never replaced automatically); null = no logo. */
  logoSource: LogoSource | null;
  /** Last automatic fetch attempt, found or not; null = never tried. */
  logoCheckedAt: string | null;
}

export type LogoSource = "AUTO" | "MANUAL";

export interface CityLogoFetchResult {
  city: string;
  queued: number;
  skipped: number;
}

export interface ScoreRecomputeResult {
  city: string;
  agenciesScored: number;
}

/** Read-only: set only by the quality CSV import (POST /admin/import/agency-quality). */
export interface AgencyQuality {
  siteLive: boolean | null;
  googleRating: number | null;
  googleReviews: number | null;
  clutchRating: number | null;
  clutchReviews: number | null;
  goodFirmsRating: number | null;
  goodFirmsReviews: number | null;
  caseStudies: number | null;
  caseStudyUrl: string | null;
  resultsShown: boolean | null;
  foundedYear: number | null;
  address: string | null;
  excludeReason: string | null;
  qualityNotes: string | null;
}

export interface AdminAgencyFilters {
  city?: string;
  status?: AgencyStatus;
  pricingType?: PricingType;
  hasPackages?: boolean;
  fit?: string;
  q?: string;
  page?: number;
  size?: number;
}

export interface AgencyPatchRequest {
  status?: AgencyStatus;
  verified?: boolean;
  lastCheckedOn?: string;
}

export interface AgencyBulkStatusResult {
  status: AgencyStatus;
  /** Ids whose status changed, in the order sent. */
  updated: number[];
  /** Ids that already had that status. */
  unchanged: number[];
  /** Publishing only: agencies the quality sheet flagged. They are published anyway. */
  warnings: Array<{ agencyId: number; agencyName: string; message: string }>;
}

export interface PackageRequest {
  serviceCode: string;
  tier: Tier;
  name: string;
  priceMin: number | null;
  priceMax: number | null;
  billing: Billing;
  inclusions: string[];
  sourceUrl: string | null;
}

export interface PackageResponse extends PackageRequest {
  id: number;
  agencyId: number;
}

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface SuggestedPackage extends PackageRequest {
  confidence: Confidence;
  notes: string[] | null;
  evidence: string | null;
  alreadyExists: boolean;
}

export interface PackageSuggestions {
  agencyId: number;
  agencyName: string;
  pricingType: PricingType;
  rawPrices: string | null;
  existingPackages: PackageResponse[];
  suggestions: SuggestedPackage[];
  ignored: Array<{ text: string; reason: string }>;
}

export interface ImportReport {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
  warnings: Array<{ row: number; message: string }>;
}

export interface CityResponse {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

export interface CityRequest {
  name: string;
  slug: string | null;
  active: boolean;
}

export interface LocalityResponse {
  id: number;
  cityId: number;
  name: string;
  slug: string;
}

export interface LocalityRequest {
  cityId: number;
  name: string;
  slug: string | null;
}

export interface ServiceResponse {
  id: number;
  code: string;
  name: string;
  slug: string;
  keywords: string[];
}

export interface ServiceRequest {
  code: string;
  name: string;
  slug: string | null;
  keywords: string[];
}

export interface RoutedAgency {
  agencyId: number;
  agencyName: string;
  agencyEmail: string | null;
  /** Time of the last successful send; a failed resend doesn't clear it. */
  sentAt: string | null;
  emailStatus: EmailStatus | null;
  /** Subject and text of the last attempt. Null for NO_EMAIL and for leads before 2026-10-17. */
  emailSubject: string | null;
  emailBody: string | null;
  /** Why the last attempt failed; null after a success. */
  emailError: string | null;
  /** First send plus every resend; 0 for NO_EMAIL. */
  emailAttempts: number;
}

export interface LeadResponse {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  businessName: string | null;
  businessType: string | null;
  citySlug: string;
  localitySlug: string | null;
  serviceSlug: string;
  budgetMonthly: number | null;
  message: string | null;
  chosenAgencyId: number | null;
  packageId: number | null;
  status: LeadStatus;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  routedAgencies: RoutedAgency[];
}

export type ContactStatus = "NEW" | "CONTACTED" | "CLOSED" | "SPAM";

export interface ContactRequestResponse {
  id: number;
  name: string;
  businessName: string | null;
  /** Lower case. */
  email: string;
  /** 10 digits, no +91. */
  phone: string;
  monthlyBudget: number | null;
  servicesNeeded: string[];
  aboutYou: string | null;
  status: ContactStatus;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminContactFilters {
  status?: ContactStatus;
  page?: number;
  size?: number;
}

export interface AdminLeadFilters {
  status?: LeadStatus;
  city?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface RateLimitReset {
  ip: string;
  wasTracked: boolean;
}
