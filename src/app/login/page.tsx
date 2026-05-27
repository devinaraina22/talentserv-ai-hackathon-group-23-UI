import { AmbientBackground } from "@/components/AmbientBackground";
import { DemoLoginPicker } from "@/components/DemoLoginPicker";
import { MediBookLogo } from "@/components/MediBookLogo";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { CLINIC } from "@/lib/constants";
import { DEMO_SESSION_COOKIE, isDemoLoginEnabled } from "@/lib/demo-auth";
import { SignIn } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const hasSession = (await cookies()).get(DEMO_SESSION_COOKIE)?.value;
  if (isDemoLoginEnabled() && hasSession) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6 pb-12">
      <AmbientBackground />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <MediBookLogo size={52} />
          <p className="font-display text-lg font-semibold text-[var(--cr-text)]">{CLINIC.name}</p>
        </div>
        {isDemoLoginEnabled() ? (
          <DemoLoginPicker />
        ) : (
          <SignIn forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
        )}
      </div>
    </main>
  );
}
