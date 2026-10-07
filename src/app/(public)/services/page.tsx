import type { Metadata } from "next";
import { getServices } from "@/lib/api/public";
import { formatPrice } from "@/lib/utils";
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
      <section className="border-b border-mist bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-harbor">Managed by OneRoof Ventures</p>
          <h1 className="mt-3 text-[28px] leading-tight font-bold text-ink sm:text-[40px]">
            Everything your marketing needs, under one roof.
          </h1>
          <p className="mt-4 text-base text-ink-soft">
            Instead of comparing agencies, you can hand your marketing
            directly to our team — one package, one point of contact, priced
            to be lighter than hiring separately.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-ink">What&apos;s included</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {services.map((s) => (
            <span
              key={s}
              className="rounded-sm bg-mist/60 px-3 py-1.5 text-sm font-medium text-ink"
            >
              {s}
            </span>
          ))}
        </div>

        <h2 className="mt-16 text-center text-2xl font-bold text-ink">Pricing packages</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink-soft">
          Placeholder pricing — adjust to match your actual rate card.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
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
      </section>

      <section className="border-t border-mist bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-ink">Why it&apos;s economical</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {COMPARISON.map((col) => (
              <div
                key={col.title}
                className={`rounded-sm border border-t-2 p-6 ${
                  col.highlighted
                    ? "border-harbor bg-surface"
                    : "border-mist bg-paper"
                }`}
              >
                <h3 className="text-lg font-bold text-ink">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-ink-soft">
                      <svg
                        viewBox="0 0 20 20"
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                          col.highlighted ? "text-harbor" : "text-ink-soft"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {col.highlighted ? (
                          <path d="M4 10.5l4 4 8-9" strokeLinecap="square" />
                        ) : (
                          <path d="M6 6l8 8M14 6l-8 8" strokeLinecap="square" />
                        )}
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-ink">Talk to our team</h2>
        <p className="mt-1 mb-6 text-sm text-ink-soft">
          Tell us about your business and budget — we&apos;ll suggest the
          right package.
        </p>
        <ServiceInquiryForm services={services} />
      </section>
    </div>
  );
}
