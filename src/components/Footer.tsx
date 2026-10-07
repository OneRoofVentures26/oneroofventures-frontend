import Link from "next/link";
import type { CityItem } from "@/lib/api/types";

export default function Footer({ cities }: { cities: CityItem[] }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">
                OR
              </span>
              <span className="text-base font-bold text-ink">OneRoof Ventures</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Compare top marketing agencies city by city in India. Free for
              businesses, always.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Browse cities</h3>
            <ul className="mt-3 space-y-2">
              {cities.slice(0, 6).map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.slug}`}
                    className="text-sm text-ink-soft hover:text-accent"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {cities.length > 6 ? (
            <div>
              <h3 className="text-sm font-semibold text-ink">More cities</h3>
              <ul className="mt-3 space-y-2">
                {cities.slice(6).map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/${city.slug}`}
                      className="text-sm text-ink-soft hover:text-accent"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-ink">For businesses</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/quote" className="text-sm text-ink-soft hover:text-accent">
                    Get matched quotes
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-sm text-ink-soft hover:text-accent">
                    Compare agencies
                  </Link>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-ink">Company</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-ink-soft hover:text-accent">
                  About &amp; founders
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-ink-soft hover:text-accent">
                  Our marketing package
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">For agencies</h3>
            <p className="mt-3 text-sm text-ink-soft">
              Get discovered by businesses actively comparing agencies in
              your city.
            </p>
            <span className="mt-3 inline-block rounded-md bg-accent-light px-3 py-1.5 text-xs font-medium text-accent-dark">
              Premium placement available
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} OneRoof Ventures. All rights reserved.
          </p>
          <p className="text-xs text-ink-soft">
            Agency data is reviewed and refreshed regularly for accuracy.
          </p>
        </div>
      </div>
    </footer>
  );
}
