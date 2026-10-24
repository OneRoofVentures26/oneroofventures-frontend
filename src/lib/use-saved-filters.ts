"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const subscribeNever = () => () => {};

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, query: string) {
  try {
    if (query) window.localStorage.setItem(key, query);
    else window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Keeps an admin list's filters (its URL query) until the admin changes them.
 * Links back to the list (sidebar, "← Agencies", Cancel) drop the query, so the
 * last one is saved and restored. Every filter change, including clearing them,
 * must go through `setQuery` so a cleared filter isn't restored.
 *
 * `ready` is false while a saved query is being restored; render the list only
 * once it's true so it starts from the restored filters.
 */
export function useSavedFilters(storageKey: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  // Storage only exists in the browser; stay "not ready" for the server render.
  const inBrowser = useSyncExternalStore(subscribeNever, () => true, () => false);
  const restoring = !query && inBrowser && read(storageKey) != null;

  useEffect(() => {
    if (query) {
      write(storageKey, query);
      return;
    }
    const saved = read(storageKey);
    if (saved) router.replace(`${pathname}?${saved}`);
  }, [query, storageKey, pathname, router]);

  function setQuery(next: URLSearchParams) {
    const q = next.toString();
    write(storageKey, q);
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  return { ready: inBrowser && !restoring, setQuery };
}
