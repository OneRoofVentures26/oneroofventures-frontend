/**
 * TrueType fonts for ImageResponse (it can't use next/font or woff2). Fetched
 * from Google Fonts at build time; a failed fetch falls back to the default
 * font rather than failing the build.
 */
type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" };

async function loadGoogleFont(family: string, weight: OgFont["weight"], text: string): Promise<OgFont | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    if (!res.ok) return null;
    return { name: family, data: await res.arrayBuffer(), weight, style: "normal" };
  } catch {
    return null;
  }
}

/**
 * Sitka and Helvetica can't be fetched, so the OG image uses their closest
 * open stand-ins: Source Serif 4 700 for headings, Arimo (Helvetica metrics)
 * 400/500 for body text.
 */
export const OG_DISPLAY_FONT = "Source Serif 4";
export const OG_SANS_FONT = "Arimo";

export async function loadBrandFonts(displayText: string, sansText: string): Promise<OgFont[]> {
  const fonts = await Promise.all([
    loadGoogleFont(OG_DISPLAY_FONT, 700, displayText),
    loadGoogleFont(OG_SANS_FONT, 400, sansText),
    loadGoogleFont(OG_SANS_FONT, 500, sansText),
  ]);
  return fonts.filter((f): f is OgFont => f !== null);
}
