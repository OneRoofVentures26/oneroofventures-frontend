import { cn } from "@/lib/utils";

/*
 * Shared component classes. Radius: cards 16px, inputs and buttons 12px,
 * chips fully rounded, badges 8px. Interactive elements keep a 44px tap
 * target. Colours come only from the theme tokens in globals.css.
 */

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-brand active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

/** Iris fill — the default action. */
export const primaryButton = cn(
  buttonBase,
  "bg-primary text-primary-fg shadow-[0_1px_2px_rgb(0_0_0/0.1),inset_0_1px_0_rgb(255_255_255/0.16)] hover:bg-primary-hover",
);

/** Bordered surface button — alternate actions next to a primary. */
export const secondaryButton = cn(
  buttonBase,
  "border border-border bg-surface text-text shadow-card hover:border-primary/40 hover:text-primary-text",
);

/** Quiet text button for tertiary actions. */
export const ghostButton = cn(buttonBase, "text-text-muted hover:bg-surface-raised hover:text-text");

/** The single most important action on a page: iris fill with a gradient border on hover. */
export const ctaButton = cn(primaryButton, "gradient-ring");

/** Inline text link. */
export const textLink =
  "font-semibold text-primary-text underline-offset-4 transition-colors duration-200 hover:underline";

/** Selectable filter / answer chip. Selected chips fill with iris and grow slightly. */
export function chip(selected = false) {
  return cn(
    "inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-[color,background-color,border-color,transform] duration-200 ease-brand active:scale-[0.98] lg:min-h-10",
    selected
      ? "scale-[1.03] border-primary bg-primary text-primary-fg"
      : "border-border bg-surface text-text hover:border-primary/50 hover:text-primary-text",
  );
}

/** Static, non-interactive label (e.g. an agency's services). */
export const tag =
  "inline-flex items-center rounded-full border border-border bg-surface-raised px-2.5 py-0.5 text-xs font-medium text-text-muted";

/** Small status badge, 8px radius. */
export const badge = "inline-flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold";

/** Mint — Verified and positive states. */
export const successBadge = cn(badge, "bg-success/12 text-success-text ring-1 ring-inset ring-success/25");

/** Saffron — ratings and the OneRoof Score only. */
export const accentBadge = cn(badge, "bg-accent/14 text-accent-text ring-1 ring-inset ring-accent/30");

/** Iris — neutral emphasis, e.g. "Recommended". */
export const primaryBadge = cn(badge, "bg-primary/10 text-primary-text ring-1 ring-inset ring-primary/25");

/** @deprecated Legacy name used by the Verified badge until it is restyled. */
export const brassTag = successBadge;

/** Text input / select / textarea. 16px text so iOS doesn't zoom. */
export const input =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-base text-text shadow-card transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-4 focus:ring-ring/20";

/** Standard card surface. */
export const card = "rounded-2xl border border-border bg-surface shadow-card";

/** Card that lifts 2px on hover. */
export const interactiveCard = cn(
  card,
  "transition-[transform,box-shadow,border-color] duration-200 ease-brand hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover",
);

/** Frosted glass panel (quiz, navbar, overlays). */
export const glassPanel = "glass rounded-2xl border border-border shadow-raised";

/** Small sentence-case label above a heading. */
export const eyebrow = "inline-flex items-center gap-2 text-sm font-medium text-primary-text";

export const sectionTitle = "font-display text-section-sm font-semibold text-text md:text-section";
