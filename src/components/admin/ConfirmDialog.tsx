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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-sm border border-mist bg-surface p-6 shadow-xl">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-soft">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm border border-mist px-4 py-2 text-sm font-medium text-ink transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-sm px-4 py-2 text-sm font-semibold text-paper transition",
              danger ? "bg-danger hover:bg-danger/90" : "bg-harbor hover:bg-harbor-dark",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
