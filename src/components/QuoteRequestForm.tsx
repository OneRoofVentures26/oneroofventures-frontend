"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AgencyProfile, CityItem, LeadCreated, LeadRequest, LocalityItem, ServiceItem } from "@/lib/api/types";
import { createLead, getLocalities, warmUpBackend } from "@/lib/api/public";
import { ApiError, errorMessage } from "@/lib/api/http";
import { TURNSTILE_SITE_KEY } from "@/lib/config";
import { cn, formatPackagePrice, TIER_LABELS } from "@/lib/utils";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";

const PHONE_PATTERN = /^(\+91[\s-]?)?[6-9][0-9]{9}$/;
const BUSINESS_TYPES = [
  "Healthcare",
  "Retail",
  "Restaurant & food",
  "Real estate",
  "Education",
  "E-commerce / D2C",
  "Professional services",
  "Manufacturing",
  "Hospitality & travel",
];

interface QuoteRequestFormProps {
  cities: CityItem[];
  services: ServiceItem[];
  initialCitySlug: string;
  initialLocalities: LocalityItem[];
  initialAgencies: AgencyProfile[];
  initialPackageId: number | null;
  initialServiceSlug: string;
  /** Agencies in the link that couldn't be found (unpublished or wrong city). */
  missingAgencies: number;
}

type Errors = Partial<Record<keyof LeadRequest | "form", string>>;

const inputClass =
  "mt-1 w-full rounded-md border bg-surface px-3 py-2 text-sm outline-none focus:border-accent disabled:bg-muted disabled:text-ink-soft";

function guessService(agencies: AgencyProfile[], packageId: number | null, services: ServiceItem[]): string {
  if (agencies.length === 1 && packageId) {
    const code = Object.entries(agencies[0].packages).find(([, pkgs]) => pkgs.some((p) => p.id === packageId))?.[0];
    const match = services.find((s) => s.code === code);
    if (match) return match.slug;
  }
  const offered = new Set(agencies.flatMap((a) => a.services.map((s) => s.slug)));
  return offered.size === 1 ? [...offered][0] : "";
}

