"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminAgencyFilters, AgencyResponse, AgencyStatus, PricingType } from "@/lib/api/types";
import { deleteAgency, listAgencies, listCities, patchAgency } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { formatDate, PRICING_TYPE_LABELS } from "@/lib/utils";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import {
  dangerLinkButton,
  ErrorBanner,
  linkButton,
  PageHeader,
  Pager,
  selectClass,
  StatusBadge,
} from "@/components/admin/ui";

const PAGE_SIZE = 25;
const STATUSES: AgencyStatus[] = ["DRAFT", "PUBLISHED", "HIDDEN"];
const PRICING_TYPES: PricingType[] = ["FIXED", "RANGE", "QUOTE_ONLY"];

function readFilters(sp: URLSearchParams): AdminAgencyFilters {
  const hasPackages = sp.get("hasPackages");
  return {
    q: sp.get("q") || undefined,
    city: sp.get("city") || undefined,
    status: (sp.get("status") as AgencyStatus) || undefined,
    pricingType: (sp.get("pricingType") as PricingType) || undefined,
    hasPackages: hasPackages === "true" ? true : hasPackages === "false" ? false : undefined,
    fit: sp.get("fit") || undefined,
    page: Number(sp.get("page")) || 0,
    size: PAGE_SIZE,
  };
}

