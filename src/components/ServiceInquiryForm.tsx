"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ContactRequest } from "@/lib/api/types";
import { createContactRequest, warmUpBackend } from "@/lib/api/public";
import { ApiError, errorMessage } from "@/lib/api/http";
import { TURNSTILE_SITE_KEY } from "@/lib/config";
import { CAPABILITIES, PACKAGE_CONTACT, PACKAGES, type PackageKey } from "@/lib/packages";
import { chip, ctaButton, input } from "@/lib/styles";
import { cn, formatINR } from "@/lib/utils";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";

/*
 * "Contact us" form. Messages are saved for the admin's Contact requests inbox;
 * nothing is emailed, so the visitor isn't promised an email confirmation.
 */

type Choice = PackageKey | "unsure";

const CHOICES: Array<{ key: Choice; label: string }> = [
  ...PACKAGES.map((p) => ({
    key: p.key as Choice,
    label: `${p.name} · ${formatINR(p.monthly)}/mo`,
  })),
  { key: "unsure", label: "Not sure yet" },
];

const PHONE_PATTERN = /^(\+91[\s-]?)?[6-9][0-9]{9}$/;

type Errors = Partial<Record<keyof ContactRequest | "form", string>>;

function isChoice(value: string | null): value is Choice {
  return value === "unsure" || PACKAGES.some((p) => p.key === value);
}

const labelClass = "text-sm font-medium text-text";
const optional = <span className="font-normal text-text-muted">(optional)</span>;

export default function ServiceInquiryForm() {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("package");
  const [choice, setChoice] = useState<Choice | null>(null);
  // A package button on the page (?package=growth) preselects it until the visitor picks one.
  const selected: Choice = choice ?? (isChoice(fromUrl) ? fromUrl : "unsure");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [budget, setBudget] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const turnstileRef = useRef<TurnstileHandle>(null);

  // Wake the backend while the visitor fills in the form.
  useEffect(() => warmUpBackend(), []);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address";
    if (!PHONE_PATTERN.test(phone.trim())) next.phone = "Enter a 10-digit Indian mobile number, optionally with +91";
    if (budget && Number(budget) > 100_000_000) next.monthlyBudget = "Enter a whole number in rupees";
    if (!captchaToken) next.captchaToken = "Please complete the captcha check";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const pkg = PACKAGES.find((p) => p.key === selected);
    const needed = [...(pkg ? [`${pkg.name} package`] : []), ...services];
    const body: ContactRequest = {
      name: name.trim(),
      businessName: business.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      monthlyBudget: budget ? Number(budget) : undefined,
      servicesNeeded: needed.length > 0 ? needed.join(", ") : undefined,
      aboutYou: message.trim() || undefined,
      captchaToken: captchaToken as string,
    };

    setSending(true);
    try {
      await createContactRequest(body);
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setErrors({ form: "Too many messages from this address. Please try again later." });
      } else if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        const fieldErrors: Errors = {};
        for (const [field, msg] of Object.entries(err.fields)) {
          const key = (field in body || field === "captchaToken" ? field : "form") as keyof Errors;
          fieldErrors[key] = key === "captchaToken" ? "Captcha check failed — please try again" : msg;
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ form: errorMessage(err) });
      }
    } finally {
      // Turnstile tokens are single use.
      turnstileRef.current?.reset();
      setCaptchaToken(null);
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-center">
        <p className="font-display text-2xl font-semibold text-text">
          Thanks, {name.trim() || "there"}
        </p>
        <p className="mx-auto mt-2 max-w-[48ch] text-sm text-text-muted">
          We&apos;ve received your message and will get back to you within one business day.
        </p>
      </div>
    );
  }

  const fieldError = (key: keyof Errors) =>
    errors[key] ? <p className="text-[13px] text-danger">{errors[key]}</p> : null;
  const invalid = (key: keyof Errors) => (errors[key] ? "border-danger" : undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <fieldset>
        <legend className={labelClass}>Which package are you interested in?</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHOICES.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={selected === c.key}
              onClick={() => setChoice(c.key)}
              className={chip(selected === c.key, true)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className={labelClass}>Your name</span>
          <input
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={cn(input, invalid("name"))}
          />
          {fieldError("name")}
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={cn(input, invalid("email"))}
          />
          {fieldError("email")}
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Mobile number</span>
          <input
            type="tel"
            inputMode="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
            autoComplete="tel"
            className={cn(input, invalid("phone"))}
          />
          {fieldError("phone")}
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Business name {optional}</span>
          <input
            maxLength={200}
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            autoComplete="organization"
            className={cn(input, invalid("businessName"))}
          />
          {fieldError("businessName")}
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <span className={labelClass}>Monthly budget (₹) {optional}</span>
          <input
            inputMode="numeric"
            placeholder="e.g. 25000"
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
            className={cn(input, invalid("monthlyBudget"))}
          />
          {fieldError("monthlyBudget")}
        </label>
      </div>

      <fieldset>
        <legend className={labelClass}>Services needed {optional}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CAPABILITIES.map((c) => {
            const on = services.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={on}
                onClick={() => setServices((prev) => (on ? prev.filter((s) => s !== c.name) : [...prev, c.name]))}
                className={chip(on)}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        {fieldError("servicesNeeded")}
      </fieldset>

      <label className="grid gap-1.5">
        <span className={labelClass}>Tell us about yourself {optional}</span>
        <textarea
          rows={4}
          maxLength={3000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. we run two clinics in Lucknow and want more local patients"
          className={cn(input, "min-h-28 py-2.5", invalid("aboutYou"))}
        />
        {fieldError("aboutYou")}
      </label>

      <div>
        <Turnstile ref={turnstileRef} siteKey={TURNSTILE_SITE_KEY} onToken={setCaptchaToken} />
        {fieldError("captchaToken")}
      </div>

      {errors.form && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{errors.form}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={sending} className={ctaButton}>
          {sending ? "Sending…" : "Send Message"}
        </button>
        <p className="text-[13px] text-text-muted">
          Prefer email? Write to us at{" "}
          <a href={`mailto:${PACKAGE_CONTACT.email}`} className="font-medium text-primary-text hover:underline">
            {PACKAGE_CONTACT.email}
          </a>
          .
        </p>
      </div>
    </form>
  );
}
