"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AdminAgencyFilters, AgencyBulkStatusResult, AgencyResponse, AgencyStatus, PricingType } from "@/lib/api/types";
import {
  agencyTags,
  deleteAgency,
  fetchCityLogos,
  listAgencies,
  listCities,
  patchAgency,
  recomputeScores,
  refreshPublic,
  setAgenciesStatus,
} from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { useSavedFilters } from "@/lib/use-saved-filters";
import { formatDate, PRICING_TYPE_LABELS } from "@/lib/utils";
import AgencyLogo from "@/components/AgencyLogo";
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
/** The backend rescores a few seconds after a change. */
const RESCORE_DELAY_MS = 4000;
const STATUSES: AgencyStatus[] = ["DRAFT", "PUBLISHED", "HIDDEN"];
const PRICING_TYPES: PricingType[] = ["FIXED", "RANGE", "QUOTE_ONLY"];
const STATUS_VERBS: Record<AgencyStatus, string> = { PUBLISHED: "published", HIDDEN: "hidden", DRAFT: "moved to draft" };

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

function AgenciesList({ setQuery }: { setQuery: (next: URLSearchParams) => void }) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const filterKey = searchParams.toString();

  const agencies = useAsync(() => listAgencies(filters), filterKey);
  const cities = useAsync(listCities);
  const [search, setSearch] = useState(filters.q ?? "");
  const [fit, setFit] = useState(filters.fit ?? "");
  const [pendingDelete, setPendingDelete] = useState<AgencyResponse | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [fetchingLogos, setFetchingLogos] = useState(false);
  // Ticked rows; cleared whenever the filters or page change.
  const [selection, setSelection] = useState<{ key: string; ids: number[] }>({ key: filterKey, ids: [] });
  const selectedIds = selection.key === filterKey ? selection.ids : [];
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkWarnings, setBulkWarnings] = useState<AgencyBulkStatusResult["warnings"]>([]);

  function toggleSelected(id: number) {
    setSelection({
      key: filterKey,
      ids: selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id],
    });
  }

  /** Publish, hide or draft several agencies at once. All or nothing on the backend. */
  async function bulkSetStatus(ids: number[], status: AgencyStatus) {
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      const result = await setAgenciesStatus(ids, status);
      const verb = STATUS_VERBS[status];
      const parts = [`${result.updated.length} ${verb}`];
      if (result.unchanged.length > 0) parts.push(`${result.unchanged.length} already ${verb}`);
      toast.show(parts.join(", "));

      const rows = agencies.data?.items ?? [];
      const tags = rows
        .filter((a) => result.updated.includes(a.id))
        .flatMap((a) => agencyTags(a, { ...a, status }));
      if (tags.length > 0) void refreshPublic({ tags: [...new Set(tags)] });

      // A new publish replaces the warnings; anything else drops the agencies it changed.
      setBulkWarnings((prev) =>
        status === "PUBLISHED" ? result.warnings : prev.filter((w) => !ids.includes(w.agencyId)),
      );
      setSelection({ key: filterKey, ids: [] });
      agencies.reload();
      // Scores and city price ranges update a few seconds later.
      window.setTimeout(() => {
        if (result.updated.length > 0) void refreshPublic({ agencyIds: result.updated });
        agencies.reload();
      }, RESCORE_DELAY_MS);
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBulkBusy(false);
    }
  }

  /** Recomputes the filtered city, or every active city. Only needed after a formula change. */
  async function handleRecompute() {
    setRecomputing(true);
    try {
      const results = await recomputeScores(filters.city);
      const scored = results.reduce((sum, r) => sum + r.agenciesScored, 0);
      // City tags also cover every agency profile in that city.
      void refreshPublic(filters.city ? { tags: results.map((r) => `city:${r.city}`) } : { allCities: true });
      toast.show(
        `Scored ${scored} agenc${scored === 1 ? "y" : "ies"} in ${results.length} cit${results.length === 1 ? "y" : "ies"}`,
      );
      agencies.reload();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setRecomputing(false);
    }
  }

  /** Queues logo fetches for the filtered city's agencies that have none; they arrive over the next minutes. */
  async function handleFetchLogos() {
    if (!filters.city) return;
    setFetchingLogos(true);
    try {
      const res = await fetchCityLogos(filters.city);
      toast.show(
        `${res.queued} queued${res.skipped ? `, ${res.skipped} skipped` : ""}. Refresh in a few minutes to see the logos.`,
      );
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setFetchingLogos(false);
    }
  }

  function setFilter(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    setQuery(next);
  }

  async function quickPatch(agency: AgencyResponse, patch: { status?: AgencyStatus; verified?: boolean }, label: string) {
    setBusyId(agency.id);
    try {
      const updated = await patchAgency(agency.id, patch);
      void refreshPublic({ tags: agencyTags(agency, updated) });
      agencies.setData((prev) =>
        prev ? { ...prev, items: prev.items.map((a) => (a.id === updated.id ? updated : a)) } : prev!,
      );
      toast.show(`${agency.name} ${label}`);
      // Verifying changes the One Roof Score; refresh public pages again once it's rescored.
      window.setTimeout(() => {
        void refreshPublic({ agencyIds: [agency.id] });
        agencies.reload();
      }, RESCORE_DELAY_MS);
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
      void refreshPublic({ tags: agencyTags(target, null) });
      toast.show(`${target.name} deleted`);
      agencies.reload();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  }

  const cityName = (slug: string) => cities.data?.find((c) => c.slug === slug)?.name ?? slug;

  const pageIds = agencies.data?.items.map((a) => a.id) ?? [];
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const columns: DataTableColumn<AgencyResponse>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => setSelection({ key: filterKey, ids: allSelected ? [] : pageIds })}
          aria-label="Select all agencies on this page"
          className="h-4 w-4 accent-primary"
        />
      ),
      className: "w-10",
      render: (a) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(a.id)}
          onChange={() => toggleSelected(a.id)}
          aria-label={`Select ${a.name}`}
          className="h-4 w-4 accent-primary"
        />
      ),
    },
    {
      key: "logo",
      header: "",
      className: "w-12",
      render: (a) => <AgencyLogo name={a.name} logoUrl={a.logoUrl} className="h-9 w-9 rounded-lg" initialsClassName="text-[12px]" />,
    },
    {
      key: "name",
      header: "Name",
      render: (a) => (
        <div className="min-w-0">
          <Link href={`/admin/agencies/${a.id}/edit`} className="font-medium text-text hover:text-primary-text">
            {a.name}
          </Link>
          <p className="text-[13px] text-text-muted">
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
          {a.verified && <span className="text-[13px] font-medium text-primary-text">✓ Verified</span>}
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (a) =>
        a.score == null ? (
          <span className="text-[13px] text-text-muted">—</span>
        ) : (
          <div className="flex flex-col items-start">
            <span className="num font-semibold text-text">{a.score.toFixed(1)}</span>
            <span className="text-[13px] text-text-muted">
              {a.scoreLabel === "Beta" ? "Public" : "New"}
              {a.knownInputs != null ? ` · ${a.knownInputs}/5 facts` : ""}
            </span>
          </div>
        ),
    },
    { key: "pricing", header: "Pricing", render: (a) => <span className="text-[13px]">{PRICING_TYPE_LABELS[a.pricingType]}</span> },
    {
      key: "packages",
      header: "Packages",
      render: (a) =>
        a.packageCount > 0 ? (
          a.packageCount
        ) : (
          <span className="text-[13px] font-medium text-danger">None</span>
        ),
    },
    { key: "fit", header: "Fit", render: (a) => <span className="text-[13px] text-text-muted">{a.fitForUs ?? "—"}</span> },
    {
      key: "checked",
      header: "Last checked",
      render: (a) => (
        <span className={a.lastCheckedOn ? "text-[13px]" : "text-[13px] text-danger"}>
          {a.lastCheckedOn ? formatDate(a.lastCheckedOn) : "Never"}
        </span>
      ),
    },
    { key: "updated", header: "Updated", render: (a) => <span className="text-[13px]">{formatDate(a.updatedAt)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Agencies"
        description={agencies.data ? `${agencies.data.total} matching` : "…"}
        actions={
          <>
            <button
              type="button"
              disabled={recomputing}
              onClick={handleRecompute}
              title={
                filters.city
                  ? `Recompute One Roof Scores for ${cityName(filters.city)}`
                  : "Recompute One Roof Scores for every active city"
              }
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-raised disabled:opacity-50"
            >
              {recomputing ? "Recomputing…" : filters.city ? "Recompute scores (city)" : "Recompute scores"}
            </button>
            {filters.city && (
              <button
                type="button"
                disabled={fetchingLogos}
                onClick={handleFetchLogos}
                title={`Fetch logos from the website for every ${cityName(filters.city)} agency that has none`}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-raised disabled:opacity-50"
              >
                {fetchingLogos ? "Queueing…" : "Fetch missing logos"}
              </button>
            )}
            <Link href="/admin/import" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-raised">
              Import CSV
            </Link>
            <Link href="/admin/agencies/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
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
          <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-raised">
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
              setQuery(new URLSearchParams());
            }}
            className="text-[13px] font-medium text-primary-text hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4">
        <ErrorBanner error={agencies.error} onRetry={agencies.reload} />
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-10 mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-surface px-4 py-2.5 shadow-card">
          <span className="text-sm font-semibold text-text">{selectedIds.length} selected</span>
          <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkSetStatus(selectedIds, "PUBLISHED")}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-50"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkSetStatus(selectedIds, "HIDDEN")}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-raised disabled:opacity-50"
          >
            Hide
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkSetStatus(selectedIds, "DRAFT")}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-raised disabled:opacity-50"
          >
            Move to draft
          </button>
          <button
            type="button"
            onClick={() => setSelection({ key: filterKey, ids: [] })}
            className="ml-auto text-[13px] font-medium text-text-muted hover:text-text"
          >
            Clear selection
          </button>
        </div>
      )}

      {bulkWarnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-text">
              {bulkWarnings.length} published agenc{bulkWarnings.length === 1 ? "y was" : "ies were"} flagged by the
              quality sheet. They are live now — hide any that shouldn&apos;t be.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => bulkSetStatus(bulkWarnings.map((w) => w.agencyId), "HIDDEN")}
                className={linkButton}
              >
                Hide all flagged
              </button>
              <button type="button" onClick={() => setBulkWarnings([])} className="text-[13px] font-medium text-text-muted hover:text-text">
                Dismiss
              </button>
            </div>
          </div>
          <ul className="mt-2 space-y-1.5">
            {bulkWarnings.map((w) => (
              <li key={w.agencyId} className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                <Link href={`/admin/agencies/${w.agencyId}/edit`} className="font-medium text-primary-text hover:underline">
                  {w.agencyName}
                </Link>
                <span className="text-text-muted">{w.message}</span>
                <button
                  type="button"
                  disabled={bulkBusy}
                  onClick={() => bulkSetStatus([w.agencyId], "HIDDEN")}
                  className={linkButton}
                >
                  Hide again
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        {!agencies.data ? (
          <p className="text-sm text-text-muted">Loading…</p>
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

function SavedFiltersAgenciesList() {
  const { ready, setQuery } = useSavedFilters("admin:agencies:filters");
  return ready ? <AgenciesList setQuery={setQuery} /> : <p className="text-sm text-text-muted">Loading…</p>;
}

export default function AdminAgenciesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-muted">Loading…</p>}>
      <SavedFiltersAgenciesList />
    </Suspense>
  );
}
