// Cache tags on public API data (src/lib/api/public.ts):
//   cities          city list, homepage stats, sitemap entries
//   services        service list
//   city:<slug>     a city's listings, localities and service pages
//   agency:<slug>   one agency's profile
const TAG_PATTERN = /^(?:cities|services|(?:city|agency):[a-z0-9][a-z0-9-]{0,239})$/;

export function isCacheTag(tag: unknown): tag is string {
  return typeof tag === "string" && TAG_PATTERN.test(tag);
}
