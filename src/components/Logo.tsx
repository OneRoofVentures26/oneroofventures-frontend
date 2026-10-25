import { cn } from "@/lib/utils";

/*
 * The "ridge" wordmark: OneRoof with a roof line over the two o's of "Roof",
 * and VENTURES letter-spaced underneath. It is live text, so it uses the site
 * fonts (Sitka for OneRoof, Helvetica for VENTURES) and the theme tokens: ink
 * or cream for the name depending on the panel, brand orange for the roof.
 *
 * The square mark (mobile menu) is the same idea on a navy tile: an orange
 * roof over two cream o's, on a 32×32 grid. The favicon, app icon and OG
 * image draw the full wordmark instead (src/lib/og-wordmark.tsx).
 */

export const LOGO_ORANGE = "#FE7522";
export const LOGO_NAVY = "#0E3655";
export const LOGO_CREAM = "#F4EADF";
/** Tile corner radius as a fraction of the tile size. */
export const LOGO_TILE_RADIUS = 0.26;

/** Roof chevron for the wordmark, drawn in a 100×30 box. */
const WORD_ROOF_PATH = "M5 25 L50 5 L95 25";

/** Mark geometry (32×32): roof plus two o's. */
const MARK_ROOF_PATH = "M6.5 14 L16 7.5 L25.5 14";
const MARK_O = { r: 3.7, cy: 20.5, cx: [11.6, 20.4], stroke: 2.5 } as const;
const MARK_ROOF_STROKE = 2.6;

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("flex-shrink-0", className)}
    >
      <rect width="32" height="32" rx={32 * LOGO_TILE_RADIUS} fill={LOGO_NAVY} />
      <path
        d={MARK_ROOF_PATH}
        stroke={LOGO_ORANGE}
        strokeWidth={MARK_ROOF_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {MARK_O.cx.map((cx) => (
        <circle key={cx} cx={cx} cy={MARK_O.cy} r={MARK_O.r} stroke={LOGO_CREAM} strokeWidth={MARK_O.stroke} />
      ))}
    </svg>
  );
}

/** The roof over "oo". Sits on the o's (see `.logo-oo` in globals.css). */
function Roof() {
  return (
    <svg
      viewBox="0 0 100 30"
      fill="none"
      aria-hidden="true"
      className="logo-roof pointer-events-none absolute"
    >
      <path
        d={WORD_ROOF_PATH}
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  /** Rough height of the wordmark in px (name plus VENTURES). */
  size?: number;
  variant?: "full" | "mark";
  className?: string;
}

export default function Logo({ size = 32, variant = "full", className }: LogoProps) {
  if (variant === "mark") return <LogoMark size={size} className={className} />;

  const nameSize = size * 0.78;

  return (
    <span
      role="img"
      aria-label="OneRoof Ventures"
      className={cn("logo inline-flex flex-shrink-0 flex-col items-center leading-none", className)}
      // Room for the roof, which rises above the letters, so the logo centres as a whole.
      style={{ paddingTop: nameSize * 0.24 }}
    >
      <span
        aria-hidden="true"
        className="whitespace-nowrap font-display font-bold tracking-[-0.01em] text-text"
        style={{ fontSize: nameSize }}
      >
        OneR
        <span className="logo-oo relative inline-block">
          oo
          <span className="text-orange">
            <Roof />
          </span>
        </span>
        f
      </span>
      <span
        aria-hidden="true"
        className="logo-sub mt-[0.35em] whitespace-nowrap font-sans font-semibold uppercase text-logo-sub"
        // Big enough to read on phones (about 12px in the header), with tighter tracking so the width stays close.
        style={{ fontSize: Math.max(11, nameSize * 0.38), letterSpacing: "0.3em", marginRight: "-0.3em" }}
      >
        Ventures
      </span>
    </span>
  );
}
