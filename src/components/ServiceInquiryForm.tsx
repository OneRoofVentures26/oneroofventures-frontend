"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PACKAGE_CONTACT, PACKAGES, type PackageKey } from "@/lib/packages";
import { chip, ctaButton, input, secondaryButton } from "@/lib/styles";
import { cn, formatINR } from "@/lib/utils";

/*
 * Enquiry for our own packages. There is no backend endpoint for these, so
 * the enquiry is handed to WhatsApp (pre-written message to our number), with
 * email as the alternative. Nothing is pretended to be "sent" on our side.
 */

type Choice = PackageKey | "unsure";

const CHOICES: Array<{ key: Choice; label: string }> = [
  ...PACKAGES.map((p) => ({ key: p.key as Choice, label: `${p.name} · ${formatINR(p.monthly)}/mo` })),
  { key: "unsure", label: "Not sure yet" },
];

function isChoice(value: string | null): value is Choice {
  return value === "unsure" || PACKAGES.some((p) => p.key === value);
}

const labelClass = "text-sm font-medium text-text";

export default function ServiceInquiryForm() {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("package");
  const [choice, setChoice] = useState<Choice | null>(null);
  // A package button on the page (?package=growth) preselects it until the visitor picks one.
  const selected: Choice = choice ?? (isChoice(fromUrl) ? fromUrl : "unsure");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [handedOff, setHandedOff] = useState(false);

  const packageLabel = CHOICES.find((c) => c.key === selected)?.label ?? "Not sure yet";
  const body = [
    "Hi OneRoof Ventures, I'd like to talk about your marketing packages.",
    "",
    `Name: ${name.trim()}`,
    `Phone: ${phone.trim()}`,
    ...(business.trim() ? [`Business: ${business.trim()}`] : []),
    `Package: ${packageLabel}`,
    ...(message.trim() ? ["", message.trim()] : []),
  ].join("\n");

  const whatsappHref = `https://wa.me/${PACKAGE_CONTACT.whatsapp}?text=${encodeURIComponent(body)}`;
  // Gmail's web composer rather than mailto:, which silently does nothing when
  // the visitor has no desktop mail app set up.
  const mailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(PACKAGE_CONTACT.email)}&su=${encodeURIComponent(
    `Marketing package enquiry — ${business.trim() || name.trim() || "new lead"}`,
  )}&body=${encodeURIComponent(body)}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
    setHandedOff(true);
  }

  if (handedOff) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-5 py-8 text-center">
        <p className="font-display text-2xl font-semibold text-text">Almost done, {name.trim() || "there"}</p>
        <p className="mx-auto mt-2 max-w-[48ch] text-sm text-text-muted">
          WhatsApp has opened with your message ready — press send there and we&apos;ll reply within one
          business day. Didn&apos;t open, or prefer email?
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={ctaButton}>
            Open WhatsApp again
          </a>
          <a href={mailHref} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
            Send by email instead
          </a>
        </div>
        <button
          type="button"
          onClick={() => setHandedOff(false)}
          className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-text-muted hover:text-primary-text"
        >
          ← Edit details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
        </label>
        <label className="grid gap-1.5">
          <span className={labelClass}>Phone / WhatsApp</span>
          <input
            required
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            pattern="[0-9+\s\-()]{8,}"
            title="A phone number, e.g. +91 98765 43210"
            className={input}
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className={labelClass}>
          Business name <span className="font-normal text-text-muted">(optional)</span>
        </span>
        <input value={business} onChange={(e) => setBusiness(e.target.value)} autoComplete="organization" className={input} />
      </label>

      <label className="grid gap-1.5">
        <span className={labelClass}>
          What are you looking to achieve? <span className="font-normal text-text-muted">(optional)</span>
        </span>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. more leads for our clinic in Lucknow, around ₹20k/month ad budget"
          className={cn(input, "min-h-28 py-2.5")}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className={ctaButton}>
          Send on WhatsApp
        </button>
        <p className="text-[13px] text-text-muted">
          Opens WhatsApp with your message ready to send. Prefer email?{" "}
          <a href={mailHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-text hover:underline">
            Email us instead
          </a>
          .
        </p>
      </div>
    </form>
  );
}
