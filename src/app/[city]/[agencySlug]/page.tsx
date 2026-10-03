import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCityBySlug } from "@/lib/data/cities";
import { AGENCIES, getAgencyBySlug } from "@/lib/data/agencies";
import { formatDate } from "@/lib/utils";
import StarRating from "@/components/StarRating";
import ScoreBadge from "@/components/ScoreBadge";
import PricingPackageCard from "@/components/PricingPackageCard";
import ReviewCard from "@/components/ReviewCard";

export function generateStaticParams() {
  return AGENCIES.map((a) => ({ city: a.city, agencySlug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; agencySlug: string }>;
}): Promise<Metadata> {
  const { city, agencySlug } = await params;
  const agency = getAgencyBySlug(city, agencySlug);
  if (!agency) return {};
  return {
    title: `${agency.name} | OneRoof Ventures`,
    description: agency.tagline,
  };
}

export default async function AgencyProfilePage({
  params,
}: {
  params: Promise<{ city: string; agencySlug: string }>;
}) {
  const { city: citySlug, agencySlug } = await params;
  const city = getCityBySlug(citySlug);
  const agency = getAgencyBySlug(citySlug, agencySlug);
  if (!city || !agency) notFound();

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: agency.reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const maxCount = Math.max(1, ...ratingCounts.map((r) => r.count));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/${city.slug}`} className="text-sm font-medium text-ink-soft hover:text-accent">
        ← {city.name} agencies
      </Link>

      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-accent-light text-lg font-bold text-accent-dark">
            {agency.name
              .split(" ")
              .filter((w) => /^[A-Za-z&]/.test(w))
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-xl font-bold text-ink sm:text-2xl">{agency.name}</h1>
              {agency.premium && (
                <span className="flex-shrink-0 rounded-full bg-gold-light px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
                  Premium
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-soft">{agency.tagline}</p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={agency.rating} />
              <span className="text-sm text-ink-soft">{agency.reviewCount} reviews</span>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Profile verified as of {formatDate(agency.lastUpdated)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <ScoreBadge score={agency.score} breakdown={agency.scoreBreakdown} size="lg" />
          <Link
            href={`/quote?agencies=${agency.id}`}
            className="w-full rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-accent-dark sm:w-auto"
          >
            Request a quote
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Team size", agency.teamSize],
          ["Years active", `${agency.yearsActive} yrs`],
          ["Response time", agency.responseTime],
          ["Languages", agency.languages.join(", ")],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">Services</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {agency.services.map((s) => (
            <span key={s} className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-ink-soft">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">Industries served</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {agency.industries.map((i) => (
            <span
              key={i}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-soft"
            >
              {i}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">Pricing packages</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {agency.packages.map((pkg, idx) => (
            <PricingPackageCard key={pkg.name} pkg={pkg} highlighted={idx === 1} />
          ))}
        </div>
      </section>

      {agency.caseStudies.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink">Case studies</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {agency.caseStudies.map((cs) => (
              <div key={cs.title} className="rounded-xl border border-border bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                  {cs.client}
                </p>
                <h3 className="mt-1 text-sm font-bold text-ink">{cs.title}</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-ink-soft">Before</p>
                    <p className="font-medium text-ink">{cs.before}</p>
                  </div>
                  <div className="rounded-lg bg-accent-light p-3">
                    <p className="text-xs text-accent-dark">After</p>
                    <p className="font-medium text-ink">{cs.after}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-accent-dark">{cs.metric}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">Reviews</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="w-8">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {agency.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-accent-light/50 p-6 sm:flex-row">
        <div>
          <p className="text-sm font-bold text-ink">Ready to work with {agency.name}?</p>
          <p className="text-sm text-ink-soft">Get a tailored quote, free of charge.</p>
        </div>
        <Link
          href={`/quote?agencies=${agency.id}`}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Request a quote
        </Link>
      </div>
    </div>
  );
}
