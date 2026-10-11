import { cn } from "@/lib/utils";

/**
 * The single content column for the whole site: 1200px max, 16 / 24 / 32px
 * side padding. Header, footer and every section use it, and nothing inside
 * adds its own horizontal padding, so all content shares one left/right edge.
 */
export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "nav";
}) {
  return <Tag className={cn("container-page", className)}>{children}</Tag>;
}

/**
 * A page section: 48 / 64 / 80px vertical padding, applied once. `flush` drops
 * the top padding for a section that continues straight on from the one above
 * on the same background, so the gap between them is one padding, not two.
 */
export function Section({
  children,
  className,
  containerClassName,
  flush = false,
  id,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  flush?: boolean;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section id={id} aria-label={ariaLabel} className={cn(flush ? "section-b" : "section-y", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
