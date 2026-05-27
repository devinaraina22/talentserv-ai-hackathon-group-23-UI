import { SignIn } from "@clerk/nextjs";
import { AmbientBackground } from "@/components/AmbientBackground";
import { MediBookLogo } from "@/components/MediBookLogo";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6 pb-12">
      <AmbientBackground />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <MediBookLogo size={52} />
          <p className="font-display text-lg font-semibold text-[var(--cr-text)]">MediBook Clinic</p>
        </div>
        <SignIn forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
      </div>
    </main>
  );
}
