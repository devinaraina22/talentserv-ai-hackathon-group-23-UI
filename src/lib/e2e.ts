import type { UserRole } from "./types";

export const E2E_BEARER = "e2e-test-token";
export const E2E_ROLE_COOKIE = "medibook_e2e_role";

export function isE2eMode(): boolean {
  return (
    process.env.E2E_TEST_MODE === "true" ||
    process.env.NEXT_PUBLIC_E2E_TEST_MODE === "true"
  );
}

export function isE2eClient(): boolean {
  return process.env.NEXT_PUBLIC_E2E_TEST_MODE === "true";
}

const E2E_USERS: Record<
  UserRole,
  { userId: string; email: string; name: string; role: UserRole }
> = {
  Admin: {
    userId: "e2e-admin",
    email: "devina.raina@talentserv.co.in",
    name: "E2E Admin",
    role: "Admin",
  },
  Patient: {
    userId: "e2e-patient",
    email: "riya@example.com",
    name: "Riya Sharma",
    role: "Patient",
  },
  Receptionist: {
    userId: "e2e-receptionist",
    email: "reception@clinic.demo",
    name: "E2E Receptionist",
    role: "Receptionist",
  },
  Doctor: {
    userId: "e2e-doctor",
    email: "doctor@clinic.demo",
    name: "E2E Doctor",
    role: "Doctor",
  },
};

export function parseE2eRole(value: string | null | undefined): UserRole {
  if (value === "Patient" || value === "Admin" || value === "Doctor" || value === "Receptionist") {
    return value;
  }
  return "Admin";
}

export function getE2eRoleFromCookie(): UserRole {
  if (typeof document === "undefined") return "Admin";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${E2E_ROLE_COOKIE}=`));
  return parseE2eRole(match?.split("=")[1]);
}

export function getE2eUser(role?: UserRole) {
  const resolved = role ?? getE2eRoleFromCookie();
  return E2E_USERS[resolved];
}

export async function getE2eToken(): Promise<string> {
  return E2E_BEARER;
}

export function e2eAuthHeaders(role?: UserRole): Record<string, string> {
  const resolved = role ?? getE2eRoleFromCookie();
  return {
    Authorization: `Bearer ${E2E_BEARER}`,
    "X-E2E-Role": resolved,
  };
}
