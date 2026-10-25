"use client";

import { useRef, useState } from "react";
import type { AgencyResponse } from "@/lib/api/types";
import { agencyTags, deleteAgencyLogo, fetchAgencyLogo, refreshPublic, uploadAgencyLogo } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { formatDateTime } from "@/lib/utils";
import AgencyLogo from "@/components/AgencyLogo";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { secondaryButton } from "@/components/admin/ui";

export type LogoFields = Pick<AgencyResponse, "logoUrl" | "logoSource" | "logoCheckedAt">;

const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/gif,.ico";
const MAX_BYTES = 500 * 1024;

/**
 * Agency logo on the edit page: what's stored, where it came from, and fetch /
 * upload / remove. Reports only the logo fields back, so the agency form below
 * keeps any unsaved edits.
 */
export default function AgencyLogoCard({
  agency,
  onChange,
}: {
  agency: AgencyResponse;
  onChange: (logo: LogoFields) => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"fetch" | "upload" | "remove" | null>(null);
  const [confirm, setConfirm] = useState<"replace" | "remove" | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  function applied(updated: LogoFields, message: string) {
    onChange({ logoUrl: updated.logoUrl, logoSource: updated.logoSource, logoCheckedAt: updated.logoCheckedAt });
    void refreshPublic({ tags: agencyTags(agency, agency) });
    toast.show(message);
  }

  async function handleFetch(force = false) {
    setConfirm(null);
    setBusy("fetch");
    try {
      const updated = await fetchAgencyLogo(agency.id, force);
      if (updated.logoUrl && updated.logoUrl !== agency.logoUrl) {
        applied(updated, "Logo fetched from the website");
      } else {
        // Nothing usable found: only logoCheckedAt changed.
        onChange({ logoUrl: updated.logoUrl, logoSource: updated.logoSource, logoCheckedAt: updated.logoCheckedAt });
        toast.show(updated.logoUrl ? "Logo is already up to date" : "No usable logo found on the website", "error");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setConfirm("replace");
      else toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  async function handleUpload(file: File) {
    setFileError(null);
    if (file.size > MAX_BYTES) {
      setFileError(`That file is ${Math.round(file.size / 1024)} KB; logos must be under 500 KB.`);
      return;
    }
    setBusy("upload");
    try {
      applied(await uploadAgencyLogo(agency.id, file), "Logo uploaded");
    } catch (err) {
      if (err instanceof ApiError && err.fields.file) setFileError(err.fields.file);
      else toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    setConfirm(null);
    setBusy("remove");
    try {
      await deleteAgencyLogo(agency.id);
      applied({ logoUrl: null, logoSource: null, logoCheckedAt: agency.logoCheckedAt }, "Logo removed");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start gap-4">
        <AgencyLogo
          name={agency.name}
          logoUrl={agency.logoUrl}
          className="h-20 w-20 rounded-2xl"
          initialsClassName="text-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg text-text">Logo</h2>
            {agency.logoSource && (
              <span className="rounded-lg bg-surface-raised px-2 py-0.5 text-[12px] font-semibold text-text-muted">
                {agency.logoSource === "MANUAL" ? "Uploaded" : "Auto"}
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-text-muted">
            {agency.logoUrl ? "" : "No logo yet — initials are shown on the site. "}
            Last checked {agency.logoCheckedAt ? formatDateTime(agency.logoCheckedAt) : "never"}
            {agency.logoSource === "MANUAL" && " · uploaded logos are never replaced automatically"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null || !agency.website}
              onClick={() => handleFetch()}
              title={agency.website ? undefined : "Add a website first"}
              className={secondaryButton}
            >
              {busy === "fetch" ? "Fetching…" : "Fetch from website"}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => fileRef.current?.click()}
              className={secondaryButton}
            >
              {busy === "upload" ? "Uploading…" : "Upload"}
            </button>
            {agency.logoUrl && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setConfirm("remove")}
                className="rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
              >
                {busy === "remove" ? "Removing…" : "Remove"}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
          </div>
          {fileError ? (
            <p className="mt-2 text-[13px] text-danger">{fileError}</p>
          ) : (
            <p className="mt-2 text-[13px] text-text-muted">
              PNG, JPEG, WebP, SVG, ICO or GIF, under 500 KB. PNG, JPEG and GIF need to be at least 48×48 px.
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm === "replace"}
        title="Replace the uploaded logo?"
        description="This logo was uploaded by hand. Fetching from the website will replace it if a usable logo is found."
        confirmLabel="Replace"
        onConfirm={() => handleFetch(true)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "remove"}
        title="Remove logo?"
        description="The site will show the agency's initials instead."
        confirmLabel="Remove"
        danger
        onConfirm={handleRemove}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
