"use client";

import type { ReactNode } from "react";
import type { AgencyStatus, LeadStatus } from "@/lib/api/types";
import { errorMessage } from "@/lib/api/http";
import { cn } from "@/lib/utils";

export const inputClass =
  "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent disabled:bg-muted disabled:text-ink-soft";

export const selectClass =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export const primaryButton =
  "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

export const linkButton = "text-xs font-medium text-accent hover:underline disabled:opacity-50";
export const dangerLinkButton = "text-xs font-medium text-danger hover:underline disabled:opacity-50";

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
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (!error) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
      <span>{typeof error === "string" ? error : errorMessage(error)}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium underline">
          Retry
        </button>
      )}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="text-sm text-ink-soft">{label}</p>;
}

const AGENCY_STATUS_STYLES: Record<AgencyStatus, string> = {
  PUBLISHED: "bg-accent-light text-accent-dark",
  DRAFT: "bg-muted text-ink-soft",
  HIDDEN: "bg-gold-light text-gold",
};

const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-gold-light text-gold",
  SENT: "bg-accent-light text-accent-dark",
  CONTACTED: "bg-accent-light text-accent-dark",
  CLOSED: "bg-muted text-ink-soft",
  SPAM: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: AgencyStatus | LeadStatus }) {
  const style =
    (AGENCY_STATUS_STYLES as Record<string, string>)[status] ?? (LEAD_STATUS_STYLES as Record<string, string>)[status];
  return (
    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", style)}>
      {status.toLowerCase()}
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
      <p className="text-xs text-ink-soft">
        Page {Math.min(page + 1, totalPages)} of {totalPages} · {total} total
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40"
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
