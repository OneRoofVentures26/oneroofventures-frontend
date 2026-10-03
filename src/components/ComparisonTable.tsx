"use client";

import Link from "next/link";
import type { Agency } from "@/lib/types";
import { formatPrice, formatPriceRange } from "@/lib/utils";
import StarRating from "@/components/StarRating";

interface ComparisonTableProps {
  agencies: Agency[];
  onRemove?: (id: string) => void;
}

export default function ComparisonTable({ agencies, onRemove }: ComparisonTableProps) {
  if (agencies.length === 0) return null;

  const rows: Array<{ label: string; render: (a: Agency) => React.ReactNode }> = [
    {
      label: "Starting price",
      render: (a) => (
        <span className="font-semibold text-ink">
          {formatPrice(Math.min(...a.packages.map((p) => p.priceMin)))}/mo
        </span>
      ),
    },
    {
      label: "Full price range",
      render: (a) =>
        formatPriceRange(
          Math.min(...a.packages.map((p) => p.priceMin)),
          Math.max(...a.packages.map((p) => p.priceMax)),
        ),
    },
    {
      label: "OneRoof Score",
      render: (a) => <span className="font-semibold text-accent-dark">{a.score}/100</span>,
    },
    {
      label: "Rating",
      render: (a) => <StarRating rating={a.rating} />,
    },
    {
      label: "Services",
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.services.map((s) => (
            <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs text-ink-soft">
              {s}
            </span>
          ))}
        </div>
      ),
    },
    { label: "Team size", render: (a) => a.teamSize },
    { label: "Years active", render: (a) => `${a.yearsActive} yrs` },
    { label: "Response time", render: (a) => a.responseTime },
    {
      label: "Notable clients",
      render: (a) => a.notableClients.slice(0, 3).join(", "),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-40 border-b border-border p-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Agency
            </th>
            {agencies.map((a) => (
              <th key={a.id} className="min-w-[200px] border-b border-border p-4 text-left align-top">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/${a.city}/${a.slug}`}
                    className="font-bold text-ink hover:text-accent"
                  >
                    {a.name}
                  </Link>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(a.id)}
                      aria-label={`Remove ${a.name} from comparison`}
                      className="text-xs font-medium text-ink-soft hover:text-danger"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.label} className={idx % 2 === 0 ? "bg-paper/50" : ""}>
              <td className="border-b border-border p-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {row.label}
              </td>
              {agencies.map((a) => (
                <td key={a.id} className="border-b border-border p-4 text-ink">
                  {row.render(a)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
