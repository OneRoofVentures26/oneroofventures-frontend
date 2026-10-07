"use client";

import { useState } from "react";
import { TIERS, type PackageResponse, type ServiceResponse } from "@/lib/api/types";
import { createPackage, deletePackage, listPackages, updatePackage } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { formatPackagePrice, TIER_LABELS } from "@/lib/utils";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import PackageForm from "@/components/admin/PackageForm";
import PackageSuggestionsPanel from "@/components/admin/PackageSuggestionsPanel";
import { useToast } from "@/components/admin/Toast";
import { dangerLinkButton, ErrorBanner, linkButton, secondaryButton } from "@/components/admin/ui";

export default function PackagesManager({
  agencyId,
  services,
  onChanged,
}: {
  agencyId: number;
  services: ServiceResponse[];
  /** Called after packages change (saving a package can also add a service to the agency). */
  onChanged: () => void;
}) {
  const toast = useToast();
  const packages = useAsync(() => listPackages(agencyId), String(agencyId));
  const [editing, setEditing] = useState<"new" | number | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PackageResponse | null>(null);

  const serviceName = (code: string) => services.find((s) => s.code === code)?.name ?? code;

  const groups = new Map<string, PackageResponse[]>();
  for (const p of packages.data ?? []) {
    groups.set(p.serviceCode, [...(groups.get(p.serviceCode) ?? []), p]);
  }
  for (const list of groups.values()) list.sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier));

  function refresh() {
    packages.reload();
    onChanged();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await deletePackage(agencyId, target.id);
      toast.show(`“${target.name}” deleted`);
      refresh();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Packages</h2>
          <p className="text-xs text-ink-soft">One package per service and tier (Starter, Growth, Pro).</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSuggesting(true);
              setEditing(null);
            }}
            className={secondaryButton}
          >
            Suggest from price text
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing("new");
              setSuggesting(false);
            }}
            className={secondaryButton}
          >
            + Add package
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <ErrorBanner error={packages.error} onRetry={packages.reload} />

        {suggesting && (
          <PackageSuggestionsPanel
            agencyId={agencyId}
            services={services}
            onClose={() => setSuggesting(false)}
            onSaved={(count) => {
              toast.show(`${count} package${count === 1 ? "" : "s"} added`);
              setSuggesting(false);
              refresh();
            }}
          />
        )}

        {editing === "new" && (
          <PackageForm
            services={services}
            onCancel={() => setEditing(null)}
            onSubmit={async (body) => {
              await createPackage(agencyId, body);
              toast.show(`“${body.name}” added`);
              setEditing(null);
              refresh();
            }}
          />
        )}

        {!packages.data ? (
          !packages.error && <p className="text-sm text-ink-soft">Loading packages…</p>
        ) : packages.data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-ink-soft">
            No packages yet. The agency will show as “Price on request” until you add some.
          </p>
        ) : (
          [...groups.entries()].map(([code, list]) => (
            <div key={code}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{serviceName(code)}</h3>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {list.map((p) =>
                  editing === p.id ? (
                    <li key={p.id} className="p-2">
                      <PackageForm
                        services={services}
                        initial={p}
                        onCancel={() => setEditing(null)}
                        onSubmit={async (body) => {
                          await updatePackage(agencyId, p.id, body);
                          toast.show(`“${body.name}” saved`);
                          setEditing(null);
                          refresh();
                        }}
                      />
                    </li>
                  ) : (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink-soft">
                            {TIER_LABELS[p.tier]}
                          </span>
                          {p.name}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {formatPackagePrice(p.priceMin, p.priceMax, p.billing)} · {p.inclusions.length} inclusion
                          {p.inclusions.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(p.id);
                            setSuggesting(false);
                          }}
                          className={linkButton}
                        >
                          Edit
                        </button>
                        <button type="button" onClick={() => setPendingDelete(p)} className={dangerLinkButton}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete package?"
        description={`“${pendingDelete?.name}” will be removed from this agency's profile.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
