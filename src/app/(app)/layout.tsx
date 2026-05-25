import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RoleProvider } from "@/components/RoleProvider";
import { getSessionProfile } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/onboarding");

  return (
    <RoleProvider>
      <AppShell>{children}</AppShell>
    </RoleProvider>
  );
}
