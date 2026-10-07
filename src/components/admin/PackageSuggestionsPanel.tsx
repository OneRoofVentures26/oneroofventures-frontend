"use client";

import { useState } from "react";
import { TIERS, type Billing, type PackageRequest, type ServiceResponse, type SuggestedPackage, type Tier } from "@/lib/api/types";
import { bulkCreatePackages, getPackageSuggestions } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { cn, sentenceCase, TIER_LABELS } from "@/lib/utils";
import { validatePackage } from "@/components/admin/PackageForm";
import { ErrorBanner, primaryButton, secondaryButton } from "@/components/admin/ui";

const MAX_BULK = 15;

interface Row extends SuggestedPackage {
  selected: boolean;
  inclusionsText: string;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  HIGH: "bg-harbor-light text-harbor-dark",
  MEDIUM: "bg-mist text-ink",
  LOW: "bg-danger/10 text-danger",
};

const cellInput = "w-full rounded-sm border border-mist bg-surface px-2 py-1 text-xs outline-none focus:border-harbor";

function toRows(suggestions: SuggestedPackage[]): Row[] {
  return suggestions.map((s) => ({
    ...s,
    selected: !s.alreadyExists,
    inclusionsText: (s.inclusions ?? []).join("\n"),
  }));
}

function toRequest(r: Row): PackageRequest {
  return {
    serviceCode: r.serviceCode,
    tier: r.tier,
    name: r.name.trim(),
    priceMin: r.priceMin,
    priceMax: r.priceMax,
    billing: r.billing ?? "MONTHLY",
    inclusions: r.inclusionsText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean),
    sourceUrl: r.sourceUrl,
  };
}

