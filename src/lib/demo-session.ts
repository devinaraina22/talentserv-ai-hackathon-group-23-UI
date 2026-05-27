import type { UserRole } from "./types";

export type DemoPatientSession = {
  email: string;
  name: string;
};

export type DemoSessionPayload = {
  role: UserRole;
  email: string;
  name: string;
  staffId?: string;
  department?: string;
};

export function demoPatientUserId(email: string): string {
  const slug = email.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `demo-patient-${slug || "guest"}`;
}

export function demoSessionUserId(payload: DemoSessionPayload): string {
  if (payload.role === "Patient") return demoPatientUserId(payload.email);
  if (payload.staffId) return `demo-${payload.staffId}`;
  const slug = payload.email.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `demo-staff-${slug || "user"}`;
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

export function encodeDemoSession(data: DemoSessionPayload): string {
  return `d:${toBase64Url(JSON.stringify(data))}`;
}

export function parseDemoSession(value: string): DemoSessionPayload | null {
  if (!value.startsWith("d:")) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(value.slice(2))) as DemoSessionPayload;
    if (!parsed.email || !parsed.name || !parsed.role) return null;
    return {
      role: parsed.role,
      email: parsed.email.toLowerCase().trim(),
      name: parsed.name.trim(),
      staffId: parsed.staffId,
      department: parsed.department,
    };
  } catch {
    return null;
  }
}

export function encodePatientSession(data: DemoPatientSession): string {
  return encodeDemoSession({
    role: "Patient",
    email: data.email,
    name: data.name,
  });
}

export function parsePatientSession(value: string): DemoPatientSession | null {
  const demo = parseDemoSession(value);
  if (demo) return { email: demo.email, name: demo.name };
  if (!value.startsWith("p:")) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(value.slice(2))) as DemoPatientSession;
    if (!parsed.email || !parsed.name) return null;
    return {
      email: parsed.email.toLowerCase().trim(),
      name: parsed.name.trim(),
    };
  } catch {
    return null;
  }
}

export function isPatientSession(value: string): boolean {
  if (value === "patient") return true;
  const demo = parseDemoSession(value);
  if (demo?.role === "Patient") return true;
  return value.startsWith("p:");
}

export function resolveDemoSessionPayload(value: string): DemoSessionPayload | null {
  const demo = parseDemoSession(value);
  if (demo) return demo;

  const legacyPatient = parsePatientSession(value);
  if (legacyPatient) {
    return { role: "Patient", email: legacyPatient.email, name: legacyPatient.name };
  }

  if (value === "patient") {
    return {
      role: "Patient",
      email: "riya@example.com",
      name: "Riya Sharma (Demo Patient)",
    };
  }

  return null;
}
