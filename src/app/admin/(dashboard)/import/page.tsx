"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { ImportReport } from "@/lib/api/types";
import { importAgenciesCsv, importAgencyQualityCsv, refreshPublic } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import StatCard from "@/components/admin/StatCard";
import { ErrorBanner, PageHeader, primaryButton } from "@/components/admin/ui";

const MAX_BYTES = 5 * 1024 * 1024;
const TOO_LARGE = "This file is over 5 MB. Split it into smaller files and upload them one at a time.";

export default function ImportPage() {
  return (
    <div>
      <PageHeader title="Import" description="Upload research spreadsheets saved as CSV (UTF-8, max 5 MB). Row 1 is the header." />

      <div className="mt-6 space-y-10">
        <CsvImporter
          id="agencies-csv"
          title="Agencies"
          description="Rows matching an existing agency update it; the rest create new agencies."
          upload={importAgenciesCsv}
          next={
            <p className="text-sm text-ink-soft">
              Next:{" "}
              <Link href="/admin/agencies?hasPackages=false" className="font-medium text-harbor hover:underline">
                add packages to agencies that need them
              </Link>{" "}
              and publish the ones that are ready.
            </p>
          }
        />

        <CsvImporter
          id="quality-csv"
          title="Agency quality sheet"
          description={
            <>
              Updates ratings, reviews, case studies, founded year and address on agencies that already exist (matched by City +
              Website, then City + Agency). It never creates agencies or publishes them. Each upload is a full snapshot: a blank
              cell clears that field. Rows with an exclude reason, or &ldquo;Site live&rdquo; = No, set the agency to{" "}
              <strong className="font-semibold text-ink">Hidden</strong>.
            </>
          }
          upload={importAgencyQualityCsv}
          hideCreated
          next={
            <p className="text-sm text-ink-soft">
              Check{" "}
              <Link href="/admin/agencies?status=HIDDEN" className="font-medium text-harbor hover:underline">
                hidden agencies
              </Link>{" "}
              to review any the sheet excluded.
            </p>
          }
        />
      </div>
    </div>
  );
}

function CsvImporter({
  id,
  title,
  description,
  upload,
  hideCreated = false,
  next,
}: {
  id: string;
  title: string;
  description: ReactNode;
  upload: (file: File) => Promise<ImportReport>;
  /** The quality import never creates rows, so its "Created" count is always 0. */
  hideCreated?: boolean;
  next?: ReactNode;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(TOO_LARGE);
      return;
    }
    setUploading(true);
    setError(null);
    setReport(null);
    try {
      setReport(await upload(file));
      void refreshPublic({ tags: ["cities"], allCities: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 413 ? TOO_LARGE : errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  const hiddenCount = report?.warnings.filter((w) => w.message.startsWith("Hidden:")).length ?? 0;

  return (
    <section>
      <h2 className="text-lg text-ink">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">{description}</p>

      <form onSubmit={handleUpload} className="mt-4 max-w-xl space-y-4 rounded-sm border border-mist bg-surface p-5">
        <div>
          <label htmlFor={id} className="text-sm font-medium text-ink">
            CSV file (max 5 MB)
          </label>
          <input
            id={id}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
            className="mt-2 block w-full text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-mist file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
          />
        </div>
        <ErrorBanner error={error} />
        <button type="submit" disabled={!file || uploading} className={primaryButton}>
          {uploading ? "Importing…" : "Upload and import"}
        </button>
      </form>

      {report && (
        <div className="mt-6 space-y-6">
          <div className={`grid gap-4 sm:max-w-xl ${hideCreated ? "grid-cols-2" : "grid-cols-3"}`}>
            {!hideCreated && <StatCard label="Created" value={report.created} />}
            <StatCard label="Updated" value={report.updated} />
            <StatCard label="Skipped" value={report.skipped} tone={report.skipped > 0 ? "warning" : "default"} />
          </div>
          {hideCreated && report.skipped > 0 && (
            <p className="text-[13px] text-ink-soft">Skipped rows were identical to what was already stored.</p>
          )}

          {report.errors.length > 0 && (
            <ReportTable
              title={`${report.errors.length} error${report.errors.length === 1 ? "" : "s"}`}
              tone="danger"
              rows={report.errors.map((e) => ({ row: e.row, text: e.reason }))}
            />
          )}
          {report.warnings.length > 0 && (
            <ReportTable
              title={`${report.warnings.length} warning${report.warnings.length === 1 ? "" : "s"}${
                hiddenCount > 0 ? ` · ${hiddenCount} agenc${hiddenCount === 1 ? "y" : "ies"} hidden` : ""
              }`}
              tone="warning"
              rows={report.warnings.map((w) => ({ row: w.row, text: w.message }))}
            />
          )}

          {next}
        </div>
      )}
    </section>
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
    <div className="rounded-sm border border-mist bg-surface">
      <h3 className={`border-b border-mist px-4 py-3 text-sm font-bold ${tone === "danger" ? "text-danger" : "text-ink"}`}>
        {title}
      </h3>
      <ul className="max-h-96 divide-y divide-mist overflow-auto">
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
