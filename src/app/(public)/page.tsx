import Link from "next/link";
import { Container, Section } from "@/components/Container";
import HeroPreview from "@/components/HeroPreview";
import { HomeQuiz, HomeSearch } from "@/components/HomeEntry";
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
    title: "Pick your city",
    summary: "Every agency in your city, prices up front.",
    description:
      "Open your city to see every listed agency with published prices — or just search, e.g. \"affordable SEO agency in Bangalore\".",
  },
  {
    title: "Filter and shortlist",
    summary: "Filter by service, area and budget.",
    description:
      "Narrow the list by service, area and budget, and compare packages side by side.",
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

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 17.5s5.5-4.8 5.5-9.5a5.5 5.5 0 0 0-11 0c0 4.7 5.5 9.5 5.5 9.5z" />
      <circle cx="10" cy="8" r="2" />
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
    <>
      {/* Hero: a navy brand panel lit by the orange glow. */}
      <section className="theme-navy bg-glow relative isolate overflow-hidden pb-12 pt-8 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-20">

        <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className={cn(eyebrow, "enter")} style={enterDelay(0)}>
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              Free for businesses
            </p>
            <h1
              className="enter mt-4 font-display text-[1.875rem] font-bold leading-[1.12] tracking-[-0.02em] text-text sm:mt-5 sm:max-w-[18ch] sm:text-[2.75rem] sm:leading-[1.08] lg:text-hero"
              style={enterDelay(1)}
            >
              Find the right marketing agency, <span className="text-emphasis">city by city.</span>
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
              <HomeSearch cities={cities} services={services} />
            </div>

            <dl
              aria-label="OneRoof in numbers"
              className="enter mt-6 grid max-w-md grid-cols-3 gap-4 sm:mt-10"
              style={enterDelay(4)}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-0.5 text-[13px] leading-snug text-text-muted">{stat.label}</dt>
                  <dd className="num text-2xl font-bold leading-tight sm:text-[1.75rem]">
                    <CountUp value={stat.value} className={stat.highlight ? "text-gradient" : "text-text"} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The animated preview sits beside the search on desktop only. */}
          <div className="enter hidden lg:col-span-5 lg:block" style={enterDelay(4)}>
            <HeroPreview />
          </div>
        </Container>
      </section>

      {/* Guided quiz */}
      <Section id="quiz" className="scroll-mt-20" containerClassName="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5 lg:pt-2">
          <h2 className={sectionTitle}>Tell us what you need</h2>
          <p className="mt-3 max-w-[48ch] text-base text-text-muted">
            Three quick taps — service, budget and city. Then send it as one quote
            request, or browse the agencies in your city yourself.
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
          <HomeQuiz cities={cities} services={services} />
        </div>
      </Section>

      {/* Browse by city: live cities as cards, upcoming ones as quiet chips. */}
      <Section flush id="cities" className="scroll-mt-20">
        <Reveal>
          <h2 className={sectionTitle}>Browse by city</h2>
          <p className="mt-3 max-w-[60ch] text-base text-text-muted">
            Agency prices are researched and refreshed city by city. More cities are on the way.
          </p>
        </Reveal>

        {live.length > 0 && (
          // Phones: one swipeable row. From md: a grid.
          <ul className="scrollbar-thin -mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:mt-8 lg:gap-4">
            {live.map((city) => (
              <li key={city.slug} className={cn("flex flex-shrink-0 snap-start md:w-auto", live.length === 1 ? "w-full" : "w-[78%]")}>
                <Link
                  href={`/${city.slug}`}
                  className={cn(interactiveCard, "group flex w-full items-end justify-between gap-3 p-5")}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-success-text">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                      Live
                    </span>
                    <span className="mt-4 block font-display text-2xl font-bold text-text">{city.name}</span>
                    <span className="mt-0.5 block text-sm text-text-muted">
                      <span className="num font-semibold text-text">{city.agencyCount}</span>{" "}
                      {city.agencyCount === 1 ? "agency" : "agencies"}
                    </span>
                  </span>
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-transform duration-200 group-hover:translate-x-0.5">
                    <ArrowRight />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Reveal className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between">
          {planned.length > 0 && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Coming soon</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {planned.map((city) => (
                  <li key={city.slug ?? city.name} className="inline-flex items-center gap-1 rounded-full bg-surface-raised px-3 py-1.5 text-[13px] text-text-muted">
                    <PinIcon />
                    {city.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link href="/quote" className={cn(textLink, "inline-flex min-h-11 flex-shrink-0 items-center gap-1.5 text-sm")}>
            City not listed? Get matched quotes <ArrowRight />
          </Link>
        </Reveal>
      </Section>

      {/* How it works: header row across the full width, then three step cards. */}
      <Section id="how-it-works" className="scroll-mt-20 border-y border-border bg-band">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={eyebrow}>How it works</p>
            <h2 className={cn(sectionTitle, "mt-2")}>From &quot;who do I call?&quot; to quotes in a minute.</h2>
            <p className="mt-3 max-w-[56ch] text-base text-text-muted">
              Three steps, no sign-up. Your shortlist and one quote request — that&apos;s it.
            </p>
          </div>
          <Link href="/quote" className={cn(secondaryButton, "hidden flex-shrink-0 sm:inline-flex")}>
            Start now <ArrowRight />
          </Link>
        </Reveal>
        <div className="mt-8 lg:mt-10">
          <HowItWorks steps={STEPS} />
        </div>
      </Section>

      {/* Our package + founders beside the final CTA (stacked on mobile). The CTA is the one centred band. */}
      <Section containerClassName="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          <Reveal className={cn(card, "p-5 sm:p-6")}>
            <h2 className="text-lg font-semibold text-text sm:text-xl">Would rather skip the comparison?</h2>
            <p className="mt-2 text-base text-text-muted">
              OneRoof Ventures runs managed marketing packages of its own —
              Meta &amp; Google Ads, creatives, social and SEO, from ₹12,999 a month.
            </p>
            <Link href="/services" className={cn(textLink, "mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm")}>
              See packages &amp; pricing <ArrowRight />
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

        <Reveal className="theme-navy bg-glow relative isolate flex flex-col justify-center overflow-hidden rounded-3xl px-5 py-8 text-center sm:px-12 sm:py-10 lg:col-span-7">
          <h2 className={cn(sectionTitle, "mx-auto max-w-[22ch]")}>
            Your shortlist is <span className="text-emphasis">a minute away.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-base text-text-muted">
            Compare real prices from agencies in your city, then send one quote
            request to all of them. Free for businesses, always.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="#quiz" className={ctaButton}>
              Tell us what you need
            </Link>
            <Link href="/quote" className={secondaryButton}>
              Get quotes
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
