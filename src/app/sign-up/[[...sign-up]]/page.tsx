import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-clinic-50">
      <SignUp forceRedirectUrl="/dashboard" />
    </main>
  );
}
