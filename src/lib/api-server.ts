import { auth } from "@clerk/nextjs/server";

function getServerApiBase(): string {
  const base =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export async function serverApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const { getToken } = await auth();
  const token = await getToken();
  const url = `${getServerApiBase()}${path.startsWith("/") ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
