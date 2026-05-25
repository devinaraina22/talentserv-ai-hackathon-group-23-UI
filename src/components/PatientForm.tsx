"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { GENDERS } from "@/lib/constants";
import { AlertTriangle } from "lucide-react";

type PatientFormData = {
  patient_id: string;
  full_name: string;
  age: string;
  gender: string;
  phone_number: string;
  email: string;
  city: string;
};

export function PatientForm({
  initial,
  mode,
}: {
  initial?: Partial<PatientFormData>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState<PatientFormData>({
    patient_id: initial?.patient_id ?? "",
    full_name: initial?.full_name ?? "",
    age: initial?.age ?? "",
    gender: initial?.gender ?? GENDERS[0],
    phone_number: initial?.phone_number ?? "",
    email: initial?.email ?? "",
    city: initial?.city ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dupWarning, setDupWarning] = useState<{
    duplicate: boolean;
    matches: Array<{ patient_id: string; full_name: string }>;
  } | null>(null);
  const [forceDuplicate, setForceDuplicate] = useState(false);

  const checkDuplicate = useCallback(async () => {
    if (!form.email && !form.phone_number) return;
    const params = new URLSearchParams({
      email: form.email,
      phone: form.phone_number,
    });
    if (mode === "edit") params.set("exclude", form.patient_id);
    const res = await fetch(`/api/patients/check?${params}`);
    const data = await res.json();
    setDupWarning(data);
    setForceDuplicate(false);
  }, [form.email, form.phone_number, form.patient_id, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url =
      mode === "create" ? "/api/patients" : `/api/patients/${form.patient_id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        age: Number(form.age),
        allow_duplicate: forceDuplicate,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save patient");
      return;
    }
    router.push(`/patients/${data.patient_id ?? form.patient_id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {dupWarning?.duplicate && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Possible duplicate patient</p>
              <ul className="mt-1 text-sm">
                {dupWarning.matches.map((m) => (
                  <li key={m.patient_id}>
                    {m.full_name} ({m.patient_id})
                  </li>
                ))}
              </ul>
              {mode === "create" && (
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={forceDuplicate}
                    onChange={(e) => setForceDuplicate(e.target.checked)}
                  />
                  Register anyway (acknowledge duplicate)
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="label">Patient ID</label>
        <input
          className="input-field"
          value={form.patient_id}
          onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
          required
          disabled={mode === "edit"}
        />
      </div>
      <div>
        <label className="label">Full Name</label>
        <input
          className="input-field"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Age</label>
          <input
            type="number"
            className="input-field"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Gender</label>
          <select
            className="input-field"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Phone (10 digits)</label>
        <input
          className="input-field"
          value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          onBlur={checkDuplicate}
          required
        />
      </div>
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          className="input-field"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          onBlur={checkDuplicate}
          required
        />
      </div>
      <div>
        <label className="label">City</label>
        <input
          className="input-field"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={loading || (dupWarning?.duplicate && !forceDuplicate && mode === "create")}
      >
        {loading ? "Saving..." : mode === "create" ? "Register Patient" : "Update Patient"}
      </button>
    </form>
  );
}
