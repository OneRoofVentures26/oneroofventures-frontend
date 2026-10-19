import { ImageResponse } from "next/og";
import { loadBrandFonts, OG_DISPLAY_FONT, OG_SANS_FONT } from "@/lib/og-fonts";
import { OgWordmark, WORDMARK_DISPLAY_TEXT, WORDMARK_SANS_TEXT } from "@/lib/og-wordmark";

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

export default async function OpengraphImage() {
  const fonts = await loadBrandFonts(`${WORDMARK_DISPLAY_TEXT}${HEADLINE}`, `${WORDMARK_SANS_TEXT}${SUBLINE}${DOMAIN}`);

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
        <OgWordmark size={64} color={TEXT} subColor={MUTED} />

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
