import { LOGO_ORANGE } from "@/components/Logo";
import { OG_DISPLAY_FONT, OG_SANS_FONT } from "@/lib/og-fonts";

/*
 * The ridge wordmark for ImageResponse (OG image, favicon, app icon), which
 * can't use CSS classes. Mirrors <Logo>: OneRoof with an orange roof over the
 * o's, VENTURES letter-spaced underneath. Needs the fonts from loadBrandFonts
 * with WORDMARK_DISPLAY_TEXT / WORDMARK_SANS_TEXT included.
 */

export const WORDMARK_DISPLAY_TEXT = "OneRoof";
export const WORDMARK_SANS_TEXT = "VENTURES";

/** "OneRoof" is about this many times its font size wide in Source Serif 4 Bold. */
export const WORDMARK_WIDTH_EM = 4.35;

export function OgWordmark({
  size,
  color,
  subColor,
  align = "flex-start",
}: {
  /** Font size of "OneRoof" in px. */
  size: number;
  color: string;
  subColor: string;
  align?: "flex-start" | "center";
}) {
  const roofWidth = size * 1.42;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align, alignSelf: align }}>
      <div
        style={{
          display: "flex",
          fontFamily: OG_DISPLAY_FONT,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1,
          color,
          // Room for the roof, which rises above the letters.
          paddingTop: size * 0.24,
        }}
      >
        <span>OneR</span>
        <div style={{ display: "flex", position: "relative" }}>
          <span>oo</span>
          <svg
            width={roofWidth}
            height={roofWidth * 0.3}
            viewBox="0 0 100 30"
            style={{ position: "absolute", left: -size * 0.16, top: -size * 0.2 }}
          >
            <path
              d="M5 25 L50 5 L95 25"
              fill="none"
              stroke={LOGO_ORANGE}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span>f</span>
      </div>
      <span
        style={{
          fontFamily: OG_SANS_FONT,
          fontWeight: 500,
          fontSize: size * 0.3,
          letterSpacing: size * 0.3 * 0.42,
          // Letter-spacing adds trailing space; pull it back so VENTURES centres.
          marginRight: -size * 0.3 * 0.42,
          color: subColor,
          marginTop: size * 0.3,
          alignSelf: "center",
        }}
      >
        {WORDMARK_SANS_TEXT}
      </span>
    </div>
  );
}
