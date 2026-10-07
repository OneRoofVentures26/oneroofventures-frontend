import { ImageResponse } from "next/og";
import { LOGO_GRADIENT_CSS, LOGO_TILE_RADIUS, LogoGlyph } from "@/components/Logo";
import { loadBrandFonts } from "@/lib/og-fonts";

export const alt = "OneRoof Ventures — compare marketing agencies city by city";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE = "Find the right marketing agency, city by city.";
const SUBLINE = "Compare agencies on real, published prices and packages.";
const DOMAIN = "oneroofventures.com";

// Dark-theme palette (OG images can't read CSS variables).
const BG = "#0B0D17";
const TEXT = "#EEF0FA";
const MUTED = "#9AA1BD";

export default async function OpengraphImage() {
  const fonts = await loadBrandFonts(`OneRoof${HEADLINE}`, `Ventures${SUBLINE}${DOMAIN}`);

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
            "radial-gradient(circle at 85% 10%, rgba(91,91,240,0.45), transparent 45%), radial-gradient(circle at 100% 70%, rgba(34,211,238,0.22), transparent 40%)",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: LOGO_GRADIENT_CSS,
              borderRadius: 88 * LOGO_TILE_RADIUS,
            }}
          >
            <LogoGlyph size={88} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, fontSize: 52 }}>
            <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, color: TEXT, letterSpacing: -1 }}>OneRoof</span>
            <span style={{ fontFamily: "Inter", fontWeight: 500, color: MUTED }}>Ventures</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 68, color: TEXT, lineHeight: 1.08, letterSpacing: -1.5 }}
          >
            {HEADLINE}
          </span>
          <span style={{ fontFamily: "Inter", fontSize: 30, color: MUTED, marginTop: 20 }}>{SUBLINE}</span>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 24,
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: 26,
            color: "#7C7CFF",
          }}
        >
          {DOMAIN}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
