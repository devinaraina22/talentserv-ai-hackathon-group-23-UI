"use client";

import { useAppAuth } from "@/hooks/useAppAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApiFetch } from "@/lib/api-client";
import { Shield } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAppAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    clientApiFetch(getToken, "/api/user/role", { method: "POST" })
      .then(async (res) => {
        if (res.ok) {
          router.replace("/dashboard");
          return;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Could not finish setup. Please refresh and try again.");
      })
      .catch(() => setError("Could not finish setup. Please refresh and try again."));
  }, [getToken, isLoaded, isSignedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl">
        <Shield className="mx-auto h-10 w-10 text-cyan-600" />
        <h1 className="mt-4 font-display text-2xl text-slate-900">Welcome to MediBook</h1>
        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Setting up your account...</p>
        )}
      </div>
    </div>
  );
}
