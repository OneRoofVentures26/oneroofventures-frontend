import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import type { Block } from "@/content/types";
import { textLink } from "@/lib/styles";
import { cn } from "@/lib/utils";

/*
 * Renders the editorial content in src/content. Inline marks: **bold** and
 * [text](href). Site paths become <Link>; anything else opens in a new tab.
 */

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    if (m[1] !== undefined) {
      out.push(
        <strong key={i} className="font-semibold text-text">
          {m[1]}
        </strong>,
      );
    } else {
      const href = m[3];
      out.push(
        href.startsWith("/") ? (
          <Link key={i} href={href} className={textLink}>
            {m[2]}
          </Link>
        ) : (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={textLink}>
            {m[2]}
          </a>
        ),
      );
    }
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** Strips the inline marks, for structured data and meta text. */
export function plainText(text: string): string {
  return text.replace(INLINE, (_, bold, label) => bold ?? label);
}

function BlockView({ block }: { block: Block }) {
  if (typeof block === "string") {
    return (
      <p>
        <Inline text={block} />
      </p>
    );
  }
  if ("h3" in block) {
    return <h3 className="pt-2 font-display text-lg font-semibold text-text">{block.h3}</h3>;
  }
  if ("callout" in block) {
    return (
      <p className="rounded-xl border-l-4 border-accent bg-surface px-4 py-3 text-text">
        <Inline text={block.callout} />
      </p>
    );
  }
  if ("list" in block) {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag className={cn("space-y-2 pl-5", block.ordered ? "list-decimal" : "list-disc", "marker:text-text-muted")}>
        {block.list.map((item, i) => (
          <li key={i} className="pl-1">
            <Inline text={item} />
          </li>
        ))}
      </Tag>
    );
  }
  return (
    // Tables scroll sideways on phones rather than squeezing the columns.
    <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr>
            {block.table.head.map((h, i) => (
              <th key={i} scope="col" className="border-b-2 border-primary px-3 py-2.5 font-semibold text-text first:pl-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, r) => (
            <tr key={r} className="border-b border-border align-top">
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row" className="px-3 py-2.5 font-medium text-text first:pl-0">
                    <Inline text={cell} />
                  </th>
                ) : (
                  <td key={c} className="px-3 py-2.5">
                    <Inline text={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <BlockView block={block} />
        </Fragment>
      ))}
    </>
  );
}

/** Renders a JSON-LD script; `<` is escaped so content can't close the tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
