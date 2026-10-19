import { primaryButton, secondaryButton } from "@/lib/styles";
import Link from "next/link";
import { Container } from "@/components/Container";

// Unknown city, agency, service or area (the API answered 404).
export default function PublicNotFound() {
  return (
    <Container className="section-y">
      <p className="num text-5xl font-bold text-primary-text">404</p>
      <h1 className="mt-3 text-[28px] leading-tight text-text">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-[60ch] text-base text-text-muted">
        The agency or city may no longer be listed, or the link may be mistyped.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className={primaryButton}
        >
          Browse agencies
        </Link>
        <Link
          href="/quote"
          className={secondaryButton}
        >
          Get matched quotes
        </Link>
      </div>
    </Container>
  );
}
