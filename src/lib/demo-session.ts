export type DemoPatientSession = {
  email: string;
  name: string;
};

export function demoPatientUserId(email: string): string {
  const slug = email.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `demo-patient-${slug || "guest"}`;
}

export function encodePatientSession(data: DemoPatientSession): string {
  const payload = btoa(JSON.stringify(data)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `p:${payload}`;
}

export function parsePatientSession(value: string): DemoPatientSession | null {
  if (!value.startsWith("p:")) return null;
  try {
    const base64 = value.slice(2).replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const parsed = JSON.parse(atob(padded)) as DemoPatientSession;
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
  return value === "patient" || value.startsWith("p:");
}
