import { ImageResponse } from "next/og";
import { LOGO_NAVY } from "@/components/Logo";
import { loadBrandFonts } from "@/lib/og-fonts";
import { OgWordmark, WORDMARK_DISPLAY_TEXT, WORDMARK_SANS_TEXT, WORDMARK_WIDTH_EM } from "@/lib/og-wordmark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const CREAM = "#F4EADF";
const INK = "#1F1F1F";

// iOS masks the corners itself, so this is a full-bleed square with a little more margin.
export default async function AppleIcon() {
  const fonts = await loadBrandFonts(WORDMARK_DISPLAY_TEXT, WORDMARK_SANS_TEXT);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
        }}
      >
        <OgWordmark size={(180 * 0.82) / WORDMARK_WIDTH_EM} color={INK} subColor={LOGO_NAVY} align="center" />
      </div>
    ),
    { ...size, fonts },
  );
}
