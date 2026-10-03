"use client";

import { useState } from "react";
import type { Agency, Service } from "@/lib/types";
import { ALL_SERVICES } from "@/lib/types";

interface QuoteRequestFormProps {
  agencies: Agency[];
  onRemoveAgency?: (id: string) => void;
}

const BUDGET_OPTIONS = [
  "Under ₹50,000/mo",
  "₹50,000 – ₹1.5L/mo",
  "₹1.5L – ₹3L/mo",
  "₹3L – ₹6L/mo",
  "₹6L+/mo",
];

export default function QuoteRequestForm({ agencies, onRemoveAgency }: QuoteRequestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [servicesNeeded, setServicesNeeded] = useState<Service[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function toggleService(s: Service) {
    setServicesNeeded((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (agencies.length === 0) return;
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 700);
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent-light p-6 text-center">
        <p className="text-base font-bold text-accent-dark">Quote request sent!</p>
        <p className="mt-2 text-sm text-ink-soft">
          We&apos;ve forwarded your brief to {agencies.length}{" "}
          {agencies.length === 1 ? "agency" : "agencies"}. Expect replies within
          their stated response time.
        </p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {agencies.map((a) => (
            <li key={a.id} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink">
              {a.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Sending to
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {agencies.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink"
            >
              {a.name}
              {onRemoveAgency && (
                <button
                  type="button"
                  onClick={() => onRemoveAgency(a.id)}
                  aria-label={`Remove ${a.name}`}
                  className="text-ink-soft hover:text-danger"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink">Your name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Phone</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Monthly budget</label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Services needed</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_SERVICES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => toggleService(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                servicesNeeded.includes(s)
                  ? "border-accent bg-accent-light text-accent-dark"
                  : "border-border text-ink-soft hover:border-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink">Tell us about your project</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you trying to achieve? Timeline, goals, anything agencies should know."
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={agencies.length === 0 || status === "sending"}
        className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : `Send quote request to ${agencies.length || ""} agenc${agencies.length === 1 ? "y" : "ies"}`}
      </button>
    </form>
  );
}
