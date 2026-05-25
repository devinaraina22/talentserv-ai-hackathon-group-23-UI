"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/auth";
import { DEPARTMENTS } from "@/lib/constants";
import { UI } from "@/lib/user-messages";
import type { UserRole } from "@/lib/types";
import { Shield, UserCircle } from "lucide-react";

const roleDescriptions: Record<UserRole, string> = {
  Admin: "Full access — manage everything",
  Receptionist: "Register patients, book appointments, send reminders",
  Doctor: "View department schedule, update appointment status",
  Patient: "Book and view your own appointments only",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("Receptionist");
  const [department, setDepartment] = useState<string>(DEPARTMENTS[0]);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    const res = await fetch("/api/user/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        department: role === "Doctor" ? department : undefined,
      }),
    });
    setLoading(false);
    if (res.ok) router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-cyan-600 to-violet-600 px-8 py-10 text-white">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="font-display text-3xl">Welcome to MediBook</h1>
              <p className="mt-1 text-cyan-100">{UI.onboardingSubtitle}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-8">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition ${
                role === r
                  ? "border-cyan-500 bg-cyan-50/50"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <UserCircle
                className={`h-6 w-6 shrink-0 ${role === r ? "text-cyan-600" : "text-slate-400"}`}
              />
              <div>
                <p className="font-semibold text-slate-900">{r}</p>
                <p className="text-sm text-slate-500">{roleDescriptions[r]}</p>
              </div>
            </button>
          ))}

          {role === "Doctor" && (
            <div>
              <label className="label">Your department</label>
              <select
                className="input-field"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Setting up..." : "Enter Clinic Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
