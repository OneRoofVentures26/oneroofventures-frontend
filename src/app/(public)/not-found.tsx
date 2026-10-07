import { primaryButton, secondaryButton } from "@/lib/styles";
import Link from "next/link";

// Unknown city, agency, service or area (the API answered 404).
export default function PublicNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="font-serif text-5xl font-semibold text-harbor">404</p>
      <h1 className="mt-3 text-[28px] leading-tight text-ink">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-sm text-ink-soft">
        The agency or city may no longer be listed, or the link may be mistyped.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
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
    </div>
  );
}
