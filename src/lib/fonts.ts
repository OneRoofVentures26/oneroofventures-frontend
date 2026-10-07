import { Inter, Space_Grotesk } from "next/font/google";

/*
 * The only place fonts are loaded. Headings, prices, scores and stats use
 * Space Grotesk (`font-display`); body and UI text use Inter (`font-sans`).
 */

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

/** Apply on <html> so the CSS variables are available everywhere. */
export const fontVariables = `${inter.variable} ${spaceGrotesk.variable}`;
