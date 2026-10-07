import Link from "next/link";
import HeroPreview from "@/components/HeroPreview";
import { HomeEntryProvider, HomeQuiz, HomeSearch } from "@/components/HomeEntry";
import HowItWorks from "@/components/HowItWorks";
import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";
import { getCities, getServices } from "@/lib/api/public";
import { ctaButton, eyebrow, interactiveCard, card, secondaryButton, sectionTitle, textLink } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const STEPS = [
  {
    title: "Answer 2 quick taps",
    description:
      "Tell us the service you need and your budget — or just search, e.g. \"affordable SEO agency in Bangalore\".",
  },
  {
    title: "See your top 3 picks",
    description:
      "No long lists to scroll. We show exactly 3 agencies matched to your answers, with the full list one tap away.",
  },
  {
    title: "Compare & request quotes",
    description:
      "Shortlist up to 4 agencies and send one quote request to all of them at once.",
  },
];

/** Staggered hero entrance, 80ms apart (CSS, so it runs before hydration). */
function enterDelay(step: number) {
  return { "--enter-delay": `${step * 80}ms` } as React.CSSProperties;
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

export default async function Home() {
  const [cities, services] = await Promise.all([
    getCities().catch(() => []),
    getServices().catch(() => []),
  ]);
  const totalAgencies = cities.reduce((sum, c) => sum + c.agencyCount, 0);

  const stats = [
    { value: totalAgencies, label: totalAgencies === 1 ? "Agency listed" : "Agencies listed", highlight: true },
    { value: cities.length, label: cities.length === 1 ? "City live" : "Cities live", highlight: false },
    { value: services.length, label: "Services compared", highlight: false },
  ];

  return (
    <HomeEntryProvider cities={cities} services={services}>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="bg-dot-grid absolute inset-0" />
          <div className="aurora -top-24 right-[-30%] h-[22rem] w-[30rem] sm:right-[-10%] lg:-top-32 lg:right-[-6%] lg:h-[40rem] lg:w-[52rem]" />
        </div>

        <div className="container-page grid grid-cols-1 items-center gap-12 pb-16 pt-12 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24 lg:pt-24">
          <div>
            <p className={cn(eyebrow, "enter rounded-full border border-primary/20 bg-primary/8 px-3 py-1")} style={enterDelay(0)}>
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Free for businesses
            </p>
            <h1
              className="enter mt-5 max-w-[16ch] font-display text-hero-sm font-bold text-text sm:text-[2.75rem] sm:leading-[1.08] lg:text-hero"
              style={enterDelay(1)}
            >
              Find the right marketing agency, city by city.
            </h1>
            <p className="enter mt-5 max-w-[34rem] text-base text-text-muted sm:text-lg" style={enterDelay(2)}>
              Compare agencies on real, published prices and packages — then send
              one quote request to your shortlist.
            </p>
            <div className="enter mt-8" style={enterDelay(3)}>
              <HomeSearch />
            </div>
          </div>

          <div className="enter mx-auto w-full max-w-md lg:max-w-none" style={enterDelay(4)}>
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Guided quiz */}
      <section id="quiz" className="scroll-mt-20 py-16 lg:py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl">
            <div className="text-center">
              <h2 className={sectionTitle}>Not sure what to search?</h2>
              <p className="mx-auto mt-3 max-w-[60ch] text-base text-text-muted">
                Answer a few quick taps and we&apos;ll show your top 3 agencies.
              </p>
            </div>
            <HomeQuiz className="mt-8" />
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="OneRoof in numbers" className="pb-16 lg:pb-24">
        <div className="container-page">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08} className={cn(card, "flex flex-col-reverse p-6")}>
                <dt className="mt-1 text-sm text-text-muted">{stat.label}</dt>
                <dd className="num text-[2.5rem] font-bold leading-none lg:text-5xl">
                  <CountUp value={stat.value} className={stat.highlight ? "text-gradient" : "text-text"} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-surface py-16 lg:py-24">
        <div className="container-page">
          <Reveal className="max-w-2xl">
            <h2 className={sectionTitle}>How it works</h2>
          </Reveal>
          <HowItWorks steps={STEPS} />
        </div>
      </section>

      {/* Browse by city */}
      <section className="py-16 lg:py-24">
        <div className="container-page">
          <Reveal>
            <h2 className={sectionTitle}>Browse by city</h2>
            <p className="mt-3 text-base text-text-muted">
              Agency prices are researched and refreshed city by city.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.length === 0 && (
              <p className="text-base text-text-muted">Cities are on their way — check back soon.</p>
            )}
            {cities.map((city, i) => {
              const count = city.agencyCount;
              return (
                <Reveal key={city.slug} delay={Math.min(i, 5) * 0.05}>
                  <Link href={`/${city.slug}`} className={cn(interactiveCard, "group flex min-h-20 items-center justify-between gap-3 p-5")}>
                    <span>
                      <span className="block font-display text-card font-semibold text-text">{city.name}</span>
                      <span className="mt-0.5 block text-sm text-text-muted">
                        {count > 0 ? `${count} agencies` : "Coming soon"}
                      </span>
                    </span>
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-[color,border-color,transform] duration-200 group-hover:translate-x-0.5 group-hover:border-primary/40 group-hover:text-primary-text">
                      <ArrowRight />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our package + founders */}
      <section className="pb-16 lg:pb-24">
        <div className="container-page grid grid-cols-1 gap-4 md:grid-cols-2">
          <Reveal className={cn(card, "p-6 sm:p-8")}>
            <h2 className="text-xl font-semibold text-text sm:text-2xl">Would rather skip the comparison?</h2>
            <p className="mt-3 text-base text-text-muted">
              OneRoof Ventures also runs a managed marketing package of our
              own — see what&apos;s included and why it&apos;s economical.
            </p>
            <Link href="/services" className={cn(textLink, "mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm")}>
              View our marketing package <ArrowRight />
            </Link>
          </Reveal>

          <Reveal delay={0.08} className={cn(card, "p-6 sm:p-8")}>
            <h2 className="text-xl font-semibold text-text sm:text-2xl">Who&apos;s behind this?</h2>
            <p className="mt-3 text-base text-text-muted">
              Meet the founders and the story behind OneRoof Ventures.
            </p>
            <Link href="/about" className={cn(textLink, "mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm")}>
              Meet the team <ArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="container-page">
          <Reveal className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface px-6 py-12 text-center shadow-raised sm:px-12 lg:py-16">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="bg-dot-grid absolute inset-0" />
              <div className="aurora -bottom-40 left-[calc(50%-18rem)] h-80 w-[36rem] opacity-30" />
            </div>
            <h2 className={cn(sectionTitle, "mx-auto max-w-[22ch]")}>
              Your shortlist is a minute away.
            </h2>
            <p className="mx-auto mt-3 max-w-[52ch] text-base text-text-muted">
              Compare real prices from agencies in your city, then send one quote
              request to all of them. Free for businesses, always.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="#quiz" className={ctaButton}>
                Find my top 3
              </Link>
              <Link href="/quote" className={secondaryButton}>
                Get quotes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </HomeEntryProvider>
  );
}