function AgenciesList() {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const filterKey = searchParams.toString();

  const agencies = useAsync(() => listAgencies(filters), filterKey);
  const cities = useAsync(listCities);
  const [search, setSearch] = useState(filters.q ?? "");
  const [fit, setFit] = useState(filters.fit ?? "");
  const [pendingDelete, setPendingDelete] = useState<AgencyResponse | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function setFilter(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`);
  }

  async function quickPatch(agency: AgencyResponse, patch: { status?: AgencyStatus; verified?: boolean }, label: string) {
    setBusyId(agency.id);
    try {
      const updated = await patchAgency(agency.id, patch);
      agencies.setData((prev) =>
        prev ? { ...prev, items: prev.items.map((a) => (a.id === updated.id ? updated : a)) } : prev!,
      );
      toast.show(`${agency.name} ${label}`);
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteAgency(target.id);
      toast.show(`${target.name} deleted`);
      agencies.reload();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  }

  const cityName = (slug: string) => cities.data?.find((c) => c.slug === slug)?.name ?? slug;

  const columns: DataTableColumn<AgencyResponse>[] = [
    {
      key: "name",
      header: "Name",
      render: (a) => (
        <div className="min-w-0">
          <Link href={`/admin/agencies/${a.id}/edit`} className="font-medium text-ink hover:text-harbor">
            {a.name}
          </Link>
          <p className="text-xs text-ink-soft">
            {cityName(a.citySlug)}
            {a.localitySlug ? ` · ${a.localitySlug}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={a.status} />
          {a.verified && <span className="text-[11px] font-medium text-harbor-dark">✓ Verified</span>}
        </div>
      ),
    },
    { key: "pricing", header: "Pricing", render: (a) => <span className="text-xs">{PRICING_TYPE_LABELS[a.pricingType]}</span> },
    {
      key: "packages",
      header: "Packages",
      render: (a) =>
        a.packageCount > 0 ? (
          a.packageCount
        ) : (
          <span className="text-xs font-medium text-danger">None</span>
        ),
    },
    { key: "fit", header: "Fit", render: (a) => <span className="text-xs text-ink-soft">{a.fitForUs ?? "—"}</span> },
    {
      key: "checked",
      header: "Last checked",
      render: (a) => (
        <span className={a.lastCheckedOn ? "text-xs" : "text-xs text-danger"}>
          {a.lastCheckedOn ? formatDate(a.lastCheckedOn) : "Never"}
        </span>
      ),
    },
    { key: "updated", header: "Updated", render: (a) => <span className="text-xs">{formatDate(a.updatedAt)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Agencies"
        description={agencies.data ? `${agencies.data.total} matching` : "…"}
        actions={
          <>
            <Link href="/admin/import" className="rounded-sm border border-mist px-4 py-2 text-sm font-medium text-ink hover:bg-muted">
              Import CSV
            </Link>
            <Link href="/admin/agencies/new" className="rounded-sm bg-harbor px-4 py-2 text-sm font-semibold text-paper hover:bg-harbor-dark">
              + Add Agency
            </Link>
          </>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilter({ q: search.trim() || undefined, fit: fit.trim() || undefined });
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, website…"
            className={`${selectClass} w-56`}
          />
          <input
            value={fit}
            onChange={(e) => setFit(e.target.value)}
            placeholder="Fit for us (e.g. Yes)"
            className={`${selectClass} w-40`}
          />
          <button type="submit" className="rounded-sm border border-mist px-3 py-2 text-sm font-medium text-ink hover:bg-muted">
            Search
          </button>
        </form>
        <select value={filters.city ?? ""} onChange={(e) => setFilter({ city: e.target.value })} className={selectClass}>
          <option value="">All cities</option>
          {cities.data?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={filters.status ?? ""} onChange={(e) => setFilter({ status: e.target.value })} className={selectClass}>
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select
          value={filters.pricingType ?? ""}
          onChange={(e) => setFilter({ pricingType: e.target.value })}
          className={selectClass}
        >
          <option value="">Any pricing</option>
          {PRICING_TYPES.map((p) => (
            <option key={p} value={p}>
              {PRICING_TYPE_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={filters.hasPackages === undefined ? "" : String(filters.hasPackages)}
          onChange={(e) => setFilter({ hasPackages: e.target.value })}
          className={selectClass}
        >
          <option value="">Packages: any</option>
          <option value="true">Has packages</option>
          <option value="false">Needs packages</option>
        </select>
        {filterKey && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFit("");
              router.replace(pathname);
            }}
            className="text-xs font-medium text-harbor hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4">
        <ErrorBanner error={agencies.error} onRetry={agencies.reload} />
      </div>

      <div className="mt-4">
        {!agencies.data ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <div className={agencies.loading ? "opacity-60 transition" : "transition"}>
            <DataTable
              columns={columns}
              data={agencies.data.items}
              getRowId={(a) => String(a.id)}
              paginate={false}
              emptyMessage="No agencies match these filters."
              onRefresh={agencies.reload}
              refreshing={agencies.loading}
              refreshLabel="agencies"
              renderActions={(a) => (
                <>
                  {a.status === "PUBLISHED" ? (
                    <button
                      type="button"
                      disabled={busyId === a.id}
                      onClick={() => quickPatch(a, { status: "HIDDEN" }, "hidden")}
                      className={linkButton}
                    >
                      Hide
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === a.id}
                      onClick={() => quickPatch(a, { status: "PUBLISHED" }, "published")}
                      className={linkButton}
                    >
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() =>
                      quickPatch(
                        a,
                        a.verified ? { verified: false } : { verified: true },
                        a.verified ? "unverified" : "verified",
                      )
                    }
                    className={linkButton}
                  >
                    {a.verified ? "Unverify" : "Verify"}
                  </button>
                  {a.status === "PUBLISHED" && (
                    <a href={`/${a.citySlug}/${a.slug}`} target="_blank" rel="noopener noreferrer" className={linkButton}>
                      View
                    </a>
                  )}
                  <Link href={`/admin/agencies/${a.id}/edit`} className={linkButton}>
                    Edit
                  </Link>
                  <button type="button" onClick={() => setPendingDelete(a)} className={dangerLinkButton}>
                    Delete
                  </button>
                </>
              )}
            />
            <Pager
              page={agencies.data.page}
              size={PAGE_SIZE}
              total={agencies.data.total}
              onPageChange={(page) => setFilter({ page: page > 0 ? String(page) : undefined })}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete agency?"
        description={`"${pendingDelete?.name}" and its packages will be permanently removed. To take it off the site temporarily, hide it instead.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

export default function AdminAgenciesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-soft">Loading…</p>}>
      <AgenciesList />
    </Suspense>
  );
}
