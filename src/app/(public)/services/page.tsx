import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/Container";
import ServiceInquiryForm from "@/components/ServiceInquiryForm";
import PackageCoverage from "@/components/PackageCoverage";
import {
  ADD_ONS,
  CAPABILITIES,
  MIN_COMMITMENT,
  PACKAGE_CONTACT,
  PACKAGES,
  RATE_CARD_VALID_FROM,
  TERMS,
  type MarketingPackage,
} from "@/lib/packages";
import { card, ctaButton, eyebrow, primaryButton, secondaryButton, sectionTitle } from "@/lib/styles";
import { cn, formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marketing Packages & Pricing | OneRoof Ventures",
  description:
    "OneRoof Ventures' managed digital marketing packages: Basic ₹12,999, Growth ₹29,999 and Premium ₹44,999 per month — Meta & Google Ads, creatives, social media, SEO, websites and reporting.",
};

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("h-4 w-4 flex-shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageCard({ pkg }: { pkg: MarketingPackage }) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl p-5 sm:p-6",
        pkg.popular ? "theme-navy bg-glow" : cn(card),
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-text">{pkg.name}</h3>
        {pkg.popular && (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-semibold text-accent-fg">Most popular</span>
        )}
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="num text-4xl font-bold text-text">{formatINR(pkg.monthly)}</span>
        <span className="text-sm text-text-muted">/ month</span>
      </p>
      {pkg.setupFee && (
        <p className="mt-1 text-[13px] text-text-muted">+ {formatINR(pkg.setupFee.amount)} one-time setup fee</p>
      )}
      <p className="mt-3 text-sm text-text">
        <span className="font-semibold">Best for:</span> {pkg.bestFor}
      </p>
      <p className="mt-2 text-sm italic text-text-muted">{pkg.tagline}</p>

      <div className="mt-5 border-t border-border pt-4">
        {pkg.builds && <p className="mb-3 text-sm font-semibold text-text">{pkg.builds}</p>}
        <ul className="space-y-2.5">
          {pkg.inclusions.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-6 text-text-muted">
              <Check className="mt-1 text-success-text" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {pkg.note && <p className="mt-4 text-[13px] italic text-text-muted">{pkg.note}</p>}
      </div>

      <div className="mt-auto pt-6">
        <p className="mb-3 text-[13px] text-text-muted">Minimum commitment: {MIN_COMMITMENT}.</p>
        <Link href={`/services?package=${pkg.key}#talk`} className={cn(pkg.popular ? ctaButton : primaryButton, "w-full")}>
          Choose {pkg.name}
        </Link>
      </div>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <div>
      {/* Hero: what this is, and every price at a glance. */}
      <section className="theme-navy bg-glow section-y">
        <Container>
          <p className={eyebrow}>Managed by OneRoof Ventures</p>
          <h1 className="mt-3 max-w-[20ch] font-display text-[1.875rem] font-bold leading-tight text-text sm:text-[2.75rem]">
            Everything your marketing needs, <span className="text-emphasis">under one roof.</span>
          </h1>
          <p className="mt-4 max-w-[62ch] text-base text-text-muted sm:text-lg">
            Three retainers built for growing businesses — pick the one that matches where you are today, and
            move up when the numbers say so. Every package is run by the same dedicated team, with reporting and
            support scaled to the package.
          </p>

          <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {PACKAGES.map((p) => (
              <div key={p.key} className="rounded-2xl border border-border bg-surface/60 p-3 sm:p-4">
                <dt className="text-[13px] font-medium text-text-muted">{p.name}</dt>
                <dd className="num mt-1 text-lg font-bold text-text sm:text-2xl">{formatINR(p.monthly)}</dd>
                <dd className="text-[12px] text-text-muted">per month</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] text-text-muted">
            Ad spend is billed by the platform directly to you and is not included in the retainer. Prices valid
            from {RATE_CARD_VALID_FROM}.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#packages" className={ctaButton}>
              See what&apos;s included
            </a>
            <a href="#talk" className={secondaryButton}>
              Talk to our team
            </a>
          </div>
        </Container>
      </section>

      {/* Packages */}
      <Section id="packages" className="scroll-mt-20">
        <h2 className={sectionTitle}>Packages</h2>
        <p className="mt-3 max-w-[60ch] text-base text-text-muted">
          Monthly retainers with a 3-month minimum commitment. Each one includes everything in the package before it.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.key} pkg={pkg} />
          ))}
        </div>
      </Section>

      {/* Side-by-side coverage */}
      <Section id="compare" flush className="scroll-mt-20">
        <h2 className={sectionTitle}>What&apos;s covered in each package</h2>
        <p className="mt-3 max-w-[60ch] text-base text-text-muted">
          Every service, side by side. Anything not included can be added from the add-ons below.
        </p>
        <div className="mt-6">
          <PackageCoverage />
        </div>
      </Section>

      {/* Add-ons */}
      <Section className="border-y border-border bg-band">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 className={sectionTitle}>Add-on services</h2>
            <p className="mt-3 text-base text-text-muted">Available with any package, or on their own.</p>
          </div>
          <dl className="divide-y divide-border rounded-2xl border border-border bg-surface lg:col-span-8">
            {ADD_ONS.map((a) => (
              <div key={a.service} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-5">
                <dt className="text-sm text-text">{a.service}</dt>
                <dd className="num whitespace-nowrap text-sm font-semibold text-text">{a.price}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Capabilities */}
      <Section>
        <h2 className={sectionTitle}>What we can manage</h2>
        <p className="mt-3 max-w-[66ch] text-base text-text-muted">
          Everything our team can take care of as your growth partner. This is what we handle, not what every
          package includes — the exact scope depends on your package, and anything outside it can be added or
          quoted separately.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <li key={c.name} className="border-t border-border pt-4">
              <p className="font-display text-base font-bold text-text">{c.name}</p>
              <p className="mt-1 text-sm text-text-muted">{c.description}</p>
            </li>
          ))}
        </ul>

        <details className="group mt-12 rounded-2xl border border-border bg-surface">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 text-base font-semibold text-text [&::-webkit-details-marker]:hidden">
            Billing &amp; terms
            <span aria-hidden="true" className="text-text-muted transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <ul className="space-y-2.5 border-t border-border px-5 py-4">
            {TERMS.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm leading-6 text-text-muted">
                <span aria-hidden="true" className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-text-muted" />
                {t}
              </li>
            ))}
          </ul>
        </details>
      </Section>

      {/* Contact */}
      <Section id="talk" flush className="scroll-mt-20" containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 className={sectionTitle}>Talk to our team</h2>
          <p className="mt-3 text-base text-text-muted">
            Questions, or want something built to fit? Get in touch and we&apos;ll put a custom scope together.
          </p>
          <ul className="mt-6 space-y-1 text-sm">
            <li>
              <a href={`tel:${PACKAGE_CONTACT.phoneE164}`} className="inline-flex min-h-11 items-center gap-2 font-medium text-text hover:text-primary-text">
                <span className="w-20 text-text-muted">Phone</span>
                {PACKAGE_CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${PACKAGE_CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 font-medium text-text hover:text-primary-text"
              >
                <span className="w-20 text-text-muted">WhatsApp</span>
                Chat with us ↗
              </a>
            </li>
            <li>
              <a href={`mailto:${PACKAGE_CONTACT.email}`} className="inline-flex min-h-11 items-center gap-2 break-all font-medium text-text hover:text-primary-text">
                <span className="w-20 flex-shrink-0 text-text-muted">Email</span>
                {PACKAGE_CONTACT.email}
              </a>
            </li>
            <li className="inline-flex min-h-11 items-center gap-2 font-medium text-text">
              <span className="w-20 text-text-muted">Based in</span>
              {PACKAGE_CONTACT.location}
            </li>
          </ul>
        </div>
        <div className={cn(card, "p-5 sm:p-6 lg:col-span-8")}>
          <Suspense fallback={<div className="h-80" />}>
            <ServiceInquiryForm />
          </Suspense>
        </div>
      </Section>
    </div>
  );
}
