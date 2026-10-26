import type { Article, ArticleCategory, Block } from "@/content/types";
import agencyCost from "./digital-marketing-agency-cost-india";
import howToChoose from "./how-to-choose-digital-marketing-agency";
import seoPricing from "./seo-packages-pricing-india";
import socialPricing from "./social-media-marketing-packages-india";
import googleAdsFees from "./google-ads-agency-fees-india";
import websiteCost from "./website-development-cost-india";
import aeo from "./what-is-answer-engine-optimization-aeo";
import questions from "./questions-to-ask-marketing-agency";
import agencyVsFreelancer from "./agency-vs-freelancer-vs-in-house";
import metaVsGoogle from "./meta-ads-vs-google-ads";
import seoVsAds from "./seo-vs-google-ads";
import { CITY_GUIDES } from "./city-guides";

/** Every article, in the order shown on /articles. To add one, create a file here and list it. */
export const ARTICLES: Article[] = [
  agencyCost,
  howToChoose,
  aeo,
  seoPricing,
  socialPricing,
  googleAdsFees,
  metaVsGoogle,
  seoVsAds,
  websiteCost,
  questions,
  agencyVsFreelancer,
  ...CITY_GUIDES,
];

export const ARTICLE_CATEGORIES: ArticleCategory[] = ["Pricing", "Hiring an agency", "Channels", "City guides"];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** Plain text of a block, for word counts. */
function blockText(block: Block): string {
  if (typeof block === "string") return block;
  if ("list" in block) return block.list.join(" ");
  if ("table" in block) return [...block.table.head, ...block.table.rows.flat()].join(" ");
  if ("h3" in block) return block.h3;
  return block.callout;
}

export function readingMinutes(article: Article): number {
  const text = [
    article.quickAnswer,
    ...article.takeaways,
    ...article.sections.flatMap((s) => [s.heading, ...s.blocks.map(blockText)]),
    ...article.faqs.flatMap((f) => [f.q, f.a]),
  ].join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 220));
}
