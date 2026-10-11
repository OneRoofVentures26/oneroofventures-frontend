import Link from "next/link";
import type { CityItem, LocalityItem, ServiceItem } from "@/lib/api/types";
import { Container } from "@/components/Container";
import { chip } from "@/lib/styles";

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
  return (
    <section className="section-y border-t border-border bg-surface">
      <Container className="space-y-8">
        {services.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text">Agencies in {city.name} by service</h2>
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
            <h2 className="text-lg font-semibold text-text">Agencies in {city.name} by area</h2>
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
      </Container>
    </section>
  );
}
