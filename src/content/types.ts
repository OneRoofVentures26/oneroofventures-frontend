/*
 * Shapes for the static editorial content (/articles and /faq). Text strings
 * support two inline marks, rendered by <RichText>: **bold** and
 * [link text](/href). Internal links use site paths; external ones open in a
 * new tab.
 */

export type Block =
  | string
  | { list: string[]; ordered?: boolean }
  | { table: { head: string[]; rows: string[][] } }
  | { h3: string }
  | { callout: string };

export interface ArticleSection {
  /** Anchor for the table of contents. */
  id: string;
  heading: string;
  blocks: Block[];
}

export interface Faq {
  q: string;
  a: string;
}

export type ArticleCategory = "Pricing" | "Hiring an agency" | "Channels" | "City guides";

export interface Article {
  slug: string;
  title: string;
  /** <title> when it should differ from the H1. " | OneRoof Ventures" is appended. */
  metaTitle?: string;
  /** Meta description, ~150 characters. */
  description: string;
  category: ArticleCategory;
  keywords: string[];
  /** ISO dates. */
  publishedAt: string;
  updatedAt: string;
  /**
   * The direct answer to the article's main question, shown first. Written to
   * be quoted as-is by search snippets and AI answers.
   */
  quickAnswer: string;
  takeaways: string[];
  sections: ArticleSection[];
  faqs: Faq[];
  /** Slugs of related articles. */
  related: string[];
}
