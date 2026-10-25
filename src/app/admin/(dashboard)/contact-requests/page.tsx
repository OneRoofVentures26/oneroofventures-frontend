"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AdminContactFilters, ContactRequestResponse, ContactStatus } from "@/lib/api/types";
import { listContactRequests, resetContactRateLimit, updateContactRequestStatus } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { useSavedFilters } from "@/lib/use-saved-filters";
import { cn, formatDateTime, formatINR } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { ErrorBanner, linkButton, PageHeader, Pager, RefreshButton, selectClass, StatusBadge } from "@/components/admin/ui";

const PAGE_SIZE = 20;
const STATUSES: ContactStatus[] = ["NEW", "CONTACTED", "CLOSED", "SPAM"];

function readFilters(sp: URLSearchParams): AdminContactFilters {
  return {
    status: (sp.get("status") as ContactStatus) || undefined,
    page: Number(sp.get("page")) || 0,
    size: PAGE_SIZE,
  };
}

function label(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function ContactInbox({ setQuery }: { setQuery: (next: URLSearchParams) => void }) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const requests = useAsync(() => listContactRequests(filters), searchParams.toString());
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  function setFilter(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    setQuery(next);
  }

  async function changeStatus(req: ContactRequestResponse, status: ContactStatus) {
    setBusy(req.id);
    try {
      const updated = await updateContactRequestStatus(req.id, status);
      requests.setData((prev) =>
        prev ? { ...prev, items: prev.items.map((r) => (r.id === updated.id ? updated : r)) } : prev!,
      );
      toast.show(`Message from ${req.name} marked ${status.toLowerCase()}`);
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  async function unblock(req: ContactRequestResponse) {
    if (!req.ipAddress) return;
    setBusy(req.id);
    try {
      const res = await resetContactRateLimit(req.ipAddress);
      toast.show(res.wasTracked ? `${res.ip} can send messages again` : `${res.ip} wasn't rate limited`);
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  const tabs: Array<{ value: ContactStatus | undefined; label: string }> = [
    { value: undefined, label: "All" },
    ...STATUSES.map((s) => ({ value: s, label: label(s) })),
  ];

  return (
    <div>
      <PageHeader
        title="Contact requests"
        description={
          requests.data
            ? `${requests.data.total} message${requests.data.total === 1 ? "" : "s"} from the Contact us form · not emailed, so check here`
            : "…"
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-border">
        {tabs.map((t) => {
          const active = filters.status === t.value;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setFilter({ status: t.value })}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition",
                active ? "border-accent text-text" : "border-transparent text-text-muted hover:text-text",
              )}
            >
              {t.label}
            </button>
          );
        })}
        <RefreshButton onRefresh={requests.reload} loading={requests.loading} label="contact requests" className="mb-1 ml-auto" />
      </div>

      <div className="mt-4">
        <ErrorBanner error={requests.error} onRetry={requests.reload} />
      </div>

      <div className={cn("mt-4", requests.loading && requests.data && "opacity-60 transition")}>
        {!requests.data ? (
          !requests.error && <p className="text-sm text-text-muted">Loading…</p>
        ) : requests.data.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-muted">
            No messages{filters.status ? ` marked ${filters.status.toLowerCase()}` : " yet"}.
          </p>
        ) : (
          <ul className="space-y-3">
            {requests.data.items.map((req) => {
              const open = expanded === req.id;
              return (
                <li key={req.id} className="rounded-lg border border-border bg-surface">
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text">
                        {req.name}
                        {req.businessName && <span className="font-normal text-text-muted"> · {req.businessName}</span>}
                      </p>
                      <p className="mt-0.5 text-[13px] text-text-muted">
                        <a href={`tel:+91${req.phone}`} className="hover:text-primary-text">
                          {req.phone}
                        </a>
                        {" · "}
                        <a href={`mailto:${req.email}`} className="hover:text-primary-text">
                          {req.email}
                        </a>
                      </p>
                      <p className="mt-1 text-[13px] text-text-muted">
                        {req.servicesNeeded.length > 0 && (
                          <span className="font-medium text-text">{req.servicesNeeded.join(", ")} · </span>
                        )}
                        {req.monthlyBudget != null ? `${formatINR(req.monthlyBudget)}/mo · ` : ""}
                        {formatDateTime(req.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <StatusBadge status={req.status} />
                      <select
                        value={req.status}
                        disabled={busy === req.id}
                        onChange={(e) => changeStatus(req, e.target.value as ContactStatus)}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-[13px] outline-none focus:border-primary"
                        aria-label="Change status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {label(s)}
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setExpanded(open ? null : req.id)} className={linkButton}>
                        {open ? "Hide" : "Details"}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="space-y-4 border-t border-border p-4 text-sm">
                      <div>
                        <p className="text-[13px] font-semibold text-text-muted">About them</p>
                        <p className={cn("mt-1 whitespace-pre-wrap", req.aboutYou ? "text-text" : "text-text-muted")}>
                          {req.aboutYou ?? "Nothing written."}
                        </p>
                      </div>
                      <p className="break-all text-[13px] text-text-muted">
                        Message #{req.id} · IP {req.ipAddress ?? "unknown"}
                        {req.userAgent ? ` · ${req.userAgent}` : ""}
                      </p>
                      {req.ipAddress && (
                        <button type="button" disabled={busy === req.id} onClick={() => unblock(req)} className={linkButton}>
                          Reset contact form limit for this IP
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {requests.data && requests.data.total > 0 && (
          <Pager
            page={requests.data.page}
            size={PAGE_SIZE}
            total={requests.data.total}
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
      const res = await resetContactRateLimit(ip.trim());
      toast.show(res.wasTracked ? `${res.ip} can send messages again` : `${res.ip} wasn't rate limited`);
      setIp("");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-xl rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-bold text-text">Unblock an IP</h2>
      <p className="mt-1 text-[13px] text-text-muted">
        Visitors can send 5 contact messages per hour (separate from the quote request limit). Reset the counter for
        someone who hit it.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="e.g. 1.2.3.4"
          className={cn(selectClass, "min-w-0 flex-1")}
        />
        <button type="submit" disabled={busy || !ip.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:opacity-50">
          Reset
        </button>
      </div>
    </form>
  );
}

export default function AdminContactRequestsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-muted">Loading…</p>}>
      <SavedFiltersContactInbox />
    </Suspense>
  );
}

function SavedFiltersContactInbox() {
  const { ready, setQuery } = useSavedFilters("admin:contact-requests:filters");
  return ready ? <ContactInbox setQuery={setQuery} /> : <p className="text-sm text-text-muted">Loading…</p>;
}
