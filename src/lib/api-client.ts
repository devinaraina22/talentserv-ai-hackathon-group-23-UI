import { e2eAuthHeaders, isE2eClient } from "./e2e";

export function getPublicApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicApiBase()}${normalized}`;
}

/** Client-side fetch with Clerk session token (use inside event handlers). */
export async function clientApiFetch(
  getToken: () => Promise<string | null>,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const e2eHeaders = isE2eClient() ? e2eAuthHeaders() : {};
  const token = isE2eClient() ? null : await getToken();

  return fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...e2eHeaders,
      ...init?.headers,
    },
  });
}
