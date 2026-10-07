import type { Metadata } from "next";
import Link from "next/link";
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
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <span className="inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-dark">
            Our story
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            The people behind OneRoof Ventures
          </h1>
          <p className="mt-4 text-base text-ink-soft">
            [Add the founding story here — e.g. OneRoof Ventures started with a
            simple belief: finding the right marketing partner shouldn&apos;t
            take weeks of cold outreach and guesswork. We&apos;re building the
            one place businesses can compare agencies by city, on real data —
            reviews, pricing and results — before they ever get on a sales
            call.]
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-ink">Founders</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink-soft">
          Placeholder profiles — swap in real names, photos and bios whenever
          you&apos;re ready.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FOUNDERS.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-ink">What we stand for</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="text-base font-bold text-ink">{value.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-ink">
          Want OneRoof Ventures to run your marketing instead?
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          See our own managed marketing package and pricing.
        </p>
        <Link
          href="/services"
          className="mt-5 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          View our marketing package
        </Link>
      </section>
    </div>
  );
}
