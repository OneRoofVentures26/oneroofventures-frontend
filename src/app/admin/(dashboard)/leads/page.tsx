"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminLeadFilters, EmailStatus, LeadResponse, LeadStatus } from "@/lib/api/types";
import { listCities, listLeads, resendLead, resetLeadRateLimit, updateLeadStatus } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { cn, formatDateTime, formatINR } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { ErrorBanner, linkButton, PageHeader, Pager, RefreshButton, selectClass, StatusBadge } from "@/components/admin/ui";

const PAGE_SIZE = 20;
const LEAD_STATUSES: LeadStatus[] = ["NEW", "SENT", "CONTACTED", "CLOSED", "SPAM"];

const EMAIL_STATUS: Record<EmailStatus | "PENDING", { label: string; className: string }> = {
  SENT: { label: "Email sent", className: "text-harbor-dark" },
  FAILED: { label: "Email failed", className: "text-danger" },
  NO_EMAIL: { label: "No email on file", className: "text-danger" },
  PENDING: { label: "Sending…", className: "text-ink-soft" },
};

function readFilters(sp: URLSearchParams): AdminLeadFilters {
  return {
    status: (sp.get("status") as LeadStatus) || undefined,
    city: sp.get("city") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    page: Number(sp.get("page")) || 0,
    size: PAGE_SIZE,
  };
}

