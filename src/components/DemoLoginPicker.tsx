"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api-client";
import { DEMO_ROLE_COLORS, setDemoSession } from "@/lib/demo-auth";
import { ROLE_BADGE_LIGHT } from "@/lib/auth";
import { CLINIC } from "@/lib/constants";
import type { UserRole } from "@/lib/types";
import { ArrowLeft, LogIn } from "lucide-react";

type AuthMode = "main" | "google";

type RoleOption = {
  role: UserRole;
  title: string;
  description: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "Admin",
    title: "Admin",
    description: "Manage the clinic, patients, and staff settings",
  },
  {
    role: "Receptionist",
    title: "Receptionist",
    description: "Register patients and book appointments",
  },
  {
    role: "Doctor",
    title: "Doctor",
    description: "View your schedule and update availability",
  },
  {
    role: "Patient",
    title: "Patient",
    description: "Book visits and view your appointments",
  },
];

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function DemoLoginPicker() {
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [mode, setMode] = useState<AuthMode>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function backToRoles() {
    setSelectedRole(null);
    setMode("main");
    setEmail("");
    setPassword("");
    setError(null);
  }

  async function signIn(provider: "google" | "email") {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/demo-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: provider === "email" ? password : undefined,
          provider,
          role: selectedRole.role,
        }),
      });
      const body = (await res.json()) as { error?: string; session?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not sign in. Please try again.");

      setDemoSession(body.session ?? "patient");
      sessionStorage.removeItem("medibook_role_profile_v1");
      window.location.assign("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!selectedRole) {
    return (
      <div className="login-card w-full max-w-[400px] animate-fade-in">
        <div className="mb-6 text-center">
          <h1 className="font-display text-xl font-semibold text-[var(--cr-text)]">Choose your role</h1>
          <p className="mt-1 text-sm text-[var(--cr-text-muted)]">
            Select how you&apos;ll use {CLINIC.name}
          </p>
        </div>

        <div className="space-y-3">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.role}
              type="button"
              data-testid={`demo-login-${option.role.toLowerCase()}`}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${DEMO_ROLE_COLORS[option.role]}`}
              onClick={() => setSelectedRole(option)}
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--cr-text)]">{option.title}</p>
                <p className="mt-0.5 text-xs text-[var(--cr-text-muted)]">{option.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${ROLE_BADGE_LIGHT[option.role]}`}
                >
                  {option.role}
                </span>
                <LogIn className="h-4 w-4 text-[var(--cr-text-muted)]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "google") {
    return (
      <div className="login-card w-full max-w-[400px] animate-fade-in">
        <button
          type="button"
          onClick={() => {
            setMode("main");
            setError(null);
          }}
          className="mb-4 flex items-center gap-1 text-sm text-[var(--cr-text-muted)] hover:text-[var(--cr-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-4 text-center">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ROLE_BADGE_LIGHT[selectedRole.role]}`}
          >
            {selectedRole.role}
          </span>
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
          <GoogleIcon />
          <h1 className="mt-4 font-display text-xl font-semibold text-[var(--cr-text)]">
            Sign in with Google
          </h1>
          <p className="mt-1 text-sm text-[var(--cr-text-muted)]">Use your Google account email</p>
        </div>

        {error && <p className="login-error">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void signIn("google");
          }}
          className="space-y-4"
        >
          <div>
            <label className="login-label" htmlFor="google-email">
              Email
            </label>
            <input
              id="google-email"
              type="email"
              required
              autoComplete="email"
              className="login-input"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="demo-login-email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="login-btn-primary"
            data-testid="demo-login-submit-google"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-card w-full max-w-[400px] animate-fade-in">
      <button
        type="button"
        onClick={backToRoles}
        className="mb-4 flex items-center gap-1 text-sm text-[var(--cr-text-muted)] hover:text-[var(--cr-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to roles
      </button>

      <div className="mb-6 text-center">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ROLE_BADGE_LIGHT[selectedRole.role]}`}
        >
          {selectedRole.role}
        </span>
        <h1 className="mt-3 font-display text-xl font-semibold text-[var(--cr-text)]">
          Welcome to MediBook
        </h1>
        <p className="mt-1 text-sm text-[var(--cr-text-muted)]">Sign in to {CLINIC.name}</p>
      </div>

      {error && <p className="login-error">{error}</p>}

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setError(null);
          setMode("google");
        }}
        className="login-btn-google"
        data-testid="demo-login-google"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="login-divider">
        <span>or</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void signIn("email");
        }}
        className="space-y-4"
      >
        <div>
          <label className="login-label" htmlFor="demo-email">
            Email address
          </label>
          <input
            id="demo-email"
            type="email"
            required
            autoComplete="email"
            className="login-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="demo-login-email"
          />
        </div>

        <div>
          <label className="login-label" htmlFor="demo-password">
            Password
          </label>
          <input
            id="demo-password"
            type="password"
            required
            autoComplete="current-password"
            className="login-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="demo-login-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="login-btn-primary"
          data-testid={`demo-login-submit-${selectedRole.role.toLowerCase()}`}
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
