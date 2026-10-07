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
        "flex flex-col rounded-sm border border-t-2 bg-surface p-6",
        highlighted ? "border-harbor" : "border-mist border-t-mist",
      )}
    >
      {badge && (
        <span className="mb-3 inline-block w-fit rounded-sm bg-harbor px-2.5 py-0.5 text-[11px] font-semibold text-paper">
          {badge}
        </span>
      )}
      {eyebrow && (
        <p className="text-sm font-medium text-harbor">{eyebrow}</p>
      )}
      <h3 className="text-lg text-ink">{title}</h3>
      <p className="mt-2 font-serif text-2xl font-semibold text-ink">{price}</p>
      {inclusions.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-mist pt-4">
          {inclusions.map((item, idx) => (
            <li key={`${idx}-${item}`} className="flex items-start gap-2 text-sm text-ink-soft">
              <svg
                viewBox="0 0 20 20"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-harbor"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 10.5l4 4 8-9" strokeLinecap="square" />
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
