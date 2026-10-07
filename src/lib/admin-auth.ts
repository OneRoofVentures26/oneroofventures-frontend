import { createLocalStore, useLocalStore } from "@/lib/local-store";
import { buildUrl, toApiError } from "@/lib/api/http";

export interface AdminSession {
  token: string;
  username: string;
  /** Epoch millis when the JWT expires (7 days after login). */
  expiresAt: number;
}

const sessionStore = createLocalStore<AdminSession | null>("oneroof_admin_session_v2", null);

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function decodeExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: number }).exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function isValid(session: AdminSession | null): session is AdminSession {
  return Boolean(session && session.token && session.expiresAt > Date.now());
}

export function useAdminSession(): AdminSession | null {
  const session = useLocalStore(sessionStore);
  return isValid(session) ? session : null;
}

/** Reads the current session straight from storage (safe inside effects and event handlers). */
export function getSession(): AdminSession | null {
  const session = sessionStore.read();
  return isValid(session) ? session : null;
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  let res: Response;
  try {
    res = await fetch(buildUrl("/auth/token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
      cache: "no-store",
    });
  } catch {
    return { success: false, error: "Could not reach the server. It may be waking up — try again in a minute." };
  }

  if (!res.ok) {
    const err = await toApiError(res);
    return {
      success: false,
      error: res.status === 401 ? "Invalid email or password." : err.message,
    };
  }

  // The token comes back as plain text, not JSON.
  const token = (await res.text()).trim();

  // There is no "who am I" endpoint: probe a cheap admin call so a valid
  // login without the ADMIN role (403 FORBIDDEN) is rejected up front.
  try {
    const probe = await fetch(buildUrl("/api/v1/admin/cities"), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (probe.status === 403) {
      return { success: false, error: "This account doesn't have admin access." };
    }
  } catch {
    // Network hiccup: keep the token; admin pages will surface any real problem.
  }

  sessionStore.write({
    token,
    username: username.trim(),
    expiresAt: decodeExpiry(token) ?? Date.now() + DEFAULT_TTL_MS,
  });
  return { success: true };
}

/** The backend has no logout endpoint; dropping the token is enough. */
export function logout(): void {
  sessionStore.write(null);
}
