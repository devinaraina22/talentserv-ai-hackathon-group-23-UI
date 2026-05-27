import type { UserRole } from "./types";
import {
  parseDemoSession,
  resolveDemoSessionPayload,
  type DemoSessionPayload,
} from "./demo-session";

export const DEMO_BEARER = "demo-login-token";
export const DEMO_SESSION_COOKIE = "medibook_demo_session";

export const DEMO_PATIENT = {
  userId: "demo-patient",
  email: "riya@example.com",
  name: "Riya Sharma (Demo Patient)",
};

export function isDemoLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_LOGIN === "true";
}

export function isDemoClient(): boolean {
  if (typeof document === "undefined") return false;
  return !!getDemoSessionValue();
}

export function getDemoSessionValue(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${DEMO_SESSION_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function setDemoSession(value: string): void {
  document.cookie = `${DEMO_SESSION_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearDemoSession(): void {
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function applyPayloadHeaders(headers: Record<string, string>, payload: DemoSessionPayload): void {
  headers["X-Demo-Role"] = payload.role;
  headers["X-Demo-Email"] = payload.email;
  headers["X-Demo-Name"] = payload.name;
  if (payload.department) headers["X-Demo-Department"] = payload.department;
  if (payload.role === "Patient") {
    headers["X-Demo-As-Patient"] = "true";
  }
  if (payload.staffId) {
    headers["X-Demo-Staff-Id"] = payload.staffId;
  }
}

export function demoAuthHeaders(session?: string | null): Record<string, string> {
  const resolved = session ?? getDemoSessionValue();
  if (!resolved) return {};

  const headers: Record<string, string> = {
    Authorization: `Bearer ${DEMO_BEARER}`,
  };

  const payload = resolveDemoSessionPayload(resolved) ?? parseDemoSession(resolved);
  if (payload) {
    applyPayloadHeaders(headers, payload);
    return headers;
  }

  if (resolved === "patient" || resolved.startsWith("p:")) {
    headers["X-Demo-As-Patient"] = "true";
    headers["X-Demo-Role"] = "Patient";
    const legacy = resolveDemoSessionPayload(resolved);
    if (legacy) {
      headers["X-Demo-Email"] = legacy.email;
      headers["X-Demo-Name"] = legacy.name;
    }
    return headers;
  }

  headers["X-Demo-Staff-Id"] = resolved;
  return headers;
}

export async function getDemoToken(): Promise<string> {
  return DEMO_BEARER;
}

export const DEMO_ROLE_COLORS: Record<UserRole, string> = {
  Admin: "border-violet-300 bg-violet-500/10",
  Receptionist: "border-sky-300 bg-sky-500/10",
  Doctor: "border-emerald-300 bg-emerald-500/10",
  Patient: "border-amber-300 bg-amber-500/10",
};
