import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { serverApiJson } from "./api-server";
import {
  E2E_ROLE_COOKIE,
  getE2eUser,
  isE2eMode,
  parseE2eRole,
} from "./e2e";
import type { UserProfile } from "./types";

export async function getSessionUser(): Promise<{
  userId: string;
  email: string;
  name: string;
} | null> {
  if (isE2eMode()) {
    const role = parseE2eRole((await cookies()).get(E2E_ROLE_COOKIE)?.value);
    const user = getE2eUser(role);
    return { userId: user.userId, email: user.email, name: user.name };
  }

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
