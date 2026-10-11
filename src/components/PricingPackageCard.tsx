import type { ReactNode } from "react";
import { card, primaryBadge } from "@/lib/styles";
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
    <div className={cn(card, "flex h-full flex-col p-5 sm:p-6", highlighted && "border-primary/50 ring-1 ring-inset ring-primary/25")}>
      {badge && <span className={cn(primaryBadge, "mb-3 w-fit")}>{badge}</span>}
      {eyebrow && <p className="text-sm font-medium text-primary-text">{eyebrow}</p>}
      <h3 className="text-card font-semibold text-text">{title}</h3>
      <p className="num mt-2 text-2xl font-semibold text-text">{price}</p>
      {inclusions.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-border pt-4">
          {inclusions.map((item, idx) => (
            <li key={`${idx}-${item}`} className="flex items-start gap-2 text-sm text-text-muted">
              <svg
                viewBox="0 0 20 20"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-text"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
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
