"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AgencyRequest } from "@/lib/api/types";
import { getAgency, listCities, listServices, patchAgency, updateAgency } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import AgencyForm from "@/components/admin/AgencyForm";
import PackagesManager from "@/components/admin/PackagesManager";
import { ErrorBanner, Loading, PageHeader, secondaryButton, StatusBadge } from "@/components/admin/ui";

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

  async function markCheckedToday() {
    setMarking(true);
    try {
      const updated = await patchAgency(id, { lastCheckedOn: todayInIndia() });
      agency.setData(() => updated);
      toast.show("Marked as checked today");
    } catch (err) {
      toast.show(errorMessage(err), "error");
    } finally {
      setMarking(false);
    }
  }

  async function handleSubmit(input: AgencyRequest) {
    const updated = await updateAgency(id, input);
    agency.setData(() => updated);
    toast.show(`${updated.name} saved`);
  }

  if (agency.error instanceof ApiError && agency.error.status === 404) {
    return (
      <div>
        <h1 className="text-xl font-bold text-ink">Agency not found</h1>
        <p className="mt-1 text-sm text-ink-soft">This agency may have already been deleted.</p>
        <Link href="/admin/agencies" className="mt-4 inline-block text-sm font-medium text-harbor hover:underline">
          ← Back to agencies
        </Link>
      </div>
    );
  }

  const a = agency.data;

  return (
    <div>
      <Link href="/admin/agencies" className="text-sm font-medium text-ink-soft hover:text-harbor">
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
                    className="text-harbor hover:underline"
                  >
                    View on site ↗
                  </a>
                )}
                <span className="text-ink-soft">
                  · Last checked {a.lastCheckedOn ? formatDate(a.lastCheckedOn) : "never"}
                </span>
              </span>
            )
          }
          actions={
            a && (
              <button type="button" disabled={marking} onClick={markCheckedToday} className={secondaryButton}>
                {marking ? "Saving…" : "Mark checked today"}
              </button>
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
            {/* Remount the form when the saved record changes so it shows server-normalised values. */}
            <AgencyForm
              key={a.updatedAt}
              initialData={a}
              cities={options.data[0]}
              services={options.data[1]}
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
            />
            <PackagesManager agencyId={a.id} services={options.data[1]} onChanged={agency.reload} />
          </>
        )}
      </div>
    </div>
  );
}
