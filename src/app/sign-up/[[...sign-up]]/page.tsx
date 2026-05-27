import { SignUp } from "@clerk/nextjs";
import { AmbientBackground } from "@/components/AmbientBackground";

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <AmbientBackground />
      <div className="relative z-10">
        <SignUp forceRedirectUrl="/dashboard" />
      </div>
    </main>
  );
}
