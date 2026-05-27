import { demoAuthHeaders, isDemoClient } from "./demo-auth";
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
  const demoHeaders = isDemoClient() ? demoAuthHeaders() : {};
  const token = isE2eClient() || isDemoClient() ? null : await getToken();

  try {
    return await fetch(apiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...e2eHeaders,
        ...demoHeaders,
        ...init?.headers,
      },
    });
  } catch (error) {
    const message =
      error instanceof TypeError && error.message.includes("fetch")
        ? "Could not reach the API server. Make sure the backend is running on port 3001."
        : "Network request failed.";
    throw new Error(message);
  }
}
