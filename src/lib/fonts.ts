import { Source_Serif_4 } from "next/font/google";

/*
 * The only place fonts are configured.
 *
 * - Primary (Sitka): headings, prices, scores and stats — `font-display`.
 *   Sitka ships with Windows; elsewhere Source Serif 4 (loaded here) stands
 *   in, as the closest open serif.
 * - Secondary (Helvetica): body and UI text — `font-sans`. A system font on
 *   Apple devices; Arial (metrically identical) everywhere else.
 *
 * The stacks themselves live in globals.css (`--font-display`, `--font-sans`).
 */

export const sitkaFallback = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display-fallback",
  display: "swap",
});

/** Apply on <html> so the CSS variables are available everywhere. */
export const fontVariables = sitkaFallback.variable;
