/*
 * OneRoof Ventures' own managed marketing packages (the /services page).
 * Single source of truth for the rate card: prices, what each package covers,
 * add-ons, capabilities and terms. Valid from August 2026.
 */

export type PackageKey = "basic" | "growth" | "premium";

export interface MarketingPackage {
  key: PackageKey;
  name: string;
  /** Rupees per month, excluding ad spend. */
  monthly: number;
  setupFee?: { amount: number; covers: string };
  bestFor: string;
  tagline: string;
  /** "Everything in Basic, plus:" for the higher tiers. */
  builds?: string;
  popular?: boolean;
  inclusions: string[];
  /** Shown in italics under the list. */
  note?: string;
}

export const RATE_CARD_VALID_FROM = "August 2026";
export const MIN_COMMITMENT = "3 months";

export const PACKAGES: MarketingPackage[] = [
  {
    key: "basic",
    name: "Basic",
    monthly: 12999,
    setupFee: { amount: 5000, covers: "landing page build" },
    bestFor: "First-time advertisers who need leads and a page to send them to",
    tagline: "Built for businesses ready to start generating leads online.",
    inclusions: [
      "Landing page — one page, mobile-first, with a lead form and WhatsApp click-to-chat (covered by the setup fee)",
      "Meta Ads: 2–3 campaigns, Pixel and Conversion API setup, 2 audience sets",
      "6 static creatives per month, plus ad copy variations",
      "Leads delivered to a Google Sheet with instant WhatsApp and email alerts",
      "Monthly performance report",
      "Support over email, 48-hour response",
    ],
    note: "Suggested ad spend ₹15,000–₹25,000 per month, paid by you directly to the platform.",
  },
  {
    key: "growth",
    name: "Growth",
    monthly: 29999,
    bestFor: "Businesses ready to scale across Meta and Google with content support",
    tagline: "Two paid channels, a working funnel and a consistent presence — built around leads, not post counts.",
    builds: "Everything in Basic, plus:",
    popular: true,
    inclusions: [
      "Website up to 5 pages, or a landing page revamp with 1 A/B variant",
      "Meta Ads and Google Search Ads, up to 4 campaigns (Performance Max available as an add-on)",
      "Retargeting funnel — site visitors, video viewers and page engagers",
      "10 creatives per month, including 2 reels",
      "Social media management: 6–7 posts per month across Instagram and Facebook",
      "Google Business Profile optimisation, plus basic on-page SEO for up to 10 priority keywords",
      "Automated WhatsApp first-response to every incoming lead",
      "Bi-weekly reporting and a monthly strategy call",
      "Support response within 24 hours",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    monthly: 44999,
    bestFor: "Brands that want a full outsourced marketing team",
    tagline: "We become your marketing department.",
    builds: "Everything in Growth, plus:",
    inclusions: [
      "Dedicated account manager and a full-funnel strategy, refreshed quarterly",
      "A third channel: LinkedIn or YouTube",
      "20 creatives per month, including 6–8 scripted reels",
      "15 posts per month across 3–4 platforms, plus comment and DM management",
      "SEO: technical audit, 25 keywords, 2 blogs per month",
      "Email and WhatsApp marketing automation — 2 campaigns per month",
      "Conversion optimisation: heatmaps, session recordings and one A/B test monthly",
      "Live Looker Studio dashboard with a weekly reporting call",
      "Same-day priority support",
    ],
  },
];

/**
 * What each package covers, side by side. `true` = included, `false` = not
 * included, a string = included with that scope.
 */
export type Coverage = boolean | string;

export interface CoverageRow {
  label: string;
  group: string;
  values: Record<PackageKey, Coverage>;
}

export const COVERAGE: CoverageRow[] = [
  // Website & leads
  {
    group: "Website & leads",
    label: "Landing page",
    values: { basic: "1 page, mobile-first (setup fee)", growth: true, premium: true },
  },
  {
    group: "Website & leads",
    label: "Website",
    values: { basic: false, growth: "Up to 5 pages, or landing page revamp + 1 A/B variant", premium: "Up to 5 pages, or landing page revamp + 1 A/B variant" },
  },
  {
    group: "Website & leads",
    label: "Leads to Google Sheet with WhatsApp & email alerts",
    values: { basic: true, growth: true, premium: true },
  },
  {
    group: "Website & leads",
    label: "Automated WhatsApp first-response to every lead",
    values: { basic: false, growth: true, premium: true },
  },
  // Paid ads
  {
    group: "Paid advertising",
    label: "Meta Ads (Facebook & Instagram)",
    values: { basic: "2–3 campaigns, Pixel + Conversion API, 2 audience sets", growth: true, premium: true },
  },
  {
    group: "Paid advertising",
    label: "Google Search Ads",
    values: { basic: "Add-on, ₹8,000/month", growth: "With Meta, up to 4 campaigns", premium: "With Meta, up to 4 campaigns" },
  },
  {
    group: "Paid advertising",
    label: "Retargeting funnel",
    values: { basic: false, growth: true, premium: true },
  },
  {
    group: "Paid advertising",
    label: "Third channel: LinkedIn or YouTube",
    values: { basic: false, growth: false, premium: true },
  },
  // Content
  {
    group: "Content & social",
    label: "Creatives per month",
    values: { basic: "6 static + ad copy variations", growth: "10, incl. 2 reels", premium: "20, incl. 6–8 scripted reels" },
  },
  {
    group: "Content & social",
    label: "Social media posts",
    values: { basic: false, growth: "6–7 / month on Instagram & Facebook", premium: "15 / month across 3–4 platforms" },
  },
  {
    group: "Content & social",
    label: "Comment & DM management",
    values: { basic: false, growth: false, premium: true },
  },
  // Search
  {
    group: "Search & local",
    label: "Google Business Profile optimisation",
    values: { basic: false, growth: true, premium: true },
  },
  {
    group: "Search & local",
    label: "SEO",
    values: { basic: false, growth: "Basic on-page, up to 10 keywords", premium: "Technical audit, 25 keywords, 2 blogs / month" },
  },
  // Growth
  {
    group: "Automation & optimisation",
    label: "Email & WhatsApp marketing automation",
    values: { basic: false, growth: false, premium: "2 campaigns / month" },
  },
  {
    group: "Automation & optimisation",
    label: "Conversion optimisation (heatmaps, session recordings)",
    values: { basic: false, growth: false, premium: "Plus 1 A/B test monthly" },
  },
  // Service
  {
    group: "Reporting & support",
    label: "Reporting",
    values: { basic: "Monthly report", growth: "Bi-weekly + monthly strategy call", premium: "Live Looker Studio dashboard + weekly call" },
  },
  {
    group: "Reporting & support",
    label: "Dedicated account manager & quarterly strategy",
    values: { basic: false, growth: false, premium: true },
  },
  {
    group: "Reporting & support",
    label: "Support",
    values: { basic: "Email, 48-hour response", growth: "Within 24 hours", premium: "Same-day priority" },
  },
  {
    group: "Reporting & support",
    label: "Minimum commitment",
    values: { basic: MIN_COMMITMENT, growth: MIN_COMMITMENT, premium: MIN_COMMITMENT },
  },
];

export const ADD_ONS: Array<{ service: string; price: string }> = [
  { service: "Extra landing page", price: "₹5,000" },
  { service: "Full website (5–7 pages)", price: "₹25,000 – ₹40,000" },
  { service: "E-commerce store (Shopify / WooCommerce)", price: "₹50,000 onwards" },
  { service: "Logo and brand kit", price: "₹9,000" },
  { service: "Reel editing", price: "₹1,500 each, or ₹7,500 for 6" },
  { service: "Product or brand shoot (local)", price: "₹10,000 per day" },
  { service: "Google Ads added to Basic", price: "₹8,000 / month" },
  { service: "Performance Max campaign (Growth package)", price: "₹6,000 / month" },
  { service: "LinkedIn Ads management", price: "₹10,000 / month" },
  { service: "Standalone SEO retainer", price: "₹15,000 / month" },
  { service: "WhatsApp Business API setup", price: "₹6,000 + usage" },
  { service: "Email platform setup (Brevo / Klaviyo)", price: "₹7,000 one-time" },
  { service: "Extra static creative", price: "₹750 – ₹1,000, by complexity" },
  { service: "Landing page A/B test", price: "₹4,000" },
  { service: "Ad spend management above ₹1,00,000 / month", price: "10% of spend" },
];

/** Everything the team can take on. Scope depends on the package; the rest is an add-on or a custom quote. */
export const CAPABILITIES: Array<{ name: string; description: string }> = [
  { name: "SEO", description: "Technical, on-page and off-page search optimisation" },
  { name: "AEO", description: "Optimising content and website structure for AI-powered search and answer engines" },
  { name: "Google Search Visibility", description: "Indexing, technical improvements and search visibility optimisation" },
  { name: "Google Business Profile", description: "Setup, optimisation, posts, reviews and local map visibility" },
  { name: "Google Ads", description: "Search, Performance Max, Display and remarketing" },
  { name: "Meta Ads", description: "Facebook and Instagram campaigns across the full funnel" },
  { name: "Social Media Management", description: "Posting, community management, comments and DMs" },
  { name: "Video Shoots, Edits & Reels", description: "Coordinated and managed by our team, through to the final edit" },
  { name: "Website", description: "Landing pages, full websites, revamps and ongoing maintenance" },
  { name: "Content Strategy", description: "What to say, to whom, on which platform, and why" },
  { name: "Content Calendar", description: "A month of planned content, approved before it goes live" },
  { name: "Business Strategy & Plans", description: "Positioning, offers, pricing and go-to-market direction" },
  { name: "Lead Management", description: "Capture, alerts, tracking and automated first-response" },
  { name: "Analytics & Reporting", description: "Tracking setup, dashboards and monthly performance reviews" },
  { name: "Email & WhatsApp Marketing", description: "Campaigns, automation and retention flows" },
  { name: "Branding & Creative Design", description: "Logos, brand kits, static creatives and ad design" },
];

export const TERMS: string[] = [
  "Ad spend is paid by you directly to Meta, Google or other platforms. It is not part of our fee.",
  "Monthly fees are paid in advance, on the 1st of every month.",
  "One-time projects: 50% upfront, 50% on delivery.",
  "Minimum 3 months on every package. After that, cancel anytime with 30 days' notice.",
  "Monthly counts (creatives, posts, keywords) don't carry over to the next month.",
  "Extra costs like creator fees, stock images, paid tools, hosting and domains are charged at actual cost.",
  "Photo and video shoots in your plan are fully handled by our team, from shoot to final edits and reels.",
  "One design resized for different platforms counts as one creative. A new idea or brief counts as a new one.",
  "Each reel, creative and post gets up to 3 rounds of changes. More changes, or a new brief after work starts, are charged as a new creative.",
  "Quotes are valid for 30 days.",
];

export const PACKAGE_CONTACT = {
  phones: [
    { display: "+91 84000 46056", e164: "+918400046056" },
    { display: "+91 96827 60167", e164: "+919682760167" },
  ],
  email: "oneroofventures26@gmail.com",
  location: "Lucknow",
};
