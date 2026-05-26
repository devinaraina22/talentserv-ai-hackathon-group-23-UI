"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clientApiFetch } from "@/lib/api-client";
import { DISCLAIMER } from "@/lib/constants";

type HealthFormData = {
  patient_id: string;
  symptoms: string;
  existing_conditions: string;
  allergies: string;
  current_medications: string;
  visit_reason: string;
  emergency_contact: string;
  consent_acknowledged: boolean;
};

export function HealthIntakeForm({
  patientId,
  initial,
}: {
  patientId: string;
  initial?: Partial<HealthFormData>;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [form, setForm] = useState<HealthFormData>({
    patient_id: patientId,
    symptoms: initial?.symptoms ?? "",
    existing_conditions: initial?.existing_conditions ?? "",
    allergies: initial?.allergies ?? "",
    current_medications: initial?.current_medications ?? "",
    visit_reason: initial?.visit_reason ?? "",
    emergency_contact: initial?.emergency_contact ?? "",
    consent_acknowledged: initial?.consent_acknowledged ?? false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await clientApiFetch(getToken, "/api/health", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save health intake");
      return;
    }
    router.refresh();
  }

  const fields = [
    { key: "symptoms" as const, label: "Symptoms", placeholder: "Fever, cough" },
    {
      key: "existing_conditions" as const,
      label: "Existing Conditions",
      placeholder: "Diabetes / asthma / none",
    },
    { key: "allergies" as const, label: "Allergies", placeholder: "Penicillin / none" },
    {
      key: "current_medications" as const,
      label: "Current Medications",
      placeholder: "Metformin / none",
    },
    {
      key: "visit_reason" as const,
      label: "Visit Reason",
      placeholder: "General consultation",
    },
    {
      key: "emergency_contact" as const,
      label: "Emergency Contact",
      placeholder: "Name and phone number",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-semibold">Health Intake</h2>
      <p className="text-xs text-slate-500">
        Basic appointment-relevant information only. No diagnosis or treatment advice.
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {fields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="label">{label}</label>
          <input
            className="input-field"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            required
          />
        </div>
      ))}

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.consent_acknowledged}
          onChange={(e) =>
            setForm({ ...form, consent_acknowledged: e.target.checked })
          }
          className="mt-1"
        />
        <span>
          I acknowledge that this intake is for booking purposes only and does not
          constitute medical advice. ({DISCLAIMER.slice(0, 80)}…)
        </span>
      </label>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Save Health Intake"}
      </button>
    </form>
  );
}
