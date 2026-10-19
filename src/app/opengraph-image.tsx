import { ImageResponse } from "next/og";
import { LOGO_ORANGE } from "@/components/Logo";
import { loadBrandFonts, OG_DISPLAY_FONT, OG_SANS_FONT } from "@/lib/og-fonts";

export const alt = "OneRoof Ventures — compare marketing agencies city by city";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE = "Find the right marketing agency, city by city.";
const SUBLINE = "Compare agencies on real, published prices and packages.";
const DOMAIN = "oneroofventures.com";

// Brand navy panel (OG images can't read CSS variables).
const BG = "#0E3655";
const TEXT = "#F4EADF";
const MUTED = "#CDBBA6";
const ORANGE = "#FE7522";

// Wordmark sizing. ROOF_TOP puts the roof just above the o's for Source Serif 4 at this size.
const WORD_SIZE = 64;
const ROOF_WIDTH = WORD_SIZE * 1.42;
const ROOF_TOP = -WORD_SIZE * 0.2;

export default async function OpengraphImage() {
  const fonts = await loadBrandFonts(`OneRoof${HEADLINE}`, `VENTURES${SUBLINE}${DOMAIN}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          backgroundImage:
            "radial-gradient(circle at 90% 115%, rgba(254,117,34,0.6), transparent 55%)",
          padding: "72px 80px",
        }}
      >
        {/* The ridge wordmark: a roof over the o's of "Roof", VENTURES spaced below. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", alignSelf: "flex-start" }}>
          <div
            style={{
              display: "flex",
              fontFamily: OG_DISPLAY_FONT,
              fontWeight: 700,
              fontSize: WORD_SIZE,
              lineHeight: 1,
              color: TEXT,
            }}
          >
            <span>OneR</span>
            <div style={{ display: "flex", position: "relative" }}>
              <span>oo</span>
              <svg
                width={ROOF_WIDTH}
                height={ROOF_WIDTH * 0.3}
                viewBox="0 0 100 30"
                style={{ position: "absolute", left: -WORD_SIZE * 0.16, top: ROOF_TOP }}
              >
                <path d="M5 25 L50 5 L95 25" fill="none" stroke={LOGO_ORANGE} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>f</span>
          </div>
          <span
            style={{
              fontFamily: OG_SANS_FONT,
              fontWeight: 500,
              fontSize: WORD_SIZE * 0.3,
              letterSpacing: WORD_SIZE * 0.3 * 0.42,
              color: MUTED,
              marginTop: WORD_SIZE * 0.3,
              alignSelf: "center",
            }}
          >
            VENTURES
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{ fontFamily: OG_DISPLAY_FONT, fontWeight: 700, fontSize: 68, color: TEXT, lineHeight: 1.08, letterSpacing: -1.5 }}
          >
            {HEADLINE}
          </span>
          <span style={{ fontFamily: OG_SANS_FONT, fontSize: 30, color: MUTED, marginTop: 20 }}>{SUBLINE}</span>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid rgba(232,213,191,0.16)",
            paddingTop: 24,
            fontFamily: OG_SANS_FONT,
            fontWeight: 500,
            fontSize: 26,
            color: ORANGE,
          }}
        >
          {DOMAIN}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
