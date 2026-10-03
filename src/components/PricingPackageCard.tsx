import type { PricingPackage } from "@/lib/types";
import { formatPriceRange, cn } from "@/lib/utils";

export default function PricingPackageCard({
  pkg,
  highlighted = false,
}: {
  pkg: PricingPackage;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-6",
        highlighted
          ? "border-accent bg-accent-light/40 shadow-md"
          : "border-border bg-surface",
      )}
    >
      {highlighted && (
        <span className="mb-3 inline-block w-fit rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
          Most popular
        </span>
      )}
      <h3 className="text-base font-bold text-ink">{pkg.name}</h3>
      <p className="mt-1 text-xl font-bold text-ink">
        {formatPriceRange(pkg.priceMin, pkg.priceMax)}
      </p>
      <ul className="mt-4 space-y-2">
        {pkg.inclusions.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
            <svg
              viewBox="0 0 20 20"
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
