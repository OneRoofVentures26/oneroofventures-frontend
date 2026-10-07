// DTOs for the oneroofventures backend (see frontend-api-guide.md / Swagger).

export type PricingType = "FIXED" | "RANGE" | "QUOTE_ONLY";
export type Tier = "STARTER" | "GROWTH" | "PRO";
export type Billing = "MONTHLY" | "ONE_TIME";
export type AgencyStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";
export type LeadStatus = "NEW" | "SENT" | "CONTACTED" | "CLOSED" | "SPAM";
export type EmailStatus = "SENT" | "FAILED" | "NO_EMAIL";
export type ListingSort = "recent" | "price_asc" | "price_desc" | "name";

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

export interface AgencyListItem {
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

export interface AgencyProfile {
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
}

export interface CompareAgency {
  id: number;
  name: string;
  slug: string;
  pricingType: PricingType;
  verified: boolean;
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

export interface CompareResponse {
  service?: string;
  agencies: CompareAgency[];
  tiers?: TierGrid;
  /** service code -> tier grid (only when no service was requested) */
  services?: Record<string, TierGrid>;
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

export interface AgencyResponse {
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
  createdAt: string;
  updatedAt: string;
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
  sentAt: string | null;
  emailStatus: EmailStatus | null;
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
