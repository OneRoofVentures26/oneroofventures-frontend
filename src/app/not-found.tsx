import { primaryButton } from "@/lib/styles";
import { cn } from "@/lib/utils";
import Link from "next/link";

// URLs that match no route at all (renders inside the root layout only).
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <p className="font-serif text-5xl font-semibold text-harbor">404</p>
        <h1 className="mt-3 text-[28px] leading-tight text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-ink-soft">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className={cn(primaryButton, "mt-6")}
        >
          Back to OneRoof Ventures
        </Link>
      </div>
    </main>
  );
}
