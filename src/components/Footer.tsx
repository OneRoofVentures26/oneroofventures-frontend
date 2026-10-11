import Link from "next/link";
import { Container } from "@/components/Container";
import Logo from "@/components/Logo";
import type { CityItem } from "@/lib/api/types";
import { primaryBadge } from "@/lib/styles";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-text-muted transition-colors duration-200 hover:text-text lg:min-h-8";

interface FooterGroup {
  title: string;
  links?: Array<{ href: string; label: string }>;
  body?: React.ReactNode;
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 text-text-muted transition-transform duration-200 group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

function GroupContent({ group }: { group: FooterGroup }) {
  return group.links ? (
    <ul className="lg:space-y-1">
      {group.links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={linkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <>{group.body}</>
  );
}

export default function Footer({ cities }: { cities: CityItem[] }) {
  const liveCities = cities.filter((c) => c.agencyCount > 0);
  const cityLinks = (liveCities.length > 0 ? liveCities : cities).map((c) => ({ href: `/${c.slug}`, label: c.name }));

  const groups: FooterGroup[] = [
    { title: "Browse cities", links: cityLinks.slice(0, 6) },
    ...(cityLinks.length > 6 ? [{ title: "More cities", links: cityLinks.slice(6) }] : []),
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
        { href: "/services", label: "Our marketing package" },
      ],
    },
    {
      title: "For agencies",
      body: (
        <div className="pb-3 lg:pb-0">
          <p className="text-sm text-text-muted">
            Get discovered by businesses actively comparing agencies in your city.
          </p>
          <span className={`${primaryBadge} mt-3`}>Premium placement available</span>
        </div>
      ),
    },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-6 lg:py-10">
        <div
          className={cn(
            "grid grid-cols-1 gap-4 lg:gap-8",
            groups.length > 4 ? "lg:grid-cols-[1.4fr_repeat(5,1fr)]" : "lg:grid-cols-[1.4fr_repeat(4,1fr)]",
          )}
        >
          <div>
            <Logo size={30} />
            <p className="mt-2 max-w-xs text-sm text-text-muted lg:mt-4">
              Compare top marketing agencies city by city in India. Free for businesses, always.
            </p>
          </div>

          {/* Mobile + tablet: one accordion per group. */}
          <div className="divide-y divide-border border-y border-border lg:hidden">
            {groups.map((group) => (
              <details key={group.title} className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-text [&::-webkit-details-marker]:hidden">
                  {group.title}
                  <Chevron />
                </summary>
                <GroupContent group={group} />
              </details>
            ))}
          </div>

          {/* Desktop: columns. */}
          {groups.map((group) => (
            <div key={group.title} className="hidden lg:block">
              <h3 className="font-sans text-sm font-semibold tracking-normal text-text">{group.title}</h3>
              <div className="mt-3">
                <GroupContent group={group} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-0.5 text-[13px] text-text-muted sm:flex-row sm:items-center lg:mt-8 lg:border-t lg:border-border lg:pt-6 lg:text-sm">
          <p>© {new Date().getFullYear()} OneRoof Ventures. All rights reserved.</p>
          <p>Agency data is reviewed and refreshed regularly for accuracy.</p>
        </div>
      </Container>
    </footer>
  );
}
