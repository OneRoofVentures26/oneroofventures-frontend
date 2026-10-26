import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/Container";
import { Inline, JsonLd, plainText } from "@/components/RichText";
import { FAQ_GROUPS } from "@/content/faqs";
import { breadcrumbLd } from "@/lib/seo";
import { ctaButton, eyebrow, secondaryButton, sectionTitle } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ: Comparing Marketing Agencies, Prices & Quotes | OneRoof Ventures",
  alternates: { canonical: "/faq" },
  description:
    "Answers to common questions about OneRoof Ventures, the One Roof Score, getting quotes from marketing agencies, and what SEO, social media, ads and websites cost in India.",
};

export default function FaqPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((g) =>
      g.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
      })),
    ),
  };

  return (
    <div>
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd([["Home", "/"], ["FAQ", "/faq"]])} />

      <Section className="border-b border-border bg-surface">
        <p className={eyebrow}>FAQ</p>
        <h1 className="mt-3 max-w-[24ch] font-display text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-[2.5rem]">
          Frequently asked questions
        </h1>
        <p className="mt-4 max-w-[60ch] text-base text-text-muted sm:text-lg">
          How OneRoof Ventures works, how agencies are scored, and what marketing services cost in India. For more
          detail, read our <Link href="/articles" className="font-semibold text-primary-text hover:underline">guides</Link>.
        </p>
      </Section>

      <Container className="section-y grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="FAQ topics" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
            {FAQ_GROUPS.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-text hover:border-primary/50 hover:text-primary-text lg:min-h-10 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 max-w-[85ch] space-y-12">
          {FAQ_GROUPS.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-24">
              <h2 id={`${g.id}-title`} className={sectionTitle}>
                {g.title}
              </h2>
              {/* Answers stay in the HTML when collapsed, so crawlers read them all. */}
              <div className="mt-4 divide-y divide-border border-y border-border">
                {g.items.map((f) => (
                  <details key={f.q} className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-semibold text-text [&::-webkit-details-marker]:hidden">
                      <h3>{f.q}</h3>
                      <span aria-hidden="true" className="flex-shrink-0 text-xl text-text-muted transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="pb-4 pr-8 text-base leading-7 text-text-muted">
                      <Inline text={f.a} />
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="theme-navy bg-glow rounded-3xl px-6 py-8 sm:px-10">
            <h2 className={cn(sectionTitle, "max-w-[26ch]")}>Still have a question?</h2>
            <p className="mt-2 max-w-[56ch] text-base text-text-muted">
              Compare agencies in your city, or get in touch and we&apos;ll help you find the right one.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/quote" className={ctaButton}>
                Get quotes
              </Link>
              <Link href="/contact" className={secondaryButton}>
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
