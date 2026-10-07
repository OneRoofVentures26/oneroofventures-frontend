import type { Metadata } from "next";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import {
  accentBadge,
  card,
  chip,
  ctaButton,
  ghostButton,
  glassPanel,
  input,
  interactiveCard,
  primaryBadge,
  primaryButton,
  secondaryButton,
  successBadge,
  tag,
  textLink,
} from "@/lib/styles";
import { cn } from "@/lib/utils";
import TokenSwatch from "./TokenSwatch";

export const metadata: Metadata = {
  title: "Styleguide | OneRoof Ventures",
  robots: { index: false, follow: false },
};

const COLOURS: Array<{ token: string; role: string; className: string }> = [
  { token: "bg", role: "Page background", className: "bg-bg" },
  { token: "surface", role: "Cards, panels", className: "bg-surface" },
  { token: "surface-raised", role: "Raised surfaces", className: "bg-surface-raised shadow-raised" },
  { token: "border", role: "1px borders", className: "bg-border" },
  { token: "text", role: "Primary text", className: "bg-text" },
  { token: "text-muted", role: "Secondary text", className: "bg-text-muted" },
  { token: "primary", role: "Iris — fills", className: "bg-primary" },
  { token: "primary-hover", role: "Iris hover", className: "bg-primary-hover" },
  { token: "primary-text", role: "Iris — text and links", className: "bg-primary-text" },
  { token: "accent", role: "Saffron — ratings, score", className: "bg-accent" },
  { token: "success", role: "Mint — Verified", className: "bg-success" },
  { token: "ring", role: "Focus ring", className: "bg-ring" },
];

const TYPE_SCALE = [
  { label: "Hero · 56 / 34", className: "font-display text-hero-sm font-bold lg:text-hero", sample: "Find the right agency" },
  { label: "Section title · 32 / 24", className: "font-display text-section-sm font-semibold md:text-section", sample: "How it works" },
  { label: "Card title · 18", className: "font-display text-card font-semibold", sample: "Pixelwave Studio" },
  { label: "Body · 16 / 1.6", className: "text-base text-text", sample: "Compare agencies on real, published prices and packages." },
  { label: "Small · 14", className: "text-sm text-text-muted", sample: "Agency data is reviewed and refreshed regularly." },
  { label: "Numbers · tabular", className: "num text-section-sm font-bold", sample: "₹18,000 · ₹1,25,000 · 9.4" },
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="text-sm font-semibold tracking-normal text-text-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ThemePanel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className={cn(theme, "min-w-0 rounded-3xl border border-border bg-bg p-5 text-text sm:p-8")}>
      <p className="font-display text-card font-semibold">{theme === "light" ? "Light theme" : "Dark theme"}</p>

      <div className="mt-6 space-y-10">
        <Block title="Logo">
          <div className="flex flex-wrap items-center gap-6">
            <Logo size={36} />
            <Logo size={28} />
            <Logo size={40} variant="mark" />
            <Logo size={28} variant="mark" />
            <Logo size={16} variant="mark" />
          </div>
        </Block>

        <Block title="Colours">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {COLOURS.map((c) => (
              <TokenSwatch key={c.token} {...c} />
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-11 w-24 rounded-xl bg-gradient-brand" />
            <div>
              <p className="font-mono text-sm font-medium">gradient</p>
              <p className="text-xs text-text-muted">Logo, hero glow, CTA hover border, one number</p>
            </div>
          </div>
        </Block>

        <Block title="Type scale">
          <div className="space-y-5">
            {TYPE_SCALE.map((t) => (
              <div key={t.label}>
                <p className="text-xs text-text-muted">{t.label}</p>
                <p className={cn("mt-1", t.className)}>{t.sample}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-text-muted">Highlighted number</p>
              <p className="num mt-1 text-5xl font-bold">
                <span className="text-gradient">248</span>
              </p>
            </div>
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap gap-3">
            <button type="button" className={ctaButton}>Primary CTA</button>
            <button type="button" className={primaryButton}>Primary</button>
            <button type="button" className={secondaryButton}>Secondary</button>
            <button type="button" className={ghostButton}>Ghost</button>
            <button type="button" className={primaryButton} disabled>Disabled</button>
          </div>
          <p className="mt-4 text-sm">
            <a href="#" className={textLink}>Text link</a>
            <span className="text-text-muted"> · hover the primary CTA for the gradient border</span>
          </p>
        </Block>

        <Block title="Chips">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(false)}>SEO</button>
            <button type="button" className={chip(true)} aria-pressed="true">Social media</button>
            <button type="button" className={chip(false)}>Google Ads</button>
            <button type="button" className={chip(false)}>Website</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={tag}>SEO</span>
            <span className={tag}>Performance marketing</span>
          </div>
        </Block>

        <Block title="Inputs">
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium">
              Business name
              <input className={input} placeholder="e.g. Sharma Textiles" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Monthly budget
              <select className={input} defaultValue="">
                <option value="" disabled>Choose a budget</option>
                <option>Under ₹25k</option>
                <option>Under ₹50k</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              What do you need?
              <textarea className={cn(input, "min-h-24 py-2.5")} placeholder="Tell agencies about your goals" />
            </label>
          </div>
        </Block>

        <Block title="Badges">
          <div className="flex flex-wrap items-center gap-2">
            <span className={successBadge}>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-7" />
              </svg>
              Verified
            </span>
            <span className={cn(accentBadge, "num")}>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M10 1.8l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L10 14.5l-5.1 2.7 1.1-5.6L1.8 7.7l5.7-.7L10 1.8z" />
              </svg>
              9.4
            </span>
            <span className={primaryBadge}>Recommended</span>
          </div>
        </Block>

        <Block title="Cards">
          <div className="grid gap-4">
            <div className={cn(card, "p-5")}>
              <p className="font-display text-card font-semibold">Card</p>
              <p className="mt-1 text-sm text-text-muted">Surface, 16px radius, 1px border.</p>
            </div>
            <a href="#" className={cn(interactiveCard, "block p-5")}>
              <p className="font-display text-card font-semibold">Interactive card</p>
              <p className="mt-1 text-sm text-text-muted">Lifts 2px on hover.</p>
            </a>
            <div className="relative overflow-hidden rounded-2xl">
              <div aria-hidden="true" className="aurora -right-20 -top-20 h-60 w-80" />
              <div className={cn(glassPanel, "relative p-5")}>
                <p className="font-display text-card font-semibold">Glass panel</p>
                <p className="mt-1 text-sm text-text-muted">Quiz, navbar and overlays.</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="shimmer h-4 w-2/3 rounded-md" />
              <div className="shimmer h-4 w-1/2 rounded-md" />
            </div>
          </div>
        </Block>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-section-sm font-bold md:text-section">Styleguide</h1>
          <p className="mt-2 max-w-[60ch] text-base text-text-muted">
            Tokens and components in both themes. The panels are pinned to light
            and dark; the rest of the page follows the site theme.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ThemePanel theme="light" />
        <ThemePanel theme="dark" />
      </div>
    </div>
  );
}