function LeadsInbox() {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const filterKey = searchParams.toString();
  const leads = useAsync(() => listLeads(filters), filterKey);
  const cities = useAsync(listCities);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  function setFilter(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`);
  }

  function replaceLead(updated: LeadResponse) {
    leads.setData((prev) =>
      prev ? { ...prev, items: prev.items.map((l) => (l.id === updated.id ? updated : l)) } : prev!,
    );
  }

  async function changeStatus(lead: LeadResponse, status: LeadStatus) {
    setBusy(lead.id);
    try {
      replaceLead(await updateLeadStatus(lead.id, status));
      toast.show(`Lead #${lead.id} marked ${status.toLowerCase()}`);
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  async function resend(lead: LeadResponse) {
    setBusy(lead.id);
    try {
      await resendLead(lead.id);
      toast.show("Emails are being re-sent. Refresh in a minute to see the result.");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  async function unblock(lead: LeadResponse) {
    if (!lead.ipAddress) return;
    setBusy(lead.id);
    try {
      const res = await resetLeadRateLimit(lead.ipAddress);
      toast.show(res.wasTracked ? `${res.ip} can send quote requests again` : `${res.ip} wasn't rate limited`);
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description={leads.data ? `${leads.data.total} quote request${leads.data.total === 1 ? "" : "s"}` : "…"}
      />

      <div className="mt-5 flex flex-wrap items-end gap-2">
        <select value={filters.status ?? ""} onChange={(e) => setFilter({ status: e.target.value })} className={selectClass}>
          <option value="">Any status</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select value={filters.city ?? ""} onChange={(e) => setFilter({ city: e.target.value })} className={selectClass}>
          <option value="">All cities</option>
          {cities.data?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="text-xs text-ink-soft">
          From
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => setFilter({ from: e.target.value })}
            className={cn(selectClass, "ml-1")}
          />
        </label>
        <label className="text-xs text-ink-soft">
          To
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => setFilter({ to: e.target.value })}
            className={cn(selectClass, "ml-1")}
          />
        </label>
        {filterKey && (
          <button type="button" onClick={() => router.replace(pathname)} className="pb-2 text-xs font-medium text-harbor hover:underline">
            Clear filters
          </button>
        )}
        <RefreshButton onRefresh={leads.reload} loading={leads.loading} label="leads" className="ml-auto" />
      </div>

      <div className="mt-4">
        <ErrorBanner error={leads.error} onRetry={leads.reload} />
      </div>

      <div className={cn("mt-4", leads.loading && leads.data && "opacity-60 transition")}>
        {!leads.data ? (
          !leads.error && <p className="text-sm text-ink-soft">Loading…</p>
        ) : leads.data.items.length === 0 ? (
          <p className="rounded-sm border border-dashed border-mist p-8 text-center text-sm text-ink-soft">
            No quote requests match these filters.
          </p>
        ) : (
          <ul className="space-y-3">
            {leads.data.items.map((lead) => {
              const open = expanded === lead.id;
              const failed = lead.routedAgencies.some((r) => r.emailStatus === "FAILED");
              return (
                <li key={lead.id} className="rounded-sm border border-mist bg-surface">
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {lead.name}
                        {lead.businessName && <span className="font-normal text-ink-soft"> · {lead.businessName}</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        <a href={`tel:${lead.phone}`} className="hover:text-harbor">
                          {lead.phone}
                        </a>
                        {lead.email && (
                          <>
                            {" · "}
                            <a href={`mailto:${lead.email}`} className="hover:text-harbor">
                              {lead.email}
                            </a>
                          </>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-ink-soft">
                        <span className="font-medium text-ink">{lead.serviceSlug}</span> · {lead.citySlug}
                        {lead.localitySlug ? ` / ${lead.localitySlug}` : ""}
                        {lead.budgetMonthly != null ? ` · ${formatINR(lead.budgetMonthly)}/mo` : ""} ·{" "}
                        {formatDateTime(lead.createdAt)}
                      </p>
                      <p className={cn("mt-1 text-xs", lead.routedAgencies.length === 0 ? "text-danger" : "text-ink-soft")}>
                        {lead.routedAgencies.length === 0
                          ? "Not routed to any agency yet"
                          : `Sent to ${lead.routedAgencies.map((r) => r.agencyName).join(", ")}`}
                        {failed && <span className="ml-1 font-medium text-danger">· some emails failed</span>}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <StatusBadge status={lead.status} />
                      <select
                        value={lead.status}
                        disabled={busy === lead.id}
                        onChange={(e) => changeStatus(lead, e.target.value as LeadStatus)}
                        className="rounded-sm border border-mist bg-surface px-2 py-1 text-xs outline-none focus:border-harbor"
                        aria-label="Change status"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setExpanded(open ? null : lead.id)} className={linkButton}>
                        {open ? "Hide" : "Details"}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="space-y-4 border-t border-mist p-4 text-sm">
                      {lead.message && (
                        <div>
                          <p className="text-xs font-semibold text-ink-soft">Message</p>
                          <p className="mt-1 whitespace-pre-wrap text-ink">{lead.message}</p>
                        </div>
                      )}
                      <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        {(
                          [
                            ["Lead", `#${lead.id}`],
                            ["Business type", lead.businessType],
                            [
                              "Chosen by client",
                              lead.chosenAgencyId != null ? (
                                <Link href={`/admin/agencies/${lead.chosenAgencyId}/edit`} className="text-harbor hover:underline">
                                  {lead.routedAgencies.find((r) => r.agencyId === lead.chosenAgencyId)?.agencyName ??
                                    `Agency #${lead.chosenAgencyId}`}
                                </Link>
                              ) : lead.routedAgencies.length > 0 ? (
                                "Matched by OneRoof"
                              ) : null,
                            ],
                            ["Package", lead.packageId != null ? `#${lead.packageId}` : null],
                          ] as const
                        ).map(([k, v]) => (
                          <div key={k}>
                            <dt className="font-semibold text-ink-soft">{k}</dt>
                            <dd className="mt-0.5 text-ink">{v ?? "—"}</dd>
                          </div>
                        ))}
                      </dl>

                      <div>
                        <p className="text-xs font-semibold text-ink-soft">Routed agencies</p>
                        {lead.routedAgencies.length === 0 ? (
                          <p className="mt-1 text-xs text-ink-soft">None — match this lead by hand or contact the client directly.</p>
                        ) : (
                          <ul className="mt-1 divide-y divide-mist rounded-sm border border-mist">
                            {lead.routedAgencies.map((r) => {
                              const s = EMAIL_STATUS[r.emailStatus ?? "PENDING"];
                              return (
                                <li key={r.agencyId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                                  <span className="font-medium text-ink">
                                    <Link href={`/admin/agencies/${r.agencyId}/edit`} className="hover:text-harbor">
                                      {r.agencyName}
                                    </Link>
                                    {r.agencyEmail && <span className="font-normal text-ink-soft"> · {r.agencyEmail}</span>}
                                  </span>
                                  <span className={s.className}>
                                    {s.label}
                                    {r.sentAt ? ` · ${formatDateTime(r.sentAt)}` : ""}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>

                      <p className="break-all text-xs text-ink-soft">
                        IP {lead.ipAddress ?? "unknown"}
                        {lead.userAgent ? ` · ${lead.userAgent}` : ""}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        {lead.routedAgencies.length > 0 && (
                          <button type="button" disabled={busy === lead.id} onClick={() => resend(lead)} className={linkButton}>
                            Re-send emails
                          </button>
                        )}
                        {lead.ipAddress && (
                          <button type="button" disabled={busy === lead.id} onClick={() => unblock(lead)} className={linkButton}>
                            Reset quote limit for this IP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {leads.data && leads.data.total > 0 && (
          <Pager
            page={leads.data.page}
            size={PAGE_SIZE}
            total={leads.data.total}
            onPageChange={(page) => setFilter({ page: page > 0 ? String(page) : undefined })}
          />
        )}
      </div>

      <RateLimitReset />
    </div>
  );
}

function RateLimitReset() {
  const toast = useToast();
  const [ip, setIp] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ip.trim()) return;
    setBusy(true);
    try {
      const res = await resetLeadRateLimit(ip.trim());
      toast.show(res.wasTracked ? `${res.ip} can send quote requests again` : `${res.ip} wasn't rate limited`);
      setIp("");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-xl rounded-sm border border-mist bg-surface p-5">
      <h2 className="text-sm font-bold text-ink">Unblock an IP</h2>
      <p className="mt-1 text-xs text-ink-soft">
        Visitors can send 5 quote requests per hour. Reset the counter for someone who hit the limit.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="e.g. 1.2.3.4"
          className={cn(selectClass, "min-w-0 flex-1")}
        />
        <button type="submit" disabled={busy || !ip.trim()} className="rounded-sm bg-harbor px-4 py-2 text-sm font-semibold text-paper hover:bg-harbor-dark disabled:opacity-50">
          Reset
        </button>
      </div>
    </form>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-soft">Loading…</p>}>
      <LeadsInbox />
    </Suspense>
  );
}
