import Link from "next/link";
import type { CityItem, LocalityItem, ServiceItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** Internal links to the city + service and city + locality landing pages. */
export default function CityLinks({
  city,
  services,
  localities,
  activeService,
  activeLocality,
}: {
  city: Pick<CityItem, "name" | "slug">;
  services: ServiceItem[];
  localities: LocalityItem[];
  activeService?: string;
  activeLocality?: string;
}) {
  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-sm font-medium transition",
      active
        ? "border-accent bg-accent-light text-accent-dark"
        : "border-border text-ink-soft hover:border-accent hover:text-accent-dark",
    );

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        {services.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-ink">Agencies in {city.name} by service</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${city.slug}/services/${s.slug}`}
                  className={chip(activeService === s.slug)}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {localities.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-ink">Agencies in {city.name} by area</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {localities.map((l) => (
                <Link
                  key={l.slug}
                  href={`/${city.slug}/areas/${l.slug}`}
                  className={chip(activeLocality === l.slug)}
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
