// Refreshes public cache tags for bulk imports and scripts:
//   curl -X POST https://<site>/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET" \
//     -H "Content-Type: application/json" -d '{"tags":["cities","city:bangalore"]}'
// Uses stale-while-revalidate: the next visit may still see old data while fresh data loads.

import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { isCacheTag } from "@/lib/cache-tags";

const MAX_TAGS = 500;

function authorized(header: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let tags: unknown;
  try {
    tags = ((await request.json()) as { tags?: unknown })?.tags;
  } catch {
    tags = undefined;
  }
  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS || !tags.every(isCacheTag)) {
    return Response.json(
      { error: "BAD_REQUEST", message: `Body must be {"tags": [...]} with 1–${MAX_TAGS} valid cache tags` },
      { status: 400 },
    );
  }

  for (const tag of new Set(tags)) revalidateTag(tag, "max");
  return Response.json({ revalidated: tags.length, now: Date.now() });
}
