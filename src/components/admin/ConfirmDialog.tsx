"use client";

import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-xl">
        <h2 className="text-base font-bold text-text">{title}</h2>
        <p className="mt-2 text-sm text-text-muted">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-raised"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-primary-fg transition",
              danger ? "bg-danger hover:bg-danger/90" : "bg-primary hover:bg-primary-hover",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
