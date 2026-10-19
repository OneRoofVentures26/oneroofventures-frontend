import { ImageResponse } from "next/og";
import { LOGO_NAVY } from "@/components/Logo";
import { loadBrandFonts } from "@/lib/og-fonts";
import { OgWordmark, WORDMARK_DISPLAY_TEXT, WORDMARK_SANS_TEXT, WORDMARK_WIDTH_EM } from "@/lib/og-wordmark";

/*
 * Favicon: the full ridge wordmark on cream, as on the site header. Rendered
 * at 192px so it stays crisp on high-density screens; browsers scale it down.
 * src/app/favicon.ico is generated from this image.
 */
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

const CREAM = "#F4EADF";
const INK = "#1F1F1F";

export default async function Icon() {
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
          borderRadius: 192 * 0.2,
        }}
      >
        <OgWordmark size={(192 * 0.9) / WORDMARK_WIDTH_EM} color={INK} subColor={LOGO_NAVY} align="center" />
      </div>
    ),
    { ...size, fonts },
  );
}
