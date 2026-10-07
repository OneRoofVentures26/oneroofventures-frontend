"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// The public API has no lookup by agency id, so we keep enough to render chips,
// build profile links and quote links without refetching.
export interface CompareItem {
  id: number;
  name: string;
  slug: string;
  citySlug: string;
}

const STORAGE_KEY = "oneroof_compare_v2";
export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

let listeners: Array<() => void> = [];
let cachedRaw: string | null = null;
let cachedItems: CompareItem[] = [];
const EMPTY: CompareItem[] = [];

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): CompareItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cachedItems = Array.isArray(parsed) ? parsed : [];
    } catch {
      cachedItems = [];
    }
  }
  return cachedItems;
}

function getServerSnapshot(): CompareItem[] {
  return EMPTY;
}

function writeStore(items: CompareItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  emitChange();
}

interface CompareContextValue {
  items: CompareItem[];
  /** City every selected agency belongs to (compare only works within one city). */
  citySlug: string | null;
  toggle: (item: CompareItem) => void;
  remove: (id: number) => void;
  clear: () => void;
  setAll: (items: CompareItem[]) => void;
  isSelected: (id: number) => boolean;
  /** Why this agency can't be added right now, or null if it can. */
  blockReason: (item: Pick<CompareItem, "id" | "citySlug">) => string | null;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const citySlug = items[0]?.citySlug ?? null;

  const toggle = useCallback((item: CompareItem) => {
    const current = getSnapshot();
    if (current.some((x) => x.id === item.id)) {
      writeStore(current.filter((x) => x.id !== item.id));
      return;
    }
    if (current.length >= MAX_COMPARE) return;
    if (current.length > 0 && current[0].citySlug !== item.citySlug) return;
    writeStore([...current, item]);
  }, []);

  const remove = useCallback((id: number) => {
    writeStore(getSnapshot().filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => writeStore([]), []);

  const setAll = useCallback((next: CompareItem[]) => writeStore(next.slice(0, MAX_COMPARE)), []);

  const isSelected = useCallback((id: number) => items.some((x) => x.id === id), [items]);

  const blockReason = useCallback(
    (item: Pick<CompareItem, "id" | "citySlug">) => {
      if (items.some((x) => x.id === item.id)) return null;
      if (items.length >= MAX_COMPARE) {
        return `You can compare up to ${MAX_COMPARE} agencies at a time. Remove one to add another.`;
      }
      if (citySlug && citySlug !== item.citySlug) {
        return "You can only compare agencies from the same city. Clear your current list to start a new one.";
      }
      return null;
    },
    [items, citySlug],
  );

  const value = useMemo<CompareContextValue>(
    () => ({
      items,
      citySlug,
      toggle,
      remove,
      clear,
      setAll,
      isSelected,
      blockReason,
      isFull: items.length >= MAX_COMPARE,
    }),
    [items, citySlug, toggle, remove, clear, setAll, isSelected, blockReason],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export function compareHref(items: CompareItem[]): string {
  const city = items[0]?.citySlug;
  const params = new URLSearchParams({ ids: items.map((x) => x.id).join(",") });
  if (city) params.set("city", city);
  return `/compare?${params.toString()}`;
}
