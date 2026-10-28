"use client";

import { useState } from "react";
import type { AgencyRatingsRequest, AgencyResponse } from "@/lib/api/types";
import { updateAgencyRatings } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/admin/Toast";
import { ErrorBanner, Field, inputClass, primaryButton, secondaryButton } from "@/components/admin/ui";

type Key = keyof AgencyRatingsRequest;

const SITES: Array<{ label: string; rating: Key; reviews: Key }> = [
  { label: "Google", rating: "googleRating", reviews: "googleReviews" },
  { label: "Clutch", rating: "clutchRating", reviews: "clutchReviews" },
  { label: "GoodFirms", rating: "goodFirmsRating", reviews: "goodFirmsReviews" },
];

const KEYS: Key[] = SITES.flatMap((s) => [s.rating, s.reviews]);

function show(rating: number | null, reviews: number | null): string {
  if (rating === null && reviews === null) return "—";
  return [rating !== null ? `${rating.toFixed(1)} / 5` : null, reviews !== null ? `${reviews.toLocaleString("en-IN")} reviews` : null]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Google, Clutch and GoodFirms ratings on the edit page, editable by hand.
 * Saving replaces all six values (an empty box clears one), like a row of the
 * quality sheet; a later quality sheet upload overwrites them again.
 */
export default function AgencyRatingsCard({
  agency,
  onSaved,
}: {
  agency: AgencyResponse;
  /** The response still has the old score; the backend rescores a few seconds later. */
  onSaved: (updated: AgencyResponse) => void;
}) {
  const toast = useToast();
  const q = agency.quality;
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<Key, string>>({} as Record<Key, string>);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  function startEditing() {
    // Prefill from what's stored, so saving sends every value back.
    setValues(Object.fromEntries(KEYS.map((k) => [k, q[k] === null ? "" : String(q[k])])) as Record<Key, string>);
    setErrors({});
    setFormError(null);
    setEditing(true);
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    for (const s of SITES) {
      const r = values[s.rating].trim();
      if (r && !(Number(r) >= 0 && Number(r) <= 5 && /^\d(\.\d)?$/.test(r))) {
        next[s.rating] = "0.0 to 5.0, one decimal";
      }
      const n = values[s.reviews].trim();
      if (n && !/^\d+$/.test(n)) next[s.reviews] = "A whole number, 0 or more";
    }
    return next;
  }

  async function handleSave() {
    const found = validate();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    const body = Object.fromEntries(
      KEYS.map((k) => [k, values[k].trim() === "" ? null : Number(values[k])]),
    ) as AgencyRatingsRequest;

    setSaving(true);
    try {
      const updated = await updateAgencyRatings(agency.id, body);
      onSaved(updated);
      setEditing(false);
      toast.show("Ratings saved. The score updates in a few seconds.");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) setErrors(err.fields);
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const input = (key: string) => cn(inputClass, errors[key] && "border-danger");

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg text-text">Ratings</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Count towards the One Roof Score. A quality sheet upload that lists this agency overwrites them.
          </p>
        </div>
        {!editing && (
          <button type="button" onClick={startEditing} className={secondaryButton}>
            Edit ratings
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          {SITES.map((s) => (
            <fieldset key={s.label} className="grid grid-cols-2 gap-4">
              <legend className="sr-only">{s.label}</legend>
              <Field label={`${s.label} rating`} htmlFor={`r-${s.rating}`} error={errors[s.rating]}>
                <input
                  id={`r-${s.rating}`}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="e.g. 4.8"
                  value={values[s.rating]}
                  onChange={(e) => setValues((v) => ({ ...v, [s.rating]: e.target.value }))}
                  className={input(s.rating)}
                />
              </Field>
              <Field label={`${s.label} reviews`} htmlFor={`r-${s.reviews}`} error={errors[s.reviews]}>
                <input
                  id={`r-${s.reviews}`}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  placeholder="e.g. 120"
                  value={values[s.reviews]}
                  onChange={(e) => setValues((v) => ({ ...v, [s.reviews]: e.target.value }))}
                  className={input(s.reviews)}
                />
              </Field>
            </fieldset>
          ))}
          <p className="text-[13px] text-text-muted">Leave a box empty to clear that value.</p>
          <ErrorBanner error={formError} />
          <div className="flex items-center gap-3">
            <button type="button" disabled={saving} onClick={handleSave} className={primaryButton}>
              {saving ? "Saving…" : "Save ratings"}
            </button>
            <button type="button" disabled={saving} onClick={() => setEditing(false)} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          {SITES.map((s) => (
            <div key={s.label}>
              <dt className="text-[13px] font-semibold text-text-muted">{s.label}</dt>
              <dd className="mt-0.5 text-text">{show(q[s.rating], q[s.reviews])}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
