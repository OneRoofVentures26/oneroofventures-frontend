import Link from "next/link";
import HomeEntry from "@/components/HomeEntry";
import { getCities, getServices } from "@/lib/api/public";

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

export default async function Home() {
  const [cities, services] = await Promise.all([
    getCities().catch(() => []),
    getServices().catch(() => []),
  ]);
  const totalAgencies = cities.reduce((sum, c) => sum + c.agencyCount, 0);

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-dark">
            Free for businesses
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            Find the right marketing agency,
            <br className="hidden sm:block" /> city by city.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">
            Compare agencies on real, published prices and packages — then send
            one quote request to your shortlist.
          </p>

          <div className="mt-8">
            <HomeEntry cities={cities} services={services} />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              [String(totalAgencies), totalAgencies === 1 ? "Agency listed" : "Agencies listed"],
              [String(cities.length), cities.length === 1 ? "City live" : "Cities live"],
              [String(services.length), "Services compared"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-accent-dark">{stat}</p>
                <p className="text-sm text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-ink">How it works</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {idx + 1}
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-ink">Browse by city</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Agency prices are researched and refreshed city by city.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.length === 0 && (
              <p className="text-sm text-ink-soft">Cities are on their way — check back soon.</p>
            )}
            {cities.map((city) => {
              const count = city.agencyCount;
              return (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-paper p-5 transition hover:border-accent hover:shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">{city.name}</p>
                  </div>
                  {count > 0 ? (
                    <span className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent-dark">
                      {count} agencies
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-ink-soft">
                      Coming soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">
              Would rather skip the comparison?
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              OneRoof Ventures also runs a managed marketing package of our
              own — see what&apos;s included and why it&apos;s economical.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
            >
              View our marketing package →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">Who&apos;s behind this?</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Meet the founders and the story behind OneRoof Ventures.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
            >
              Meet the team →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
