import Link from "next/link";
import { Container } from "@/components/Container";
import Logo from "@/components/Logo";
import type { CityItem } from "@/lib/api/types";
import { primaryBadge } from "@/lib/styles";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-text-muted transition-colors duration-200 hover:text-text lg:min-h-8";

const headingClass = "font-sans text-sm font-semibold tracking-normal text-text";

/** Cities shown in the desktop column before "All cities". */
const DESKTOP_CITY_LIMIT = 10;

const LINK_GROUPS = [
  {
    title: "For businesses",
    links: [
      { href: "/quote", label: "Get matched quotes" },
      { href: "/compare", label: "Compare agencies" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About & founders" },
      { href: "/services", label: "Packages & pricing" },
    ],
  },
];

function LinkList({ links }: { links: Array<{ href: string; label: string }> }) {
  return (
    <ul className="lg:space-y-1">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={linkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const allCitiesLink = (
  <Link href="/#cities" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-text hover:underline lg:min-h-8">
    All cities <span aria-hidden="true">→</span>
  </Link>
);

/*
 * The city list grows every week, so it never becomes one link per row:
 * phones get a single swipeable row of chips, desktop a two-column list
 * capped at DESKTOP_CITY_LIMIT with an "All cities" link.
 */
export default function Footer({ cities }: { cities: CityItem[] }) {
  const liveCities = cities.filter((c) => c.agencyCount > 0);
  const cityLinks = (liveCities.length > 0 ? liveCities : cities).map((c) => ({ href: `/${c.slug}`, label: c.name }));

  return (
    <footer className="theme-ink">
      <Container className="py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1.6fr_1fr_1fr_1.2fr] lg:gap-8">
          <div>
            <Logo size={40} />
            <p className="mt-3 max-w-xs text-sm text-text-muted lg:mt-4">
              Compare top marketing agencies city by city in India. Free for businesses, always.
            </p>
          </div>

          {cityLinks.length > 0 && (
            <nav aria-label="Cities">
              <h3 className={headingClass}>Browse cities</h3>

              {/* Phones and tablets: one swipeable row, however many cities there are. */}
              <div className="lg:hidden">
                <ul className="scrollbar-thin -mx-4 mt-3 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
                  {cityLinks.map((link) => (
                    <li key={link.href} className="snap-start">
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-border bg-surface px-4 text-sm font-medium text-text transition-colors hover:border-primary/50"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {allCitiesLink}
              </div>

              {/* Desktop: two short columns. */}
              <div className="hidden lg:block">
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                  {cityLinks.slice(0, DESKTOP_CITY_LIMIT).map((link) => (
                    <li key={link.href} className="min-w-0">
                      <Link href={link.href} className={cn(linkClass, "truncate")}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {cityLinks.length > DESKTOP_CITY_LIMIT && <div className="mt-1">{allCitiesLink}</div>}
              </div>
            </nav>
          )}

          {/* Two link groups side by side on phones; their own columns on desktop. */}
          <div className="grid grid-cols-2 gap-6 lg:contents">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className={headingClass}>{group.title}</h3>
                <div className="mt-2 lg:mt-3">
                  <LinkList links={group.links} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 lg:border-0 lg:bg-transparent lg:p-0">
            <h3 className={headingClass}>For agencies</h3>
            <p className="mt-2 text-sm text-text-muted lg:mt-3">
              Get discovered by businesses actively comparing agencies in your city.
            </p>
            <span className={`${primaryBadge} mt-3`}>Premium placement available</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-1 border-t border-border pt-6 text-[13px] text-text-muted sm:flex-row sm:items-center lg:mt-10 lg:text-sm">
          <p>© {new Date().getFullYear()} OneRoof Ventures. All rights reserved.</p>
          <p>Agency data is reviewed and refreshed regularly for accuracy.</p>
        </div>
      </Container>
    </footer>
  );
}
