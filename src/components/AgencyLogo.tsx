"use client";

import { useState } from "react";
import { cn, initials } from "@/lib/utils";

/**
 * An agency's logo in a fixed wide box (about 2.5:1), or its initials in the
 * same box when there is no logo or it fails to load. Logos are square icons
 * or wide wordmarks, often dark on transparent, so they're contained with
 * padding on a white tile (also in dark mode), never cropped.
 * `className` sets the size and corner radius, e.g. "h-12 w-[120px] rounded-lg".
 */
export default function AgencyLogo({
  name,
  logoUrl,
  className,
  initialsClassName = "text-sm",
}: {
  name: string;
  logoUrl: string | null;
  className?: string;
  /** Text size of the initials fallback. */
  initialsClassName?: string;
}) {
  // Remember which URL failed, so a new URL (changed logo) is tried again.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!logoUrl || failedUrl === logoUrl) {
    return (
      <span
        className={cn(
          "flex flex-shrink-0 items-center justify-center bg-primary/8 font-display font-bold text-primary-text",
          initialsClassName,
          className,
        )}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // A plain <img>: logos are any of PNG, JPEG, WebP, SVG, ICO or GIF from Supabase Storage.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      onError={() => setFailedUrl(logoUrl)}
      className={cn("flex-shrink-0 border border-border bg-white object-contain p-1", className)}
    />
  );
}
