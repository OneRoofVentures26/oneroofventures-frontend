import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Blocks, Inline, JsonLd, plainText } from "@/components/RichText";
import { ARTICLES, getArticle, readingMinutes } from "@/content/articles";
import { SITE_URL } from "@/lib/config";
import { breadcrumbLd, NOT_FOUND_METADATA, ORGANIZATION_LD } from "@/lib/seo";
import { card, ctaButton, secondaryButton, tag } from "@/lib/styles";
import { cn, formatDate } from "@/lib/utils";

// Articles are static content: every slug is built ahead, anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return NOT_FOUND_METADATA;
  const title = `${article.metaTitle ?? article.title} | OneRoof Ventures`;
  return {
    title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description: article.description,
      url: `/articles/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      tags: article.keywords,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${SITE_URL}/articles/${article.slug}`;
  const related = article.related.map(getArticle).filter((a) => a !== undefined);
  const minutes = readingMinutes(article);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    abstract: plainText(article.quickAnswer),
    keywords: article.keywords.join(", "),
    articleSection: article.category,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: url,
    url,
    inLanguage: "en-IN",
    author: ORGANIZATION_LD,
    publisher: ORGANIZATION_LD,
  };
  const faqLd = article.faqs.length > 0 && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
    })),
  };

  const toc = [
    ...article.sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(article.faqs.length > 0 ? [{ id: "faq", label: "Frequently asked questions" }] : []),
  ];

  return (
    <Container className="pb-12 pt-4 md:pb-16 md:pt-6 lg:pb-20">
      <JsonLd data={articleLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <JsonLd data={breadcrumbLd([["Home", "/"], ["Articles", "/articles"], [article.title, `/articles/${article.slug}`]])} />

      <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-primary-text">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/articles" className="inline-flex min-h-11 items-center hover:text-primary-text">
              Articles
            </Link>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        {/* Table of contents: desktop only, sticky beside the text. */}
        <aside className="hidden xl:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="text-sm font-semibold text-text">On this page</p>
            <ol className="mt-3 space-y-1 border-l border-border">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-sm text-text-muted hover:border-primary hover:text-primary-text">
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0">
          <header>
            <span className={tag}>{article.category}</span>
            <h1 className="mt-3 font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 text-sm text-text-muted">
              By the OneRoof Ventures team · Updated <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time> · {minutes} min read
            </p>
          </header>

          {/* The direct answer first, for readers and for search / AI snippets. */}
          <section aria-label="Quick answer" className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-text">Quick answer</p>
            <p className="mt-2 text-base leading-7 text-text">
              <Inline text={article.quickAnswer} />
            </p>
          </section>

          <section aria-label="Key takeaways" className="mt-6">
            <h2 className="font-display text-lg font-semibold text-text">Key takeaways</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base text-text-muted marker:text-accent">
              {article.takeaways.map((t) => (
                <li key={t} className="pl-1">
                  <Inline text={t} />
                </li>
              ))}
            </ul>
          </section>

          {/* Table of contents on phones and tablets. */}
          <details className="mt-6 rounded-xl border border-border bg-surface xl:hidden">
            <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold text-text">On this page</summary>
            <ol className="space-y-1 px-4 pb-3">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="inline-flex min-h-10 items-center text-sm text-text-muted hover:text-primary-text">
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="max-w-[75ch]">
            {article.sections.map((s) => (
              <section key={s.id} id={s.id} className="mt-10 scroll-mt-24">
                <h2 className="font-display text-section-sm font-semibold text-text">{s.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-text-muted">
                  <Blocks blocks={s.blocks} />
                </div>
              </section>
            ))}

            {article.faqs.length > 0 && (
              <section id="faq" className="mt-10 scroll-mt-24">
                <h2 className="font-display text-section-sm font-semibold text-text">Frequently asked questions</h2>
                <div className="mt-4 divide-y divide-border border-y border-border">
                  {article.faqs.map((f) => (
                    <div key={f.q} className="py-4">
                      <h3 className="text-base font-semibold text-text">{f.q}</h3>
                      <p className="mt-1.5 text-base leading-7 text-text-muted">
                        <Inline text={f.a} />
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="theme-navy bg-glow rounded-2xl p-5">
            <p className="font-display text-lg font-semibold text-text">Compare agencies with published prices</p>
            <p className="mt-2 text-sm text-text-muted">
              Shortlist up to four agencies in your city and request quotes from all of them at once. Free for businesses.
            </p>
            <Link href="/quote" className={cn(ctaButton, "mt-4 w-full")}>
              Get quotes
            </Link>
            <div className="mt-3 flex flex-wrap gap-x-4 text-sm">
              {[
                ["/bangalore", "Bangalore"],
                ["/hyderabad", "Hyderabad"],
                ["/delhi", "Delhi"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="inline-flex min-h-11 items-center font-medium text-primary-text hover:underline">
                  {label} →
                </Link>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <div className={cn(card, "p-5")}>
              <p className="text-sm font-semibold text-text">Related guides</p>
              <ul className="mt-2 divide-y divide-border">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/articles/${r.slug}`} className="block py-2.5 text-sm font-medium text-text hover:text-primary-text">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/articles" className={cn(secondaryButton, "mt-3 w-full")}>
                All articles
              </Link>
            </div>
          )}
        </aside>
      </div>
    </Container>
  );
}
