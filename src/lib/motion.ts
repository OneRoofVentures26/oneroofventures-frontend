/*
 * Shared motion values. Interface feedback 150–250ms, entrances 400–600ms,
 * one easing curve everywhere. Animate transform and opacity only.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.15,
  ui: 0.22,
  enter: 0.5,
} as const;

/**
 * Scroll reveal: starts as soon as an element enters the viewport (8% above the
 * bottom edge), rises 8px over 350ms. Used by <Reveal>.
 */
export const REVEAL_VIEWPORT = { once: true, amount: 0, margin: "0px 0px -8% 0px" } as const;

/** Spring for things that slide in from an edge (compare bar, mobile menu). */
export const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;
