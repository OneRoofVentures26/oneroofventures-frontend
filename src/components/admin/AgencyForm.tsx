"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AgencyRequest,
  AgencyResponse,
  AgencyStatus,
  CityResponse,
  PricingType,
  ServiceResponse,
} from "@/lib/api/types";
import { listLocalities } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/http";
import { useAsync } from "@/lib/use-async";
import { cn, formatDateTime, PRICING_TYPE_LABELS } from "@/lib/utils";
import { ErrorBanner, Field, inputClass, orNull, primaryButton, secondaryButton } from "@/components/admin/ui";

interface AgencyFormProps {
  initialData?: AgencyResponse;
  cities: CityResponse[];
  services: ServiceResponse[];
  onSubmit: (input: AgencyRequest) => Promise<void>;
  submitLabel?: string;
}

type Errors = Record<string, string>;

const sectionClass = "rounded-xl border border-border bg-surface p-5";
const sectionTitle = "text-sm font-bold uppercase tracking-wide text-ink-soft";

export default function AgencyForm({ initialData: a, cities, services, onSubmit, submitLabel = "Save Agency" }: AgencyFormProps) {
  const router = useRouter();
  const [name, setName] = useState(a?.name ?? "");
  const [slug, setSlug] = useState(a?.slug ?? "");
  const [cityId, setCityId] = useState<number | "">(a?.cityId ?? (cities.length === 1 ? cities[0].id : ""));
  const [localityId, setLocalityId] = useState<number | "">(a?.localityId ?? "");
  const [status, setStatus] = useState<AgencyStatus>(a?.status ?? "DRAFT");
  const [verified, setVerified] = useState(a?.verified ?? false);
  const [lastCheckedOn, setLastCheckedOn] = useState(a?.lastCheckedOn ?? "");
  const [website, setWebsite] = useState(a?.website ?? "");
  const [phone, setPhone] = useState(a?.phone ?? "");
  const [email, setEmail] = useState(a?.email ?? "");
  const [teamSize, setTeamSize] = useState(a?.teamSize ?? "");
  const [description, setDescription] = useState(a?.description ?? "");
  const [targetClients, setTargetClients] = useState(a?.targetClients ?? "");
  const [pricingType, setPricingType] = useState<PricingType>(a?.pricingType ?? "FIXED");
  const [pricingPageUrl, setPricingPageUrl] = useState(a?.pricingPageUrl ?? "");
  const [rawPrices, setRawPrices] = useState(a?.rawPrices ?? "");
  const [serviceCodes, setServiceCodes] = useState<string[]>(a?.serviceCodes ?? []);

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const localities = useAsync(
    () => (cityId === "" ? Promise.resolve([]) : listLocalities(cityId)),
    String(cityId),
  );

  function toggleService(code: string) {
    setServiceCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (cityId === "") next.cityId = "Choose a city";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        cityId: cityId as number,
        localityId: localityId === "" ? null : localityId,
        name: name.trim(),
        slug: orNull(slug),
        website: orNull(website),
        phone: orNull(phone),
        email: orNull(email),
        teamSize: orNull(teamSize),
        description: orNull(description),
        targetClients: orNull(targetClients),
        pricingType,
        rawPrices: orNull(rawPrices),
        pricingPageUrl: orNull(pricingPageUrl),
        verified,
        lastCheckedOn: lastCheckedOn || null,
        status,
        serviceCodes,
      });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) setErrors(err.fields);
      setFormError(err instanceof ApiError && err.status === 409 ? err.message : errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const input = (key: string) => cn(inputClass, errors[key] && "border-danger");

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <section className={sectionClass}>
        <h2 className={sectionTitle}>Listing</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Agency name *" htmlFor="a-name" error={errors.name}>
            <input id="a-name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className={input("name")} />
          </Field>
          <Field label="URL slug" htmlFor="a-slug" error={errors.slug} hint="Leave blank to generate from the name">
            <input id="a-slug" maxLength={220} value={slug} onChange={(e) => setSlug(e.target.value)} className={input("slug")} />
          </Field>
          <Field label="City *" htmlFor="a-city" error={errors.cityId}>
            <select
              id="a-city"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value ? Number(e.target.value) : "");
                setLocalityId("");
              }}
              className={input("cityId")}
            >
              <option value="">Select a city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Locality"
            htmlFor="a-locality"
            error={errors.localityId}
            hint={cityId !== "" && localities.data?.length === 0 ? "No localities yet — add them under Cities & localities" : undefined}
          >
            <select
              id="a-locality"
              value={localityId}
              disabled={cityId === "" || localities.loading}
              onChange={(e) => setLocalityId(e.target.value ? Number(e.target.value) : "")}
              className={input("localityId")}
            >
              <option value="">None</option>
              {localities.data?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="a-status" error={errors.status} hint="Only published agencies appear on the site">
            <select id="a-status" value={status} onChange={(e) => setStatus(e.target.value as AgencyStatus)} className={input("status")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </Field>
          <Field label="Last checked on" htmlFor="a-checked" error={errors.lastCheckedOn}>
            <input
              id="a-checked"
              type="date"
              value={lastCheckedOn}
              onChange={(e) => setLastCheckedOn(e.target.value)}
              className={input("lastCheckedOn")}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-ink sm:col-span-2">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Verified (shows a “Verified” badge on the site)
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitle}>Profile &amp; contact</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Description" htmlFor="a-desc" error={errors.description} className="sm:col-span-2">
            <textarea
              id="a-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={input("description")}
            />
          </Field>
          <Field label="Target clients" htmlFor="a-target" error={errors.targetClients}>
            <input
              id="a-target"
              value={targetClients}
              onChange={(e) => setTargetClients(e.target.value)}
              placeholder="e.g. Local SMBs"
              className={input("targetClients")}
            />
          </Field>
          <Field label="Team size" htmlFor="a-team" error={errors.teamSize}>
            <input
              id="a-team"
              maxLength={200}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g. 10-50"
              className={input("teamSize")}
            />
          </Field>
          <Field label="Website" htmlFor="a-web" error={errors.website}>
            <input
              id="a-web"
              type="url"
              maxLength={500}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className={input("website")}
            />
          </Field>
          <Field label="Phone (public)" htmlFor="a-phone" error={errors.phone}>
            <input id="a-phone" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} className={input("phone")} />
          </Field>
          <Field
            label="Email (private — receives quote requests)"
            htmlFor="a-email"
            error={errors.email}
            className="sm:col-span-2"
          >
            <input
              id="a-email"
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input("email")}
            />
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitle}>Services &amp; pricing</h2>
        <div className="mt-4 space-y-4">
          <Field label="Services offered" error={errors.serviceCodes}>
            <div className="mt-2 flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  type="button"
                  key={s.code}
                  onClick={() => toggleService(s.code)}
                  aria-pressed={serviceCodes.includes(s.code)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    serviceCodes.includes(s.code)
                      ? "border-accent bg-accent-light text-accent-dark"
                      : "border-border text-ink-soft hover:border-accent",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Pricing type *" htmlFor="a-ptype" error={errors.pricingType}>
              <select
                id="a-ptype"
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as PricingType)}
                className={input("pricingType")}
              >
                {(Object.keys(PRICING_TYPE_LABELS) as PricingType[]).map((p) => (
                  <option key={p} value={p}>
                    {PRICING_TYPE_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pricing page URL" htmlFor="a-purl" error={errors.pricingPageUrl}>
              <input
                id="a-purl"
                type="url"
                maxLength={500}
                value={pricingPageUrl}
                onChange={(e) => setPricingPageUrl(e.target.value)}
                placeholder="https://"
                className={input("pricingPageUrl")}
              />
            </Field>
          </div>
          <Field
            label="Researched price text"
            htmlFor="a-raw"
            error={errors.rawPrices}
            hint="Free text from research. Used to suggest packages on the edit page."
          >
            <textarea
              id="a-raw"
              rows={4}
              value={rawPrices}
              onChange={(e) => setRawPrices(e.target.value)}
              className={cn(input("rawPrices"), "font-mono text-xs")}
            />
          </Field>
        </div>
      </section>

      {a && (a.fitForUs || a.researchNotes || a.researchSource || a.rawLocation || a.rawTeamSize) && (
        <section className={sectionClass}>
          <h2 className={sectionTitle}>Research (from CSV import)</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {(
              [
                ["Fit for us", a.fitForUs],
                ["Source", a.researchSource],
                ["Raw location", a.rawLocation],
                ["Raw team size", a.rawTeamSize],
                ["Notes", a.researchNotes],
              ] as const
            )
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className={k === "Notes" ? "sm:col-span-2" : undefined}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{k}</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-ink">{v}</dd>
                </div>
              ))}
          </dl>
        </section>
      )}

      {a && (
        <p className="text-xs text-ink-soft">
          Created {formatDateTime(a.createdAt)} · Updated {formatDateTime(a.updatedAt)}
        </p>
      )}

      <ErrorBanner error={formError} />

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Saving…" : submitLabel}
        </button>
        <button type="button" onClick={() => router.push("/admin/agencies")} className={secondaryButton}>
          Back to list
        </button>
      </div>
    </form>
  );
}
