import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { demoAuthHeaders, isDemoLoginEnabled, DEMO_SESSION_COOKIE } from "./demo-auth";
import { E2E_BEARER, E2E_ROLE_COOKIE, isE2eMode, parseE2eRole } from "./e2e";

function getServerApiBase(): string {
  const base =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export async function serverApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getServerApiBase()}${path.startsWith("/") ? path : `/${path}`}`;

  let authHeaders: Record<string, string> = {};
  if (isE2eMode()) {
    const role = parseE2eRole((await cookies()).get(E2E_ROLE_COOKIE)?.value);
    authHeaders = {
      Authorization: `Bearer ${E2E_BEARER}`,
      "X-E2E-Role": role,
    };
  } else if (isDemoLoginEnabled()) {
    const demoSession = (await cookies()).get(DEMO_SESSION_COOKIE)?.value;
    if (demoSession) {
      authHeaders = demoAuthHeaders(demoSession);
    }
  }

  if (!authHeaders.Authorization) {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) authHeaders.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...init?.headers,
    },
  });
}

export async function serverApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await serverApiFetch(path, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `API request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}
