"use client";

import Link from "next/link";
import { listAgencies, listLeads } from "@/lib/api/admin";
import { useAsync } from "@/lib/use-async";
import { formatDateTime } from "@/lib/utils";
import StatCard, { StatCardSkeleton } from "@/components/admin/StatCard";
import { ErrorBanner, PageHeader, StatusBadge } from "@/components/admin/ui";

async function loadDashboard() {
  const [all, published, drafts, missingPackages, newLeads, recentLeads] = await Promise.all([
    listAgencies({ size: 1 }),
    listAgencies({ status: "PUBLISHED", size: 1 }),
    listAgencies({ status: "DRAFT", size: 1 }),
    listAgencies({ hasPackages: false, size: 1 }),
    listLeads({ status: "NEW", size: 1 }),
    listLeads({ size: 6 }),
  ]);
  return {
    totalAgencies: all.total,
    published: published.total,
    drafts: drafts.total,
    missingPackages: missingPackages.total,
    newLeads: newLeads.total,
    recentLeads: recentLeads.items,
  };
}

export default function AdminDashboardPage() {
  const { data: stats, error, reload } = useAsync(loadDashboard);

  const cards = stats
    ? [
        { label: "Total agencies", value: stats.totalAgencies, href: "/admin/agencies" },
        { label: "Published", value: stats.published, href: "/admin/agencies?status=PUBLISHED" },
        { label: "Drafts", value: stats.drafts, href: "/admin/agencies?status=DRAFT", warn: stats.drafts > 0 },
        {
          label: "Need packages",
          value: stats.missingPackages,
          href: "/admin/agencies?hasPackages=false",
          warn: stats.missingPackages > 0,
        },
        { label: "New leads", value: stats.newLeads, href: "/admin/leads?status=NEW", warn: stats.newLeads > 0 },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Public pages pick up admin changes within about 5 minutes."
        actions={
          <Link href="/admin/agencies/new" className="rounded-sm bg-harbor px-4 py-2 text-sm font-semibold text-paper hover:bg-harbor-dark">
            + Add Agency
          </Link>
        }
      />

      <div className="mt-4">
        <ErrorBanner error={error} onRetry={reload} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {!stats
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((card) => (
              <Link key={card.label} href={card.href} className="block transition hover:opacity-80">
                <StatCard label={card.label} value={card.value} tone={card.warn ? "warning" : "default"} />
              </Link>
            ))}
      </div>

      <div className="mt-8 rounded-sm border border-mist bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Latest quote requests</h2>
          <Link href="/admin/leads" className="text-xs font-medium text-harbor hover:underline">
            View all →
          </Link>
        </div>
        {!stats ? (
          <p className="mt-3 text-sm text-ink-soft">Loading…</p>
        ) : stats.recentLeads.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No quote requests yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-mist">
            {stats.recentLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {lead.name}
                    {lead.businessName && <span className="font-normal text-ink-soft"> · {lead.businessName}</span>}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {lead.serviceSlug} · {lead.citySlug} · {formatDateTime(lead.createdAt)}
                  </p>
                </div>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
