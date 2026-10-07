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

/** Fade-and-rise used the first time a section scrolls into view. `custom` is a delay in seconds. */
export const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE, delay },
  }),
};

/** Spring for things that slide in from an edge (compare bar, mobile menu). */
export const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.9 } as const;
