import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function PricingPackageCard({
  eyebrow,
  title,
  price,
  inclusions,
  highlighted = false,
  badge,
  footer,
}: {
  eyebrow?: string;
  title: string;
  price: string;
  inclusions: string[];
  highlighted?: boolean;
  badge?: string;
  footer?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-6",
        highlighted ? "border-accent bg-accent-light/40 shadow-md" : "border-border bg-surface",
      )}
    >
      {badge && (
        <span className="mb-3 inline-block w-fit rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">{eyebrow}</p>
      )}
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1 text-xl font-bold text-ink">{price}</p>
      {inclusions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {inclusions.map((item, idx) => (
            <li key={`${idx}-${item}`} className="flex items-start gap-2 text-sm text-ink-soft">
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
      )}
      {footer && <div className="mt-auto pt-5">{footer}</div>}
    </div>
  );
}
