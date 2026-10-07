"use client";

import { useSyncExternalStore } from "react";

export interface LocalStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  write: (value: T) => void;
  read: () => T;
}

export function createLocalStore<T>(key: string, defaultValue: T): LocalStore<T> {
  let listeners: Array<() => void> = [];
  let cachedRaw: string | null = null;
  let cachedValue: T = defaultValue;

  function emitChange() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  function getSnapshot(): T {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      if (raw == null) {
        cachedValue = defaultValue;
      } else {
        try {
          cachedValue = JSON.parse(raw) as T;
        } catch {
          cachedValue = defaultValue;
        }
      }
    }
    return cachedValue;
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function write(value: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
    emitChange();
  }

  return { subscribe, getSnapshot, getServerSnapshot, write, read: getSnapshot };
}

export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
