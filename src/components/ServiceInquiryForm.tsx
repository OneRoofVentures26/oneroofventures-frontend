"use client";

import { useState } from "react";

const BUDGET_OPTIONS = [
  "Under ₹50,000/mo",
  "₹50,000 – ₹1.2L/mo",
  "₹1.2L – ₹2.5L/mo",
  "₹2.5L+/mo",
];

export default function ServiceInquiryForm({ services }: { services: string[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
  const [message, setMessage] = useState("");
  const [servicesNeeded, setServicesNeeded] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function toggleService(s: string) {
    setServicesNeeded((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 700);
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent-light p-6 text-center">
        <p className="text-base font-bold text-accent-dark">Thanks, {name || "there"}!</p>
        <p className="mt-2 text-sm text-ink-soft">
          Our team will reach out within one business day to talk through the
          right package for you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          <label className="text-sm font-medium text-ink">Business name</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
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
        <label className="text-sm font-medium text-ink">Services you need</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {services.map((s) => (
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
        <label className="text-sm font-medium text-ink">Tell us about your business</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you trying to achieve this quarter?"
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Talk to our team"}
      </button>
    </form>
  );
}
