import { Suspense } from "react";
import type { Metadata } from "next";
import { Section } from "@/components/Container";
import ServiceInquiryForm from "@/components/ServiceInquiryForm";
import { PACKAGE_CONTACT } from "@/lib/packages";
import { card, eyebrow } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us | OneRoof Ventures",
  alternates: { canonical: "/contact" },
  description: "Talk to the OneRoof Ventures team about our marketing packages or a custom scope for your business.",
};

export default function ContactPage() {
  return (
    <Section containerClassName="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <p className={eyebrow}>Contact us</p>
        <h1 className="mt-3 font-display text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-text sm:text-[2.5rem]">
          Talk to our team
        </h1>
        <p className="mt-3 text-base text-text-muted">
          Questions, or want something built to fit? Get in touch and we&apos;ll put a custom scope together.
        </p>
        <ul className="mt-6 space-y-1 text-sm">
          {PACKAGE_CONTACT.phones.map((p, i) => (
            <li key={p.e164}>
              <a href={`tel:${p.e164}`} className="inline-flex min-h-11 items-center gap-2 font-medium text-text hover:text-primary-text">
                <span className="w-20 text-text-muted">{i === 0 ? "Phone" : ""}</span>
                {p.display}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${PACKAGE_CONTACT.email}`} className="inline-flex min-h-11 items-center gap-2 break-all font-medium text-text hover:text-primary-text">
              <span className="w-20 flex-shrink-0 text-text-muted">Email</span>
              {PACKAGE_CONTACT.email}
            </a>
          </li>
          <li className="inline-flex min-h-11 items-center gap-2 font-medium text-text">
            <span className="w-20 text-text-muted">Based in</span>
            {PACKAGE_CONTACT.location}
          </li>
        </ul>
      </div>
      <div className={cn(card, "p-5 sm:p-6 lg:col-span-8")}>
        <Suspense fallback={<div className="h-80" />}>
          <ServiceInquiryForm />
        </Suspense>
      </div>
    </Section>
  );
}
