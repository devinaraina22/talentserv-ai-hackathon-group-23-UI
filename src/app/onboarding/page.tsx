"use client";

import { useAppAuth } from "@/hooks/useAppAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApiFetch } from "@/lib/api-client";
import { isE2eClient } from "@/lib/e2e";
import { AmbientBackground } from "@/components/AmbientBackground";
import { MediBookLogo } from "@/components/MediBookLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAppAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isE2eClient() && (!isLoaded || !isSignedIn)) return;

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <AmbientBackground />
      <div className="card relative z-10 w-full max-w-md animate-fade-in text-center">
        <MediBookLogo size={48} className="mx-auto" />
        <h1 className="mt-4 font-display text-2xl text-[var(--cr-text)]">Welcome to MediBook</h1>
        {error ? (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-[var(--cr-text-muted)]">
            Setting up your account
            <span className="loading-dots" />
          </p>
        )}
      </div>
    </div>
  );
}
