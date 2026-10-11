import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Container";
import { ctaButton, eyebrow, sectionTitle } from "@/lib/styles";
import { cn } from "@/lib/utils";
import FounderCard, { type Founder } from "@/components/FounderCard";

export const metadata: Metadata = {
  title: "About Us | OneRoof Ventures",
  description: "Meet the team behind OneRoof Ventures and the story behind the idea.",
};

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
    description: "Every score, price range and review is shown as-is — no pay-to-rank rankings.",
  },
  {
    title: "Data over sales pitches",
    description: "We'd rather show you real numbers than let an agency's sales team do the talking.",
  },
  {
    title: "Free for businesses, always",
    description: "Comparing and shortlisting agencies on OneRoof Ventures costs nothing, permanently.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <Section className="border-b border-border bg-surface">
        <p className={eyebrow}>Our story</p>
        <h1 className="mt-3 max-w-[22ch] font-display text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-[2.5rem]">
          The people behind OneRoof Ventures
        </h1>
        <p className="mt-4 max-w-[68ch] text-base text-text-muted">
          [Add the founding story here — e.g. OneRoof Ventures started with a
          simple belief: finding the right marketing partner shouldn&apos;t
          take weeks of cold outreach and guesswork. We&apos;re building the
          one place businesses can compare agencies by city, on real data —
          reviews, pricing and results — before they ever get on a sales
          call.]
        </p>
      </Section>

      <Section containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 className={sectionTitle}>Founders</h2>
          <p className="mt-3 text-base text-text-muted">
            Placeholder profiles — swap in real names, photos and bios whenever
            you&apos;re ready.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-8">
          {FOUNDERS.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>
      </Section>

      <Section className="border-y border-border bg-surface">
        <h2 className={sectionTitle}>What we stand for</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {VALUES.map((value) => (
            <div key={value.title} className="border-t-2 border-primary pt-4">
              <h3 className="text-card font-semibold text-text">{value.title}</h3>
              <p className="mt-2 text-base text-text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="rounded-3xl border border-border bg-surface px-6 py-10 text-center shadow-raised sm:px-12">
          <h2 className={cn(sectionTitle, "mx-auto max-w-[26ch]")}>
            Want OneRoof Ventures to run your marketing instead?
          </h2>
          <p className="mt-3 text-base text-text-muted">See our own managed marketing package and pricing.</p>
          <Link href="/services" className={cn(ctaButton, "mt-6")}>
            View our marketing package
          </Link>
        </div>
      </Section>
    </div>
  );
}
