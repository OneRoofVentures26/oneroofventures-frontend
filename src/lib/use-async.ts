"use client";

import { useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  /** Last successfully loaded value (kept while reloading to avoid flicker). */
  data: T | undefined;
  error: unknown;
  loading: boolean;
  reload: () => void;
  /** Locally patch the loaded value, e.g. after a successful mutation. */
  setData: (updater: (prev: T | undefined) => T) => void;
}

/**
 * Runs `load` on mount and whenever `key` changes. `key` should encode every
 * input `load` depends on (ids, filters, ...).
 */
export function useAsync<T>(load: () => Promise<T>, key = ""): AsyncState<T> {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const [version, setVersion] = useState(0);
  const requestKey = `${key}#${version}`;
  const [state, setState] = useState<{ key: string | null; data?: T; error?: unknown }>({ key: null });

  useEffect(() => {
    let cancelled = false;
    loadRef.current().then(
      (data) => {
        if (!cancelled) setState({ key: requestKey, data });
      },
      (error) => {
        if (!cancelled) setState((prev) => ({ key: requestKey, data: prev.data, error }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  return {
    data: state.data,
    error: state.key === requestKey ? state.error : undefined,
    loading: state.key !== requestKey,
    reload: () => setVersion((v) => v + 1),
    setData: (updater) => setState((prev) => ({ ...prev, data: updater(prev.data) })),
  };
}
