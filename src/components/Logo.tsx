import { useId } from "react";
import { cn } from "@/lib/utils";

/*
 * The mark: a rounded tile in the signature gradient holding a white roof
 * chevron with a dot beneath the peak — everything under one roof.
 * Geometry is on a 32×32 grid and shared with the favicon / app icon / OG image.
 */
export const LOGO_GRADIENT_STOPS = ["#5B5BF0", "#8B5CF6", "#22D3EE"] as const;
export const LOGO_GRADIENT_CSS = `linear-gradient(135deg, ${LOGO_GRADIENT_STOPS[0]} 0%, ${LOGO_GRADIENT_STOPS[1]} 50%, ${LOGO_GRADIENT_STOPS[2]} 100%)`;
export const LOGO_ROOF_PATH = "M8.5 17.5 L16 10 L23.5 17.5";
export const LOGO_DOT = { cx: 16, cy: 20.5, r: 2 } as const;
export const LOGO_STROKE = 2.75;
/** Tile corner radius as a fraction of the tile size. */
export const LOGO_TILE_RADIUS = 0.28;

/** White roof + dot only, for drawing on top of a gradient tile (icons, OG). */
export function LogoGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d={LOGO_ROOF_PATH}
        stroke="#FFFFFF"
        strokeWidth={LOGO_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill="#FFFFFF" />
    </svg>
  );
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId();
  const gradientId = `logo-gradient-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("flex-shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LOGO_GRADIENT_STOPS[0]} />
          <stop offset="0.5" stopColor={LOGO_GRADIENT_STOPS[1]} />
          <stop offset="1" stopColor={LOGO_GRADIENT_STOPS[2]} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx={32 * LOGO_TILE_RADIUS} fill={`url(#${gradientId})`} />
      {/* Hairline inner edge keeps the tile crisp on both light and dark backgrounds. */}
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx={32 * LOGO_TILE_RADIUS - 0.5}
        stroke="#FFFFFF"
        strokeOpacity="0.18"
      />
      <path
        d={LOGO_ROOF_PATH}
        stroke="#FFFFFF"
        strokeWidth={LOGO_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill="#FFFFFF" />
    </svg>
  );
}

interface LogoProps {
  /** Height of the mark in px; the wordmark scales with it. */
  size?: number;
  variant?: "full" | "mark";
  className?: string;
}

export default function Logo({ size = 32, variant = "full", className }: LogoProps) {
  if (variant === "mark") return <LogoMark size={size} className={className} />;

  return (
    <span className={cn("inline-flex min-w-0 items-center", className)} style={{ gap: size * 0.32 }}>
      <LogoMark size={size} />
      <span className="flex min-w-0 items-baseline whitespace-nowrap leading-none" style={{ gap: size * 0.17 }}>
        <span className="font-display font-bold tracking-[-0.02em] text-text" style={{ fontSize: size * 0.6 }}>
          OneRoof
        </span>
        <span className="logo-sub font-sans font-medium text-text-muted" style={{ fontSize: size * 0.6 }}>
          Ventures
        </span>
      </span>
    </span>
  );
}
