"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AgencyRequest, AgencyStatus } from "@/lib/api/types";
import { agencyTags, getAgency, listCities, listServices, patchAgency, refreshPublic, updateAgency } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import AgencyForm from "@/components/admin/AgencyForm";
import PackagesManager from "@/components/admin/PackagesManager";
import AgencyScoreCard from "@/components/admin/AgencyScoreCard";
import AgencyLogoCard from "@/components/admin/AgencyLogoCard";
import { ErrorBanner, Loading, PageHeader, primaryButton, secondaryButton, StatusBadge } from "@/components/admin/ui";

/** The backend rescores a few seconds after a change; a save's response still has the old score. */
const RESCORE_DELAY_MS = 4000;

function todayInIndia(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export default function EditAgencyPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const toast = useToast();
  const agency = useAsync(() => getAgency(id), params.id);
  const options = useAsync(() => Promise.all([listCities(), listServices()]));
  const [marking, setMarking] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const rescoreTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(rescoreTimer.current), []);

  /**
   * Once the backend has rescored: re-fetch here, and refresh the public pages
   * again (the refresh right after saving still cached the old score).
   */
  function refreshScoreSoon() {
    window.clearTimeout(rescoreTimer.current);
    rescoreTimer.current = window.setTimeout(() => {
      agency.reload();
      void refreshPublic({ agencyIds: [id] });
    }, RESCORE_DELAY_MS);
  }

  async function markCheckedToday() {
    setMarking(true);
    try {
      const updated = await patchAgency(id, { lastCheckedOn: todayInIndia() });
      void refreshPublic({ tags: agencyTags(agency.data ?? null, updated) });
      agency.setData(() => updated);
      refreshScoreSoon();
      toast.show("Marked as checked today");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setMarking(false);
    }
  }

  async function changeStatus(status: AgencyStatus, label: string) {
    setPublishing(true);
    try {
      const updated = await patchAgency(id, { status });
      void refreshPublic({ tags: agencyTags(agency.data ?? null, updated) });
      agency.setData(() => updated);
      refreshScoreSoon();
      toast.show(`${updated.name} ${label}`);
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setPublishing(false);
    }
  }

  async function handleSubmit(input: AgencyRequest) {
    const updated = await updateAgency(id, input);
    void refreshPublic({ tags: agencyTags(agency.data ?? null, updated) });
    agency.setData(() => updated);
    refreshScoreSoon();
    toast.show(`${updated.name} saved`);
  }

  if (agency.error instanceof ApiError && agency.error.status === 404) {
    return (
      <div>
        <h1 className="text-xl font-bold text-text">Agency not found</h1>
        <p className="mt-1 text-sm text-text-muted">This agency may have already been deleted.</p>
        <Link href="/admin/agencies" className="mt-4 inline-block text-sm font-medium text-primary-text hover:underline">
          ← Back to agencies
        </Link>
      </div>
    );
  }

  const a = agency.data;

  return (
    <div>
      <Link href="/admin/agencies" className="text-sm font-medium text-text-muted hover:text-primary-text">
        ← Agencies
      </Link>
      <div className="mt-2">
        <PageHeader
          title={a ? `Edit ${a.name}` : "Edit agency"}
          description={
            a && (
              <span className="flex flex-wrap items-center gap-2">
                <StatusBadge status={a.status} />
                {a.status === "PUBLISHED" && (
                  <a
                    href={`/${a.citySlug}/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-text hover:underline"
                  >
                    View on site ↗
                  </a>
                )}
                <span className="text-text-muted">
                  · Last checked {a.lastCheckedOn ? formatDate(a.lastCheckedOn) : "never"}
                </span>
              </span>
            )
          }
          actions={
            a && (
              <>
                <button type="button" disabled={marking} onClick={markCheckedToday} className={secondaryButton}>
                  {marking ? "Saving…" : "Mark checked today"}
                </button>
                {a.status === "PUBLISHED" ? (
                  <button
                    type="button"
                    disabled={publishing}
                    onClick={() => changeStatus("HIDDEN", "hidden")}
                    className={secondaryButton}
                  >
                    {publishing ? "Hiding…" : "Hide from site"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={publishing}
                    onClick={() => changeStatus("PUBLISHED", "published")}
                    title="Publishes the last saved version. Save any changes first."
                    className={primaryButton}
                  >
                    {publishing ? "Publishing…" : "Publish"}
                  </button>
                )}
              </>
            )
          }
        />
      </div>

      <div className="mt-6 max-w-3xl space-y-6">
        <ErrorBanner error={agency.error ?? options.error} onRetry={() => (agency.error ? agency.reload() : options.reload())} />
        {!a || !options.data ? (
          !agency.error && !options.error && <Loading />
        ) : (
          <>
            <AgencyLogoCard agency={a} onChange={(logo) => agency.setData((prev) => ({ ...prev!, ...logo }))} />
            <AgencyScoreCard agency={a} />
            {/* Remount the form when the saved record changes so it shows server-normalised values. */}
            <AgencyForm
              key={a.updatedAt}
              initialData={a}
              cities={options.data[0]}
              services={options.data[1]}
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
            />
            <PackagesManager
              agencyId={a.id}
              services={options.data[1]}
              onChanged={() => {
                agency.reload();
                refreshScoreSoon();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
