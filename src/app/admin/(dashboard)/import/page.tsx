"use client";

import { useState } from "react";
import Link from "next/link";
import type { ImportReport } from "@/lib/api/types";
import { importAgenciesCsv } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import StatCard from "@/components/admin/StatCard";
import { ErrorBanner, PageHeader, primaryButton } from "@/components/admin/ui";

const MAX_BYTES = 5 * 1024 * 1024;

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("This file is over 5 MB. Split it into smaller files and upload them one at a time.");
      return;
    }
    setUploading(true);
    setError(null);
    setReport(null);
    try {
      setReport(await importAgenciesCsv(file));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 413
          ? "This file is over 5 MB. Split it into smaller files and upload them one at a time."
          : errorMessage(err),
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Import agencies"
        description="Upload the research spreadsheet saved as CSV. Rows matching an existing agency update it; the rest create new agencies."
      />

      <form onSubmit={handleUpload} className="mt-6 max-w-xl space-y-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <label htmlFor="csv" className="text-sm font-medium text-ink">
            CSV file (max 5 MB)
          </label>
          <input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
            className="mt-2 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
          />
        </div>
        <ErrorBanner error={error} />
        <button type="submit" disabled={!file || uploading} className={primaryButton}>
          {uploading ? "Importing…" : "Upload and import"}
        </button>
      </form>

      {report && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-3 gap-4 sm:max-w-xl">
            <StatCard label="Created" value={report.created} />
            <StatCard label="Updated" value={report.updated} />
            <StatCard label="Skipped" value={report.skipped} tone={report.skipped > 0 ? "warning" : "default"} />
          </div>

          {report.errors.length > 0 && (
            <ReportTable
              title={`${report.errors.length} error${report.errors.length === 1 ? "" : "s"}`}
              tone="danger"
              rows={report.errors.map((e) => ({ row: e.row, text: e.reason }))}
            />
          )}
          {report.warnings.length > 0 && (
            <ReportTable
              title={`${report.warnings.length} warning${report.warnings.length === 1 ? "" : "s"}`}
              tone="warning"
              rows={report.warnings.map((w) => ({ row: w.row, text: w.message }))}
            />
          )}

          <p className="text-sm text-ink-soft">
            Next:{" "}
            <Link href="/admin/agencies?hasPackages=false" className="font-medium text-accent hover:underline">
              add packages to agencies that need them
            </Link>{" "}
            and publish the ones that are ready.
          </p>
        </div>
      )}
    </div>
  );
}

function ReportTable({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "danger" | "warning";
  rows: Array<{ row: number; text: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <h2 className={`border-b border-border px-4 py-3 text-sm font-bold ${tone === "danger" ? "text-danger" : "text-gold"}`}>
        {title}
      </h2>
      <ul className="max-h-96 divide-y divide-border overflow-auto">
        {rows.map((r, i) => (
          <li key={i} className="flex gap-4 px-4 py-2 text-sm">
            <span className="w-16 flex-shrink-0 text-ink-soft">Row {r.row}</span>
            <span className="text-ink">{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
