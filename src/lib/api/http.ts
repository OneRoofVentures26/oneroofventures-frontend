import { API_BASE_URL } from "@/lib/config";
import type { ApiErrorBody } from "@/lib/api/types";

export class ApiError extends Error {
  readonly status: number;
  /** Backend error code, e.g. VALIDATION_FAILED, NOT_FOUND, RATE_LIMITED. */
  readonly code: string;
  /** Field-level validation messages; keys may be nested, e.g. `packages[0].serviceCode`. */
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function isNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

type QueryValue = string | number | boolean | null | undefined | Array<string | number>;

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
  }
  return url.toString();
}

// 401s can have an empty body or a different JSON shape (lib-commons security),
// so never assume the standard error format.
export async function toApiError(res: Response): Promise<ApiError> {
  let body: Partial<ApiErrorBody> | null = null;
  try {
    const text = await res.text();
    body = text ? (JSON.parse(text) as Partial<ApiErrorBody>) : null;
  } catch {
    body = null;
  }

  const fallbackMessage =
    res.status === 401
      ? "Your session has expired. Please sign in again."
      : res.status === 429
        ? "Too many requests. Please try again later."
        : res.status >= 500
          ? "Something went wrong on our side. Please try again."
          : `Request failed (${res.status})`;

  return new ApiError(
    res.status,
    typeof body?.error === "string" ? body.error : res.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR",
    typeof body?.message === "string" && body.message ? body.message : fallbackMessage,
    body?.fields ?? {},
  );
}

export async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Human-readable message for any thrown value, including field errors. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) {
    const fieldMessages = Object.entries(err.fields).map(([field, msg]) => `${field}: ${msg}`);
    return fieldMessages.length > 0 ? `${err.message} — ${fieldMessages.join("; ")}` : err.message;
  }
  if (err instanceof TypeError) {
    return "Could not reach the server. Check your connection and try again.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
