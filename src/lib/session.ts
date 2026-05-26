import { auth, currentUser } from "@clerk/nextjs/server";
import { serverApiJson } from "./api-server";
import type { UserProfile } from "./types";

export async function getSessionUser(): Promise<{
  userId: string;
  email: string;
  name: string;
} | null> {
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