/** Review packages suggested from the agency's researched price text, then save them in one go. */
export default function PackageSuggestionsPanel({
  agencyId,
  services,
  onSaved,
  onClose,
}: {
  agencyId: number;
  services: ServiceResponse[];
  onSaved: (count: number) => void;
  onClose: () => void;
}) {
  const suggestions = useAsync(() => getPackageSuggestions(agencyId), String(agencyId));
  const [rows, setRows] = useState<{ source: SuggestedPackage[] | undefined; items: Row[] }>({ source: undefined, items: [] });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Rebuild editable rows whenever a fresh set of suggestions arrives.
  const loaded = suggestions.data?.suggestions;
  if (loaded && rows.source !== loaded) {
    setRows({ source: loaded, items: toRows(loaded) });
  }
  const items = rows.items;

  function update(idx: number, patch: Partial<Row>) {
    setRows((prev) => ({ ...prev, items: prev.items.map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));
  }

  const selected = items.filter((r) => r.selected && !r.alreadyExists);

  async function save() {
    setError(null);
    if (selected.length === 0) return setError("Select at least one package to save.");
    if (selected.length > MAX_BULK) return setError(`You can save up to ${MAX_BULK} packages at once.`);

    const requests = selected.map(toRequest);
    const invalid = requests
      .map((r) => ({ r, errs: validatePackage(r) }))
      .filter((x) => Object.keys(x.errs).length > 0);
    if (invalid.length > 0) {
      return setError(
        invalid.map(({ r, errs }) => `${r.name || "Unnamed"}: ${Object.values(errs).join(", ")}`).join(" · "),
      );
    }

    setSaving(true);
    try {
      await bulkCreatePackages(agencyId, requests);
      onSaved(requests.length);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        setError(
          Object.entries(err.fields)
            .map(([key, msg]) => {
              const idx = Number(key.match(/packages\[(\d+)\]/)?.[1]);
              return Number.isInteger(idx) && requests[idx] ? `${requests[idx].name}: ${msg}` : `${key}: ${msg}`;
            })
            .join(" · "),
        );
      } else if (err instanceof ApiError && err.status === 409) {
        setError("One of these packages already exists (same service and tier). Untick it and try again.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-sm border border-harbor/40 bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink">Suggested packages</h3>
          <p className="text-xs text-ink-soft">
            Built from the researched price text. Nothing is saved until you click save. Review prices before saving.
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-xs font-medium text-ink-soft hover:text-ink">
          Close
        </button>
      </div>

      <ErrorBanner error={suggestions.error} onRetry={suggestions.reload} />

      {!suggestions.data ? (
        !suggestions.error && <p className="text-sm text-ink-soft">Reading price text…</p>
      ) : (
        <>
          {suggestions.data.rawPrices ? (
            <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-sm bg-muted p-3 text-xs text-ink-soft">
              {suggestions.data.rawPrices}
            </pre>
          ) : (
            <p className="text-sm text-ink-soft">
              This agency has no researched price text. Add it under “Researched price text” above and save first.
            </p>
          )}

          {suggestions.data.existingPackages.length > 0 && (
            <p className="text-xs text-ink-soft">
              <span className="font-semibold">Already saved:</span>{" "}
              {suggestions.data.existingPackages
                .map((p) => `${services.find((s) => s.code === p.serviceCode)?.name ?? p.serviceCode} ${TIER_LABELS[p.tier]}`)
                .join(", ")}
            </p>
          )}

          {items.length === 0 ? (
            <p className="text-sm text-ink-soft">No packages could be suggested from this text.</p>
          ) : (
            <div className="space-y-3">
              {items.map((r, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-sm border bg-surface p-3",
                    r.alreadyExists ? "border-mist opacity-60" : r.selected ? "border-harbor/50" : "border-mist",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="checkbox"
                      checked={r.selected && !r.alreadyExists}
                      disabled={r.alreadyExists}
                      onChange={(e) => update(idx, { selected: e.target.checked })}
                      className="h-4 w-4 accent-harbor"
                      aria-label={`Include ${r.name}`}
                    />
                    <span
                      className={cn(
                        "rounded-sm px-2 py-0.5 text-[10px] font-semibold",
                        CONFIDENCE_STYLES[r.confidence] ?? "bg-muted text-ink-soft",
                      )}
                    >
                      {sentenceCase(r.confidence)} confidence
                    </span>
                    {r.alreadyExists && <span className="text-xs font-medium text-ink-soft">Already exists</span>}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-6">
                    <select
                      value={r.serviceCode}
                      onChange={(e) => update(idx, { serviceCode: e.target.value })}
                      className={cellInput}
                      aria-label="Service"
                    >
                      {services.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={r.tier}
                      onChange={(e) => update(idx, { tier: e.target.value as Tier })}
                      className={cellInput}
                      aria-label="Tier"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {TIER_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <input
                      value={r.name}
                      onChange={(e) => update(idx, { name: e.target.value })}
                      className={cn(cellInput, "col-span-2")}
                      aria-label="Package name"
                    />
                    <input
                      inputMode="numeric"
                      value={r.priceMin ?? ""}
                      placeholder="Min ₹"
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        update(idx, { priceMin: v === "" ? null : Number(v) });
                      }}
                      className={cellInput}
                      aria-label="Price min"
                    />
                    <input
                      inputMode="numeric"
                      value={r.priceMax ?? ""}
                      placeholder="Max ₹"
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        update(idx, { priceMax: v === "" ? null : Number(v) });
                      }}
                      className={cellInput}
                      aria-label="Price max"
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr]">
                    <select
                      value={r.billing ?? "MONTHLY"}
                      onChange={(e) => update(idx, { billing: e.target.value as Billing })}
                      className={cellInput}
                      aria-label="Billing"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="ONE_TIME">One-time</option>
                    </select>
                    <textarea
                      rows={2}
                      value={r.inclusionsText}
                      onChange={(e) => update(idx, { inclusionsText: e.target.value })}
                      placeholder="Inclusions, one per line"
                      className={cellInput}
                      aria-label="Inclusions"
                    />
                  </div>
                  {(r.evidence || (r.notes && r.notes.length > 0)) && (
                    <div className="mt-2 space-y-1 text-xs text-ink-soft">
                      {r.evidence && (
                        <p>
                          <span className="font-semibold">Evidence:</span> “{r.evidence}”
                        </p>
                      )}
                      {r.notes?.map((n, i) => (
                        <p key={i}>• {n}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {suggestions.data.ignored.length > 0 && (
            <details className="text-xs text-ink-soft">
              <summary className="cursor-pointer font-medium">
                {suggestions.data.ignored.length} amount{suggestions.data.ignored.length === 1 ? "" : "s"} ignored
              </summary>
              <ul className="mt-2 space-y-1">
                {suggestions.data.ignored.map((x, i) => (
                  <li key={i}>
                    “{x.text}” — {x.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <ErrorBanner error={error} />

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={saving || selected.length === 0} onClick={save} className={primaryButton}>
              {saving ? "Saving…" : `Save ${selected.length} package${selected.length === 1 ? "" : "s"}`}
            </button>
            <button type="button" onClick={onClose} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
