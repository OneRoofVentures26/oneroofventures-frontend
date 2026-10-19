"use client";

import type { ReactNode } from "react";
import type { AgencyStatus, LeadStatus } from "@/lib/api/types";
import { errorMessage } from "@/lib/api/http";
import { cn, sentenceCase } from "@/lib/utils";

export const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-4 focus:ring-ring/15 disabled:bg-surface-raised disabled:text-text-muted";

export const selectClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-4 focus:ring-ring/15";

export const primaryButton =
  "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-text transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

export const linkButton = "text-[13px] font-medium text-primary-text hover:underline disabled:opacity-50";
export const dangerLinkButton = "text-[13px] font-medium text-danger hover:underline disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[13px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[13px] text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl text-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (!error) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
      <span>{typeof error === "string" ? error : errorMessage(error)}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="-my-2 inline-flex min-h-11 items-center px-1 font-medium underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="text-sm text-text-muted">{label}</p>;
}

const AGENCY_STATUS_STYLES: Record<AgencyStatus, string> = {
  PUBLISHED: "bg-primary/10 text-primary-text",
  DRAFT: "bg-surface-raised text-text-muted",
  HIDDEN: "bg-border text-text-muted",
};

const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-primary text-primary-fg",
  SENT: "bg-primary/10 text-primary-text",
  CONTACTED: "bg-primary/10 text-primary-text",
  CLOSED: "bg-surface-raised text-text-muted",
  SPAM: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: AgencyStatus | LeadStatus }) {
  const style =
    (AGENCY_STATUS_STYLES as Record<string, string>)[status] ?? (LEAD_STATUS_STYLES as Record<string, string>)[status];
  return (
    <span className={cn("inline-block rounded-lg px-2 py-0.5 text-[13px] font-semibold", style)}>
      {sentenceCase(status)}
    </span>
  );
}

export function Pager({
  page,
  size,
  total,
  onPageChange,
}: {
  page: number;
  size: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-[13px] text-text-muted">
        Page {Math.min(page + 1, totalPages)} of {totalPages} · {total} total
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-primary px-3 py-1.5 text-[13px] font-medium text-primary-text hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-primary px-3 py-1.5 text-[13px] font-medium text-primary-text hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/** Empty string → null, for the backend's optional text fields. */
export function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Small icon button that re-fetches one table's data in place (no page reload).
 * Pass the `reload` and `loading` from that table's `useAsync`.
 */
export function RefreshButton({
  onRefresh,
  loading = false,
  label = "table",
  className,
}: {
  onRefresh: () => void;
  loading?: boolean;
  /** What is being refreshed, for the accessible name, e.g. "agencies". */
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      aria-label={`Refresh ${label}`}
      title={`Refresh ${label}`}
      className={cn(
        "inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition-colors duration-200 hover:border-primary/40 hover:text-primary-text disabled:cursor-wait lg:h-9 lg:w-9",
        className,
      )}
    >
      <svg
        viewBox="0 0 20 20"
        className={cn("h-4 w-4", loading && "animate-spin")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6" />
        <path d="M16.5 3.5v3.6h-3.6" />
      </svg>
      <span className="sr-only" aria-live="polite">
        {loading ? "Refreshing" : ""}
      </span>
    </button>
  );
}
