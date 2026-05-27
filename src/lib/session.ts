import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { serverApiJson } from "./api-server";
import {
  DEMO_PATIENT,
  DEMO_SESSION_COOKIE,
  demoAuthHeaders,
  isDemoLoginEnabled,
} from "./demo-auth";
import { isPatientSession, parseDemoSession, demoSessionUserId, resolveDemoSessionPayload } from "./demo-session";
import {
  E2E_ROLE_COOKIE,
  getE2eUser,
  isE2eMode,
  parseE2eRole,
} from "./e2e";
import { apiUrl } from "./api-client";
import type { UserProfile, UserRole } from "./types";

async function getDemoSessionUserFromCookie(): Promise<{
  userId: string;
  email: string;
  name: string;
  role?: UserRole;
  department?: string;
} | null> {
  if (!isDemoLoginEnabled()) return null;
  const cookie = (await cookies()).get(DEMO_SESSION_COOKIE)?.value;
  if (!cookie) return null;

  const payload = resolveDemoSessionPayload(cookie) ?? parseDemoSession(cookie);
  if (payload) {
    return {
      userId: demoSessionUserId(payload),
      email: payload.email,
      name: payload.name,
      role: payload.role,
      department: payload.department,
    };
  }

  if (isPatientSession(cookie)) {
    if (cookie === "patient") {
      return { ...DEMO_PATIENT, role: "Patient" };
    }
  }

  try {
    const res = await fetch(
      apiUrl(`/api/demo-login?session=${encodeURIComponent(cookie)}`),
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      user?: {
        userId: string;
        email: string;
        name: string;
        role?: UserRole;
        department?: string;
      };
    };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<{
  userId: string;
  email: string;
  name: string;
  role?: UserRole;
} | null> {
  if (isE2eMode()) {
    const role = parseE2eRole((await cookies()).get(E2E_ROLE_COOKIE)?.value);
    const user = getE2eUser(role);
    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  const demoUser = await getDemoSessionUserFromCookie();
  if (demoUser) return demoUser;

  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return {
    userId,
    email: user?.primaryEmailAddress?.emailAddress ?? "unknown@example.com",
    name: user?.fullName ?? user?.firstName ?? "User",
  };
}

export async function getSessionProfile(): Promise<UserProfile | null> {
  const session = await getSessionUser();
  if (!session) return null;
  try {
    const data = await serverApiJson<{ profile: UserProfile | null }>("/api/user/role");
    return data.profile ?? null;
  } catch {
    return null;
  }
}

export async function requireProfile(): Promise<UserProfile> {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("ROLE_REQUIRED");
  return profile;
}
