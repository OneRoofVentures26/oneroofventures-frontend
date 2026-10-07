// Public runtime configuration. All values are safe to expose to the browser.

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://oneroofventures-backend-latest.onrender.com"
).replace(/\/+$/, "");

// Cloudflare Turnstile site key (public). Use 1x00000000000000000000AA locally to always pass.
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAFNQaQLHuH5tuyVX";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneroofventures.com").replace(
  /\/+$/,
  "",
);

// Public API responses are cached for 5 minutes by the backend; match it for ISR.
export const PUBLIC_REVALIDATE_SECONDS = 300;
