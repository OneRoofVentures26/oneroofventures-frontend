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

/** Space Grotesk 700 for headings, Inter 400/500 for body text. */
export async function loadBrandFonts(displayText: string, sansText: string): Promise<OgFont[]> {
  const fonts = await Promise.all([
    loadGoogleFont("Space Grotesk", 700, displayText),
    loadGoogleFont("Inter", 400, sansText),
    loadGoogleFont("Inter", 500, sansText),
  ]);
  return fonts.filter((f): f is OgFont => f !== null);
}
