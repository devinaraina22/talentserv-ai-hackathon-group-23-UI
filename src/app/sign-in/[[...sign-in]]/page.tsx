import { SignIn } from "@clerk/nextjs";
import { AmbientBackground } from "@/components/AmbientBackground";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <AmbientBackground />
      <div className="relative z-10">
        <SignIn forceRedirectUrl="/dashboard" />
      </div>
    </main>
  );
}
