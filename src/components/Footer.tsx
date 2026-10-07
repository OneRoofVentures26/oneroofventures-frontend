import Link from "next/link";
import Logo from "@/components/Logo";
import type { CityItem } from "@/lib/api/types";
import { primaryBadge } from "@/lib/styles";

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-text-muted transition-colors duration-200 hover:text-text lg:min-h-8";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-sans text-sm font-semibold tracking-normal text-text">{title}</h3>
      <ul className="mt-3 lg:space-y-1">{children}</ul>
    </div>
  );
}

export default function Footer({ cities }: { cities: CityItem[] }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-page py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div className="col-span-2 lg:col-span-1">
            <Logo size={30} />
            <p className="mt-4 max-w-xs text-sm text-text-muted">
              Compare top marketing agencies city by city in India. Free for
              businesses, always.
            </p>
          </div>

          <FooterColumn title="Browse cities">
            {cities.slice(0, 6).map((city) => (
              <li key={city.slug}>
                <Link href={`/${city.slug}`} className={linkClass}>
                  {city.name}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {cities.length > 6 ? (
            <FooterColumn title="More cities">
              {cities.slice(6).map((city) => (
                <li key={city.slug}>
                  <Link href={`/${city.slug}`} className={linkClass}>
                    {city.name}
                  </Link>
                </li>
              ))}
            </FooterColumn>
          ) : (
            <FooterColumn title="For businesses">
              <li>
                <Link href="/quote" className={linkClass}>
                  Get matched quotes
                </Link>
              </li>
              <li>
                <Link href="/compare" className={linkClass}>
                  Compare agencies
                </Link>
              </li>
            </FooterColumn>
          )}

          <FooterColumn title="Company">
            <li>
              <Link href="/about" className={linkClass}>
                About &amp; founders
              </Link>
            </li>
            <li>
              <Link href="/services" className={linkClass}>
                Our marketing package
              </Link>
            </li>
          </FooterColumn>

          <div>
            <h3 className="font-sans text-sm font-semibold tracking-normal text-text">For agencies</h3>
            <p className="mt-3 text-sm text-text-muted">
              Get discovered by businesses actively comparing agencies in
              your city.
            </p>
            <span className={`${primaryBadge} mt-3`}>Premium placement available</span>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-sm text-text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} OneRoof Ventures. All rights reserved.</p>
          <p>Agency data is reviewed and refreshed regularly for accuracy.</p>
        </div>
      </div>
    </footer>
  );
}
