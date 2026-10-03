"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "oneroof_compare_ids";
export const MAX_COMPARE = 4;

let listeners: Array<() => void> = [];
let cachedRaw: string | null = null;
let cachedIds: string[] = [];

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedIds = raw ? JSON.parse(raw) : [];
    } catch {
      cachedIds = [];
    }
  }
  return cachedIds;
}

function getServerSnapshot(): string[] {
  return [];
}

function writeStore(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
  emitChange();
}

interface CompareContextValue {
  selectedIds: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setAll: (ids: string[]) => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const selectedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    if (current.includes(id)) {
      writeStore(current.filter((x) => x !== id));
    } else if (current.length < MAX_COMPARE) {
      writeStore([...current, id]);
    }
  }, []);

  const remove = useCallback((id: string) => {
    writeStore(getSnapshot().filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => writeStore([]), []);

  const setAll = useCallback((ids: string[]) => {
    writeStore(ids.slice(0, MAX_COMPARE));
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  const value = useMemo<CompareContextValue>(
    () => ({
      selectedIds,
      toggle,
      remove,
      clear,
      setAll,
      isSelected,
      isFull: selectedIds.length >= MAX_COMPARE,
    }),
    [selectedIds, toggle, remove, clear, setAll, isSelected],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
