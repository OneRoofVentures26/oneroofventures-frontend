"use client";

import { useState } from "react";
import { TIERS, type Billing, type PackageRequest, type ServiceResponse, type Tier } from "@/lib/api/types";
import { ApiError, errorMessage } from "@/lib/api/http";
import { cn, TIER_LABELS } from "@/lib/utils";
import BulletListEditor from "@/components/admin/BulletListEditor";
import { ErrorBanner, Field, inputClass, orNull, primaryButton, secondaryButton } from "@/components/admin/ui";

export function validatePackage(p: Pick<PackageRequest, "name" | "serviceCode" | "priceMin" | "priceMax">): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!p.serviceCode) errors.serviceCode = "Choose a service";
  if (!p.name.trim()) errors.name = "Name is required";
  if ((p.priceMin == null) !== (p.priceMax == null)) errors.priceMax = "Set both prices, or neither for “on request”";
  if (p.priceMin != null && p.priceMin < 0) errors.priceMin = "Must be 0 or more";
  if (p.priceMin != null && p.priceMax != null && p.priceMin > p.priceMax) errors.priceMax = "Max must be ≥ min";
  return errors;
}

function parsePrice(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

export default function PackageForm({
  services,
  initial,
  onSubmit,
  onCancel,
}: {
  services: ServiceResponse[];
  initial?: PackageRequest;
  onSubmit: (body: PackageRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [serviceCode, setServiceCode] = useState(initial?.serviceCode ?? services[0]?.code ?? "");
  const [tier, setTier] = useState<Tier>(initial?.tier ?? "STARTER");
  const [name, setName] = useState(initial?.name ?? "");
  const [priceMin, setPriceMin] = useState(initial?.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(initial?.priceMax?.toString() ?? "");
  const [billing, setBilling] = useState<Billing>(initial?.billing ?? "MONTHLY");
  const [inclusions, setInclusions] = useState<string[]>(initial?.inclusions ?? []);
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: PackageRequest = {
      serviceCode,
      tier,
      name: name.trim(),
      priceMin: parsePrice(priceMin),
      priceMax: parsePrice(priceMax),
      billing,
      inclusions: inclusions.map((i) => i.trim()).filter(Boolean),
      sourceUrl: orNull(sourceUrl),
    };
    const found = validatePackage(body);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(body);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      setFormError(
        err instanceof ApiError && err.status === 409
          ? `This agency already has a ${TIER_LABELS[tier]} package for this service.`
          : errorMessage(err),
      );
    } finally {
      setSaving(false);
    }
  }

  const input = (key: string) => cn(inputClass, errors[key] && "border-danger");

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-accent/40 bg-paper p-4" noValidate>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Service *" error={errors.serviceCode}>
          <select value={serviceCode} onChange={(e) => setServiceCode(e.target.value)} className={input("serviceCode")}>
            {services.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tier *" error={errors.tier}>
          <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} className={input("tier")}>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {TIER_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Package name *" error={errors.name}>
          <input maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={input("name")} />
        </Field>
        <Field label="Price min (₹)" error={errors.priceMin}>
          <input
            inputMode="numeric"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ""))}
            placeholder="On request"
            className={input("priceMin")}
          />
        </Field>
        <Field label="Price max (₹)" error={errors.priceMax} hint="Same as min for a fixed price">
          <input
            inputMode="numeric"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value.replace(/\D/g, ""))}
            placeholder="On request"
            className={input("priceMax")}
          />
        </Field>
        <Field label="Billing" error={errors.billing}>
          <select value={billing} onChange={(e) => setBilling(e.target.value as Billing)} className={input("billing")}>
            <option value="MONTHLY">Monthly</option>
            <option value="ONE_TIME">One-time</option>
          </select>
        </Field>
      </div>
      <Field label="Inclusions" error={errors.inclusions}>
        <div className="mt-1.5">
          <BulletListEditor items={inclusions} onChange={setInclusions} />
        </div>
      </Field>
      <Field label="Source URL" error={errors.sourceUrl}>
        <input
          type="url"
          maxLength={500}
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://"
          className={input("sourceUrl")}
        />
      </Field>
      <ErrorBanner error={formError} />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Saving…" : initial ? "Save package" : "Add package"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}
