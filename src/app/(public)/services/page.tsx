import type { Metadata } from "next";
import { Section } from "@/components/Container";
import { getServices } from "@/lib/api/public";
import { card, eyebrow, sectionTitle } from "@/lib/styles";
import { cn, formatPrice } from "@/lib/utils";
import PricingPackageCard from "@/components/PricingPackageCard";
import ServiceInquiryForm from "@/components/ServiceInquiryForm";

export const metadata: Metadata = {
  title: "Our Marketing Package | OneRoof Ventures",
  description:
    "OneRoof Ventures' own managed marketing package — what's included and why it's economical compared to hiring separately.",
};

export const revalidate = 300;

const PACKAGES: Array<{ name: string; priceMin: number; priceMax: number; inclusions: string[] }> = [
  {
    name: "Starter",
    priceMin: 25000,
    priceMax: 45000,
    inclusions: [
      "1–2 channels (e.g. SEO + Social Media)",
      "Single point of contact",
      "Monthly performance report",
      "Month-to-month, cancel anytime",
    ],
  },
  {
    name: "Growth",
    priceMin: 60000,
    priceMax: 120000,
    inclusions: [
      "Multi-channel (SEO, Paid Ads, Social, Content)",
      "Dedicated strategist",
      "Bi-weekly reporting & check-ins",
      "Landing page & creative support",
    ],
  },
  {
    name: "Pro",
    priceMin: 130000,
    priceMax: 250000,
    inclusions: [
      "All services, fully managed",
      "Dedicated team, not a single freelancer",
      "Weekly reporting & priority support",
      "Quarterly strategy reviews",
    ],
  },
];

const COMPARISON = [
  {
    title: "Going it alone",
    points: [
      "Hiring 2–3 separate freelancers or vendors",
      "₹1.5L–4L/mo combined, before management time",
      "You coordinate every handoff yourself",
      "Quality varies vendor to vendor",
    ],
  },
  {
    title: "OneRoof Ventures package",
    points: [
      "One bundled, transparent price",
      "Single point of contact for everything",
      "No hiring, onboarding or management overhead",
      "Month-to-month — no long-term lock-in",
    ],
    highlighted: true,
  },
];

export default async function ServicesPage() {
  const services = (await getServices().catch(() => [])).map((s) => s.name);

  return (
    <div>
      <Section className="border-b border-border bg-surface">
        <p className={eyebrow}>Managed by OneRoof Ventures</p>
        <h1 className="mt-3 max-w-[22ch] font-display text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-[2.5rem]">
          Everything your marketing needs, under one roof.
        </h1>
        <p className="mt-4 max-w-[64ch] text-base text-text-muted">
          Instead of comparing agencies, you can hand your marketing
          directly to our team — one package, one point of contact, priced
          to be lighter than hiring separately.
        </p>
        {services.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-text">What&apos;s included</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((s) => (
                <span key={s} className="inline-flex items-center rounded-full border border-border bg-bg px-3 py-1 text-sm font-medium text-text">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section>
        <h2 className={sectionTitle}>Pricing packages</h2>
        <p className="mt-3 max-w-[60ch] text-base text-text-muted">
          Placeholder pricing — adjust to match your actual rate card.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((pkg, idx) => (
            <PricingPackageCard
              key={pkg.name}
              title={pkg.name}
              price={`${formatPrice(pkg.priceMin)} – ${formatPrice(pkg.priceMax)}/mo`}
              inclusions={pkg.inclusions}
              highlighted={idx === 1}
              badge={idx === 1 ? "Most popular" : undefined}
            />
          ))}
        </div>
      </Section>

      <Section className="border-y border-border bg-surface">
        <h2 className={sectionTitle}>Why it&apos;s economical</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {COMPARISON.map((col) => (
            <div
              key={col.title}
              className={cn(card, "p-6", col.highlighted ? "border-primary/50 ring-1 ring-inset ring-primary/25" : "bg-bg")}
            >
              <h3 className="text-card font-semibold text-text">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-base text-text-muted">
                    <svg
                      viewBox="0 0 20 20"
                      className={cn("mt-1 h-4 w-4 flex-shrink-0", col.highlighted ? "text-success-text" : "text-text-muted")}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      {col.highlighted ? (
                        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="round" />
                      )}
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section containerClassName="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 className={sectionTitle}>Talk to our team</h2>
          <p className="mt-3 text-base text-text-muted">
            Tell us about your business and budget — we&apos;ll suggest the
            right package.
          </p>
        </div>
        <div className="lg:col-span-8">
          <ServiceInquiryForm services={services} />
        </div>
      </Section>
    </div>
  );
}
