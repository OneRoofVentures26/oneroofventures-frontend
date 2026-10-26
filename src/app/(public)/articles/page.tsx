import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/Container";
import { JsonLd } from "@/components/RichText";
import { ARTICLES, ARTICLE_CATEGORIES, readingMinutes } from "@/content/articles";
import type { Article } from "@/content/types";
import { SITE_URL } from "@/lib/config";
import { breadcrumbLd, ORGANIZATION_LD } from "@/lib/seo";
import { card, eyebrow, sectionTitle, tag } from "@/lib/styles";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marketing Guides & Articles: Agency Prices, SEO, Ads & AEO | OneRoof Ventures",
  alternates: { canonical: "/articles" },
  description:
    "Guides for hiring a digital marketing agency in India: what agencies charge for SEO, social media, Google and Meta Ads and websites, how to choose one, AEO, and city guides.",
};

const CATEGORY_IDS: Record<string, string> = {
  Pricing: "pricing",
  "Hiring an agency": "hiring",
  Channels: "channels",
  "City guides": "city-guides",
};

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className={cn(card, "group relative flex h-full flex-col p-5 transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-card-hover")}>
      <span className={cn(tag, "self-start")}>{article.category}</span>
      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-text">
        <Link href={`/articles/${article.slug}`} className="after:absolute after:inset-0 group-hover:text-primary-text">
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-text-muted">{article.description}</p>
      <p className="mt-auto pt-4 text-[13px] text-text-muted">
        {readingMinutes(article)} min read · Updated {formatDate(article.updatedAt)}
      </p>
    </article>
  );
}

export default function ArticlesPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Marketing guides and articles",
    url: `${SITE_URL}/articles`,
    publisher: ORGANIZATION_LD,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ARTICLES.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/articles/${a.slug}`,
        name: a.title,
      })),
    },
  };

  return (
    <div>
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumbLd([["Home", "/"], ["Articles", "/articles"]])} />

      <Section className="border-b border-border bg-surface">
        <p className={eyebrow}>Guides & articles</p>
        <h1 className="mt-3 max-w-[28ch] font-display text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-[2.5rem]">
          Everything you need to hire the right marketing agency
        </h1>
        <p className="mt-4 max-w-[64ch] text-base text-text-muted sm:text-lg">
          What agencies in India charge for SEO, social media, Google and Meta Ads and websites, how to compare them,
          and how to show up in AI search. Plain answers, updated regularly.
        </p>
        <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
          {ARTICLE_CATEGORIES.map((c) => (
            <a
              key={c}
              href={`#${CATEGORY_IDS[c]}`}
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-bg px-4 text-sm font-medium text-text hover:border-primary/50 hover:text-primary-text lg:min-h-10"
            >
              {c}
            </a>
          ))}
          <Link
            href="/faq"
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-bg px-4 text-sm font-medium text-text hover:border-primary/50 hover:text-primary-text lg:min-h-10"
          >
            FAQ
          </Link>
        </nav>
      </Section>

      <Container className="section-y space-y-12 md:space-y-16">
        {ARTICLE_CATEGORIES.map((category) => {
          const items = ARTICLES.filter((a) => a.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category} id={CATEGORY_IDS[category]} aria-labelledby={`${CATEGORY_IDS[category]}-title`} className="scroll-mt-24">
              <h2 id={`${CATEGORY_IDS[category]}-title`} className={sectionTitle}>
                {category}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {items.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </div>
  );
}
