import Link from "next/link";
import { Container, Section } from "@/components/Container";
import HeroPreview from "@/components/HeroPreview";
import { HomeEntryProvider, HomeQuiz, HomeSearch } from "@/components/HomeEntry";
import HowItWorks from "@/components/HowItWorks";
import CountUp from "@/components/motion/CountUp";
import Reveal from "@/components/motion/Reveal";
import { getCities, getServices } from "@/lib/api/public";
import type { CityItem } from "@/lib/api/types";
import { ctaButton, eyebrow, interactiveCard, card, secondaryButton, sectionTitle, textLink } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const STEPS = [
  {
    title: "Answer 2 quick taps",
    summary: "Pick a service and a budget, or just search.",
    description:
      "Tell us the service you need and your budget — or just search, e.g. \"affordable SEO agency in Bangalore\".",
  },
  {
    title: "See your top 3 picks",
    summary: "Three matched agencies, full list one tap away.",
    description:
      "No long lists to scroll. We show exactly 3 agencies matched to your answers, with the full list one tap away.",
  },
  {
    title: "Compare & request quotes",
    summary: "Shortlist up to 4 and send one quote request.",
    description:
      "Shortlist up to 4 agencies and send one quote request to all of them at once.",
  },
];

const TRUST_POINTS = [
  "Real, published prices — not \"call for a quote\"",
  "Free for businesses, no sign-up needed",
  "One quote request reaches your whole shortlist",
];

