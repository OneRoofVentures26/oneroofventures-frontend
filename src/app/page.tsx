import Link from "next/link";
import CityPicker from "@/components/CityPicker";
import { CITIES } from "@/lib/data/cities";
import { AGENCIES, getAgenciesByCity } from "@/lib/data/agencies";

const STEPS = [
  {
    title: "Pick your city",
    description:
      "Choose from 10 major Indian cities to see agencies that actually operate where you do business.",
  },
  {
    title: "Compare agencies",
    description:
      "Filter by service, budget and industry, then compare up to 4 agencies side by side on price, ratings and results.",
  },
  {
    title: "Request quotes",
    description:
      "Send one brief to every shortlisted agency at once. No repeated forms, no sales calls until you're ready.",
  },
];

export default function Home() {
  const totalReviews = AGENCIES.reduce((sum, a) => sum + a.reviewCount, 0);

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
            Compare verified agencies on price, services and real client
            reviews — then send one quote request to your shortlist.
          </p>

          <div className="mt-8">
            <CityPicker />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              [`${AGENCIES.length}+`, "Verified agencies"],
              ["10", "Indian cities"],
              [`${totalReviews.toLocaleString("en-IN")}+`, "Client reviews"],
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
            Agencies are verified and refreshed city by city.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((city) => {
              const count = getAgenciesByCity(city.slug).length;
              return (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-paper p-5 transition hover:border-accent hover:shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">{city.name}</p>
                    <p className="text-xs text-ink-soft">{city.state}</p>
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
    </div>
  );
}