export default function QuoteRequestForm({
  cities,
  services,
  initialCitySlug,
  initialLocalities,
  initialAgencies,
  initialPackageId,
  initialServiceSlug,
  missingAgencies,
}: QuoteRequestFormProps) {
  const [agencies, setAgencies] = useState(initialAgencies);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [citySlug, setCitySlug] = useState(initialCitySlug);
  const [localities, setLocalities] = useState<{ city: string; items: LocalityItem[] }>({
    city: initialCitySlug,
    items: initialLocalities,
  });
  const [localitySlug, setLocalitySlug] = useState("");
  const [serviceSlug, setServiceSlug] = useState(
    initialServiceSlug || guessService(initialAgencies, initialPackageId, services),
  );
  const [packageId, setPackageId] = useState<number | null>(initialPackageId);
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [result, setResult] = useState<LeadCreated | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  // Wake the backend while the visitor fills in the form.
  useEffect(() => warmUpBackend(), []);

  // Localities only exist for cities with agencies; refetch when the city changes.
  useEffect(() => {
    if (!citySlug || localities.city === citySlug) return;
    let cancelled = false;
    getLocalities(citySlug).then(
      (items) => !cancelled && setLocalities({ city: citySlug, items }),
      () => !cancelled && setLocalities({ city: citySlug, items: [] }),
    );
    return () => {
      cancelled = true;
    };
  }, [citySlug, localities.city]);

  const singleAgency = agencies.length === 1 ? agencies[0] : null;
  const selectedService = services.find((s) => s.slug === serviceSlug);
  const packageOptions = singleAgency && selectedService ? (singleAgency.packages[selectedService.code] ?? []) : [];
  const effectivePackageId = packageOptions.some((p) => p.id === packageId) ? packageId : null;
  const cityLocked = agencies.length > 0;
  const localityItems = localities.city === citySlug ? localities.items : [];

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your name";
    if (!PHONE_PATTERN.test(phone.trim())) next.phone = "Enter a 10-digit Indian mobile number, optionally with +91";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address";
    if (!citySlug) next.citySlug = "Choose your city";
    if (!serviceSlug) next.serviceSlug = "Choose the service you need";
    if (budget && (!/^\d+$/.test(budget) || Number(budget) > 100_000_000)) next.budgetMonthly = "Enter a whole number in rupees";
    if (!captchaToken) next.captchaToken = "Please complete the captcha check";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body: LeadRequest = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      businessName: businessName.trim() || undefined,
      businessType: businessType.trim() || undefined,
      citySlug,
      localitySlug: localitySlug || undefined,
      serviceSlug,
      budgetMonthly: budget ? Number(budget) : undefined,
      message: message.trim() || undefined,
      agencyId: singleAgency?.id,
      agencyIds: agencies.length > 1 ? agencies.map((a) => a.id) : undefined,
      packageId: singleAgency ? (effectivePackageId ?? undefined) : undefined,
      captchaToken: captchaToken as string,
    };

    setStatus("sending");
    try {
      setResult(await createLead(body));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setErrors({ form: "You've sent several requests in the last hour. Please try again later." });
      } else if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        const fieldErrors: Errors = {};
        for (const [field, msg] of Object.entries(err.fields)) {
          const key = (field.split(/[.[]/)[0] || "form") as keyof Errors;
          fieldErrors[key] = key === "captchaToken" ? "Captcha check failed — please try again" : msg;
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ form: errorMessage(err) });
      }
    } finally {
      // Turnstile tokens are single use.
      turnstileRef.current?.reset();
      setStatus("idle");
    }
  }

  if (result) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent-light p-6 text-center">
        <p className="text-base font-bold text-accent-dark">Quote request sent!</p>
        {result.sentTo.length > 0 ? (
          <>
            <p className="mt-2 text-sm text-ink-soft">
              We&apos;ve forwarded your brief to {result.sentTo.length}{" "}
              {result.sentTo.length === 1 ? "agency" : "agencies"}. Expect them to get in touch soon.
            </p>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {result.sentTo.map((a) => (
                <li key={a.id} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink">
                  {a.name}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">
            We&apos;ve received your request and will match you with agencies shortly.
          </p>
        )}
        <p className="mt-4 text-xs text-ink-soft">Reference #{result.leadId}</p>
        <Link href={citySlug ? `/${citySlug}` : "/"} className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
          Keep browsing agencies →
        </Link>
      </div>
    );
  }

  const fieldError = (key: keyof Errors) =>
    errors[key] ? <p className="mt-1 text-xs text-danger">{errors[key]}</p> : null;
  const borderFor = (key: keyof Errors) => (errors[key] ? "border-danger" : "border-border");

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {missingAgencies > 0 && (
        <p className="rounded-md bg-gold-light px-3 py-2 text-sm text-ink">
          {missingAgencies === 1 ? "One agency" : `${missingAgencies} agencies`} from your link{" "}
          {missingAgencies === 1 ? "is" : "are"} no longer listed and won&apos;t receive this request.
        </p>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Sending to</p>
        {agencies.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {agencies.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink"
              >
                {a.name}
                <button
                  type="button"
                  onClick={() => setAgencies((prev) => prev.filter((x) => x.id !== a.id))}
                  aria-label={`Remove ${a.name}`}
                  className="text-ink-soft hover:text-danger"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">
            Up to 3 agencies that match your city, service and budget — we pick them for you.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="text-sm font-medium text-ink">
            Your name *
          </label>
          <input
            id="q-name"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(inputClass, borderFor("name"))}
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="q-phone" className="text-sm font-medium text-ink">
            Mobile number *
          </label>
          <input
            id="q-phone"
            type="tel"
            inputMode="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
            className={cn(inputClass, borderFor("phone"))}
          />
          {fieldError("phone")}
        </div>
        <div>
          <label htmlFor="q-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="q-email"
            type="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(inputClass, borderFor("email"))}
          />
          {fieldError("email")}
        </div>
        <div>
          <label htmlFor="q-business" className="text-sm font-medium text-ink">
            Business name
          </label>
          <input
            id="q-business"
            maxLength={200}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={cn(inputClass, borderFor("businessName"))}
          />
          {fieldError("businessName")}
        </div>
        <div>
          <label htmlFor="q-type" className="text-sm font-medium text-ink">
            Type of business
          </label>
          <input
            id="q-type"
            list="q-business-types"
            maxLength={100}
            placeholder="e.g. Healthcare"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className={cn(inputClass, borderFor("businessType"))}
          />
          <datalist id="q-business-types">
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          {fieldError("businessType")}
        </div>
        <div>
          <label htmlFor="q-budget" className="text-sm font-medium text-ink">
            Monthly budget (₹)
          </label>
          <input
            id="q-budget"
            inputMode="numeric"
            placeholder="e.g. 15000"
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
            className={cn(inputClass, borderFor("budgetMonthly"))}
          />
          {fieldError("budgetMonthly")}
        </div>
        <div>
          <label htmlFor="q-city" className="text-sm font-medium text-ink">
            City *
          </label>
          <select
            id="q-city"
            value={citySlug}
            disabled={cityLocked}
            onChange={(e) => {
              setCitySlug(e.target.value);
              setLocalitySlug("");
            }}
            className={cn(inputClass, borderFor("citySlug"))}
          >
            <option value="">Select a city</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldError("citySlug")}
        </div>
        <div>
          <label htmlFor="q-locality" className="text-sm font-medium text-ink">
            Area
          </label>
          <select
            id="q-locality"
            value={localitySlug}
            disabled={localityItems.length === 0}
            onChange={(e) => setLocalitySlug(e.target.value)}
            className={cn(inputClass, borderFor("localitySlug"))}
          >
            <option value="">{localityItems.length === 0 ? "—" : "Any area"}</option>
            {localityItems.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
          {fieldError("localitySlug")}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Service needed *</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {services.map((s) => (
            <button
              type="button"
              key={s.slug}
              onClick={() => setServiceSlug(s.slug)}
              aria-pressed={serviceSlug === s.slug}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                serviceSlug === s.slug
                  ? "border-accent bg-accent-light text-accent-dark"
                  : "border-border text-ink-soft hover:border-accent",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
        {fieldError("serviceSlug")}
      </div>

      {packageOptions.length > 0 && (
        <div>
          <label htmlFor="q-package" className="text-sm font-medium text-ink">
            Package you&apos;re interested in
          </label>
          <select
            id="q-package"
            value={effectivePackageId ?? ""}
            onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : null)}
            className={cn(inputClass, borderFor("packageId"))}
          >
            <option value="">No specific package</option>
            {packageOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {TIER_LABELS[p.tier]} · {p.name} · {formatPackagePrice(p.priceMin, p.priceMax, p.billing)}
              </option>
            ))}
          </select>
          {fieldError("packageId")}
        </div>
      )}

      <div>
        <label htmlFor="q-message" className="text-sm font-medium text-ink">
          Tell us about your project
        </label>
        <textarea
          id="q-message"
          rows={4}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you trying to achieve? Timeline, goals, anything agencies should know."
          className={cn(inputClass, borderFor("message"))}
        />
        {fieldError("message")}
      </div>

      <div>
        <Turnstile ref={turnstileRef} siteKey={TURNSTILE_SITE_KEY} onToken={setCaptchaToken} />
        {fieldError("captchaToken")}
      </div>

      {(errors.form || errors.agencyId || errors.agencyIds) && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {errors.form ?? errors.agencyId ?? errors.agencyIds}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending"
            ? "Sending…"
            : agencies.length > 0
              ? `Send quote request to ${agencies.length} agenc${agencies.length === 1 ? "y" : "ies"}`
              : "Get matched quotes"}
        </button>
        {status === "sending" && (
          <p className="mt-2 text-center text-xs text-ink-soft">This can take up to a minute if our server is waking up.</p>
        )}
      </div>
    </form>
  );
}
