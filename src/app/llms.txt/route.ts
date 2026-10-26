import { plainText } from "@/components/RichText";
import { ARTICLES } from "@/content/articles";
import { FAQ_GROUPS } from "@/content/faqs";
import { SITE_URL } from "@/lib/config";

/*
 * /llms.txt: a plain-text map of the site for AI assistants and answer
 * engines (https://llmstxt.org). Built from the same content as /articles and
 * /faq, so it never drifts from the pages.
 */

export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# OneRoof Ventures",
    "",
    "> Free comparison site for digital marketing agencies in Indian cities. Businesses filter agencies by service, area and budget, compare published packages and a One Roof Score side by side, and request quotes from several agencies at once.",
    "",
    "Live cities: Bangalore, Hyderabad, Delhi. Services: SEO, social media marketing, paid ads (PPC / Google Ads), Meta Ads, website development, app development, answer engine optimisation (AEO) and combo packages.",
    "",
    "## Agency listings",
    `- [Bangalore marketing agencies](${SITE_URL}/bangalore)`,
    `- [Hyderabad marketing agencies](${SITE_URL}/hyderabad)`,
    `- [Delhi marketing agencies](${SITE_URL}/delhi)`,
    `- [Compare agencies](${SITE_URL}/compare)`,
    "",
    "## Guides",
    ...ARTICLES.map((a) => `- [${a.title}](${SITE_URL}/articles/${a.slug}): ${plainText(a.quickAnswer)}`),
    "",
    "## FAQ",
    ...FAQ_GROUPS.flatMap((g) => g.items.map((f) => `- ${f.q} ${plainText(f.a)}`)),
    "",
    "## Company",
    `- [About](${SITE_URL}/about)`,
    `- [OneRoof Ventures managed marketing packages](${SITE_URL}/services)`,
    `- [Contact](${SITE_URL}/contact)`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
