import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Container";
import { ctaButton, eyebrow, sectionTitle } from "@/lib/styles";
import { cn } from "@/lib/utils";
import FounderCard, { type Founder } from "@/components/FounderCard";

export const metadata: Metadata = {
  title: "About Us | OneRoof Ventures",
  alternates: { canonical: "/about" },
  description:
    "Why we built OneRoof Ventures: compare marketing agencies in your city side by side and choose on facts, not sales pitches.",
};

/** Founders section is hidden until real profiles are ready; set to true to show it. */
const SHOW_FOUNDERS = false;

const FOUNDERS: Founder[] = [
  {
    name: "Founder Name",
    role: "Co-Founder & CEO",
    bio: "[Add a short bio here — background, what they worked on before OneRoof Ventures, and why they care about this problem.]",
  },
  {
    name: "Co-Founder Name",
    role: "Co-Founder & Head of Partnerships",
    bio: "[Add a short bio here — background, what they worked on before OneRoof Ventures, and why they care about this problem.]",
  },
];

const VALUES = [
  {
    title: "Transparency first",
    description:
      "Every score, price range and review is shown as-is — no pay-to-rank rankings.",
  },
  {
    title: "Data over sales pitches",
    description:
      "We'd rather show you real numbers than let an agency's sales team do the talking.",
  },
  {
    title: "Free for businesses, always",
    description:
      "Comparing and shortlisting agencies on OneRoof Ventures costs nothing, permanently.",
  },
  {
    title: "Paid visibility is labelled",
    description:
      "Agencies can pay to be seen more. When they do, the listing says so, and it never changes their score.",
  },
];

const STEPS = [
  {
    title: "Compare side by side",
    description:
      "See what each agency does, who they work with, what their packages cost and how past clients rate them.",
  },
  {
    title: "Get a shortlist that fits",
    description:
      "Tell us your city, service and budget, and we show you the agencies that match.",
  },
  {
    title: "One request, several quotes",
    description:
      "Send one quote request to all of them at once. No sign-up, and free for businesses.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <Section className="border-b border-border bg-surface">
        <p className={eyebrow}>Our story</p>
        <h1 className="mt-3 max-w-[24ch] font-display text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-[2.5rem]">
          Choosing a marketing agency shouldn&apos;t be guesswork
        </h1>
        <p className="mt-4 max-w-[60ch] text-base text-text-muted sm:text-lg">
          OneRoof Ventures puts the marketing agencies in your city side by
          side, so you can choose on facts instead of sales pitches.
        </p>
      </Section>

      <Section containerClassName="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 className={sectionTitle}>Why we built it</h2>
        </div>
        <div className="max-w-[64ch] space-y-4 text-base leading-7 text-text-muted lg:col-span-8">
          <p>
            Every business owner we spoke to described the same week. You need
            someone to run your ads or fix your SEO. You search, get forty
            names, and every website says roughly the same thing. Calls turn
            into sales pitches, and you still can&apos;t answer the one question
            that matters:{" "}
            <span className="font-medium text-text">
              who is right for my business, and what will it actually cost?
            </span>
          </p>
          <p>
            Good businesses were making that choice on a hunch, and good
            agencies were losing work because nobody could find them. So we put
            the whole search under one roof.
          </p>
        </div>
      </Section>

      <Section flush>
        <h2 className={sectionTitle}>How it works for you</h2>
        <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-border pt-4">
              <span className="num text-sm font-bold text-accent-text">
                0{i + 1}
              </span>
              <h3 className="mt-1 text-card font-semibold text-text">
                {step.title}
              </h3>
              <p className="mt-2 text-base text-text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-text-muted">
          Live in Bangalore, Delhi and Hyderabad, with more cities on the way.
          Every listing shows the date we last checked it.
        </p>
      </Section>

      {SHOW_FOUNDERS && (
        <Section containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 className={sectionTitle}>Founders</h2>
            <p className="mt-3 text-base text-text-muted">
              Placeholder profiles — swap in real names, photos and bios
              whenever you&apos;re ready.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-8">
            {FOUNDERS.map((founder) => (
              <FounderCard key={founder.name} founder={founder} />
            ))}
          </div>
        </Section>
      )}

      <Section className="border-y border-border bg-surface">
        <h2 className={sectionTitle}>What we stand for</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {VALUES.map((value) => (
            <div key={value.title} className="border-t-2 border-primary pt-4">
              <h3 className="text-card font-semibold text-text">
                {value.title}
              </h3>
              <p className="mt-2 text-base text-text-muted">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="theme-navy bg-glow rounded-3xl px-6 py-10 text-center sm:px-12">
          <h2 className={cn(sectionTitle, "mx-auto max-w-[26ch]")}>
            Want OneRoof Ventures to run your marketing instead?
          </h2>
          <p className="mx-auto mt-3 max-w-[56ch] text-base text-text-muted">
            Managed packages from ₹12,999 a month — ads, creatives, social and
            SEO. They&apos;re kept separate from the agency comparison.
          </p>
          <Link href="/services" className={cn(ctaButton, "mt-6")}>
            See packages &amp; pricing
          </Link>
        </div>
      </Section>
    </div>
  );
}
