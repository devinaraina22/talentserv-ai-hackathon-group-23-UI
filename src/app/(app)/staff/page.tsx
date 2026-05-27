import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { StaffAccessPanel } from "@/components/StaffAccessPanel";
import { PageHeader } from "@/components/PageHeader";

export default async function StaffPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/onboarding");
  if (profile.role !== "Admin") redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Staff Access"
        subtitle="Pre-register clinic staff by email. Anyone not listed here gets Patient access when they sign in."
        badge="Admin only"
      />
      <StaffAccessPanel />
    </div>
  );
}
