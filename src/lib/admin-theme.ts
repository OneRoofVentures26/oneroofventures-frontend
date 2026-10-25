"use client";

import { createLocalStore, useLocalStore } from "@/lib/local-store";

export type AdminTheme = "light" | "dark";

/** Admin-only colour theme, remembered in this browser. The public site ignores it. */
const store = createLocalStore<AdminTheme>("oneroof:admin-theme", "light");

export function useAdminTheme(): [AdminTheme, () => void] {
  const theme = useLocalStore(store);
  return [theme, () => store.write(theme === "dark" ? "light" : "dark")];
}

/** Put on the admin root element; globals.css switches every token while it's present. */
export function adminThemeClass(theme: AdminTheme): string | undefined {
  return theme === "dark" ? "admin-dark" : undefined;
}
