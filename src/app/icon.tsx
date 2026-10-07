import { ImageResponse } from "next/og";
import { LOGO_GRADIENT_CSS, LOGO_TILE_RADIUS, LogoGlyph } from "@/components/Logo";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 64 * LOGO_TILE_RADIUS,
        }}
      >
        <LogoGlyph size={64} />
      </div>
    ),
    { ...size },
  );
}