/** Cities we're researching next, shown as "Coming soon" until they go live. */
const PLANNED_CITIES = [
  "Delhi NCR",
  "Mumbai",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-text" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

type CityTile = { name: string; slug: string | null; agencyCount: number };

/** Live cities first, then every planned city that isn't live yet. */
function cityTiles(cities: CityItem[]): { live: CityTile[]; planned: CityTile[] } {
  const byName = new Map(cities.map((c) => [c.name.toLowerCase(), c]));
  const live = cities.filter((c) => c.agencyCount > 0);
  const planned: CityTile[] = [
    ...cities.filter((c) => c.agencyCount === 0),
    ...PLANNED_CITIES.filter((name) => !byName.has(name.toLowerCase())).map((name) => ({
      name,
      slug: null,
      agencyCount: 0,
    })),
  ];
  return { live, planned };
}

export default async function Home() {
  const [cities, services] = await Promise.all([
    getCities().catch(() => []),
    getServices().catch(() => []),
  ]);
  const totalAgencies = cities.reduce((sum, c) => sum + c.agencyCount, 0);
  const { live, planned } = cityTiles(cities);

  const stats = [
    { value: totalAgencies, label: totalAgencies === 1 ? "Agency listed" : "Agencies listed", highlight: true },
    { value: live.length, label: live.length === 1 ? "City live" : "Cities live", highlight: false },
    { value: services.length, label: "Services compared", highlight: false },
  ];

  return (
    <HomeEntryProvider cities={cities} services={services}>
      {/* Hero: 48px bottom padding, the quiz follows straight on. */}
      <section className="relative isolate overflow-hidden pb-12 pt-6 sm:pt-12 lg:pt-16">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="bg-dot-grid absolute inset-0" />
          <div className="aurora -top-24 right-[-30%] h-[22rem] w-[30rem] sm:right-[-10%] lg:-top-32 lg:right-[-6%] lg:h-[40rem] lg:w-[52rem]" />
        </div>

        <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className={cn(eyebrow, "enter rounded-full border border-primary/20 bg-primary/8 px-3 py-1")} style={enterDelay(0)}>
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Free for businesses
            </p>
            <h1
              className="enter mt-4 font-display text-[1.875rem] font-bold leading-[1.12] tracking-[-0.02em] text-text sm:mt-5 sm:max-w-[18ch] sm:text-[2.75rem] sm:leading-[1.08] lg:text-hero"
              style={enterDelay(1)}
            >
              Find the right marketing agency, city by city.
            </h1>
            {/* Hidden on short phones (e.g. iPhone SE) so the quiz still starts in the first screen. */}
            <p
              className="enter mt-3 max-w-[34rem] text-base text-text-muted max-sm:[@media(max-height:719px)]:hidden sm:mt-5 sm:text-lg"
              style={enterDelay(2)}
            >
              Compare agencies on real, published prices and packages — then send
              one quote request to your shortlist.
            </p>
            <div className="enter mt-5 sm:mt-8" style={enterDelay(3)}>
              <HomeSearch />
            </div>

            <dl
              aria-label="OneRoof in numbers"
              className="enter mt-5 grid max-w-xl grid-cols-3 divide-x divide-border sm:mt-8"
              style={enterDelay(4)}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse px-3 first:pl-0 sm:px-5">
                  <dt className="mt-0.5 text-[13px] leading-snug text-text-muted">{stat.label}</dt>
                  <dd className="num text-2xl font-bold leading-tight sm:text-[1.75rem]">
                    <CountUp value={stat.value} className={stat.highlight ? "text-gradient" : "text-text"} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The animated preview sits beside the search on desktop; below that it moves under the quiz. */}
          <div className="enter hidden lg:col-span-5 lg:block" style={enterDelay(4)}>
            <HeroPreview />
          </div>
        </Container>
      </section>

      {/* Guided quiz */}
      <Section flush id="quiz" className="scroll-mt-20" containerClassName="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5 lg:pt-2">
          <h2 className={sectionTitle}>Not sure what to search?</h2>
          <p className="mt-3 max-w-[48ch] text-base text-text-muted">
            Answer a few quick taps and we&apos;ll show your top 3 agencies — matched on
            service, budget and city.
          </p>
          <ul className="mt-6 hidden space-y-3 lg:block">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-base text-text">
                <CheckIcon />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
        <div className="lg:col-span-7">
          <HomeQuiz />
          <div className="mt-6 hidden sm:block lg:hidden">
            <HeroPreview />
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section
        id="how-it-works"
        className="scroll-mt-20 border-y border-border bg-surface"
        containerClassName="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-12 lg:gap-12"
      >
        <Reveal className="lg:col-span-4">
          <h2 className={sectionTitle}>How it works</h2>
          <p className="mt-3 max-w-[40ch] text-base text-text-muted">
            From &quot;who do I even call?&quot; to quotes in your inbox, in about a minute.
          </p>
        </Reveal>
        <div className="lg:col-span-8">
          <HowItWorks steps={STEPS} />
        </div>
      </Section>

      {/* Browse by city */}
      <Section>
        <Reveal>
          <h2 className={sectionTitle}>Browse by city</h2>
          <p className="mt-3 max-w-[60ch] text-base text-text-muted">
            Agency prices are researched and refreshed city by city. More cities are on the way.
          </p>
        </Reveal>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:mt-8 lg:grid-cols-4 lg:gap-4">
          {live.map((city, i) => (
            <Reveal as="li" key={city.slug} className={cn("flex", i === 0 && "col-span-2")}>
              <Link
                href={`/${city.slug}`}
                className={cn(interactiveCard, "group flex w-full items-center justify-between gap-3 border-primary/30 p-4 sm:px-5")}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-success-text">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                    Live now
                  </span>
                  <span className="mt-1 block font-display text-xl font-semibold text-text">{city.name}</span>
                  <span className="mt-0.5 block text-sm text-text-muted">
                    <span className="num font-semibold text-text">{city.agencyCount}</span> agencies with published prices
                  </span>
                </span>
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight />
                </span>
              </Link>
            </Reveal>
          ))}
          {planned.map((city, i) => {
            const body = (
              <>
                <span className="block font-display text-base font-semibold text-text-muted">{city.name}</span>
                <span className="mt-0.5 block text-[13px] text-text-muted">Coming soon</span>
              </>
            );
            const tile = "flex min-h-14 w-full flex-col justify-center rounded-2xl border border-dashed border-border bg-bg/40 px-4 py-2.5 sm:min-h-16 sm:py-3";
            return (
              <Reveal as="li" key={city.slug ?? city.name} delay={Math.min(i, 5) * 0.04} className="flex">
                {city.slug ? (
                  <Link href={`/${city.slug}`} className={cn(tile, "transition-colors hover:border-primary/40")}>
                    {body}
                  </Link>
                ) : (
                  <div className={tile}>{body}</div>
                )}
              </Reveal>
            );
          })}
          <Reveal as="li" className="flex">
            <Link
              href="/quote"
              className="group flex min-h-14 w-full flex-col justify-center rounded-2xl border border-primary/25 bg-primary/8 px-4 py-2.5 transition-colors hover:border-primary/50 sm:min-h-16 sm:py-3"
            >
              <span className="block text-sm font-semibold text-primary-text">Your city not listed?</span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-text-muted">
                Get matched quotes <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </Reveal>
        </ul>
      </Section>

      {/* Our package + founders beside the final CTA (stacked on mobile). The CTA is the one centred band. */}
      <Section flush containerClassName="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          <Reveal className={cn(card, "p-5 sm:p-6")}>
            <h2 className="text-lg font-semibold text-text sm:text-xl">Would rather skip the comparison?</h2>
            <p className="mt-2 text-base text-text-muted">
              OneRoof Ventures also runs a managed marketing package of our
              own — see what&apos;s included and why it&apos;s economical.
            </p>
            <Link href="/services" className={cn(textLink, "mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm")}>
              View our marketing package <ArrowRight />
            </Link>
          </Reveal>

          <Reveal delay={0.08} className={cn(card, "p-5 sm:p-6")}>
            <h2 className="text-lg font-semibold text-text sm:text-xl">Who&apos;s behind this?</h2>
            <p className="mt-2 text-base text-text-muted">
              Meet the founders and the story behind OneRoof Ventures.
            </p>
            <Link href="/about" className={cn(textLink, "mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm")}>
              Meet the team <ArrowRight />
            </Link>
          </Reveal>
        </div>

        <Reveal className="relative isolate flex flex-col justify-center overflow-hidden rounded-3xl border border-border bg-surface px-5 py-8 text-center shadow-raised sm:px-12 sm:py-10 lg:col-span-7">
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
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="#quiz" className={ctaButton}>
              Find my top 3
            </Link>
            <Link href="/quote" className={secondaryButton}>
              Get quotes
            </Link>
          </div>
        </Reveal>
      </Section>
    </HomeEntryProvider>
  );
}
