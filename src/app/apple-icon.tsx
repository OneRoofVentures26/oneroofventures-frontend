import { ImageResponse } from "next/og";
import { LOGO_GRADIENT_CSS, LogoGlyph } from "@/components/Logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS masks the corners itself, so this is a full-bleed square.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: LOGO_GRADIENT_CSS,
        }}
      >
        <LogoGlyph size={150} />
      </div>
    ),
    { ...size },
  );
}
