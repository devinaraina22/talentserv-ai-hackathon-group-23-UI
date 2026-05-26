"use client";

import { useAppAuth } from "@/hooks/useAppAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clientApiFetch } from "@/lib/api-client";
import { APPOINTMENT_TYPES, DEPARTMENTS } from "@/lib/constants";
import { UI } from "@/lib/user-messages";
import type { Patient } from "@/lib/types";
import { AlertBanner } from "@/components/AlertBanner";

export function AppointmentForm({
  patients,
  defaultPatientId,
}: {
  patients: Patient[];
  defaultPatientId?: string;
}) {
  const router = useRouter();
  const { getToken } = useAppAuth();
  const [form, setForm] = useState({
    patient_id: defaultPatientId ?? (patients[0]?.patient_id ?? ""),
    doctor_or_department: DEPARTMENTS[0] as string,
    appointment_date: new Date().toISOString().slice(0, 10),
    appointment_time: "",
    appointment_type: APPOINTMENT_TYPES[0] as "In-person" | "Online",
    notes: "",
  });
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!form.doctor_or_department || !form.appointment_date) return;
    clientApiFetch(
      getToken,
      `/api/availability?department=${encodeURIComponent(form.doctor_or_department)}&date=${form.appointment_date}`
    )
      .then((r) => r.json())
      .then((d) => {
        const slots = d.slots ?? [];
        setTimeSlots(slots);
        if (slots.length) {
          setForm((f) =>
            slots.includes(f.appointment_time)
              ? f
              : { ...f, appointment_time: slots[0] }
          );
        }
      });
  }, [form.doctor_or_department, form.appointment_date, getToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await clientApiFetch(getToken, "/api/appointments", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "We could not book this appointment. Please try again.");
      return;
    }

    router.push(`/appointments/${data.appointment_id}/receipt`);
    router.refresh();
  }

  if (patients.length === 0) {
    return (
      <div className="card text-sm text-slate-600">
        Register a patient first.{" "}
        <Link href="/patients/new" className="text-cyan-600 hover:underline">
          Register patient
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-4">
      {error && <AlertBanner type="error" message={error} />}

      <div>
        <label className="label">Patient</label>
        <select
          className="input-field"
          value={form.patient_id}
          onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
        >
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.patient_id} — {p.full_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Doctor / Department</label>
        <select
          className="input-field"
          value={form.doctor_or_department}
          onChange={(e) =>
            setForm({ ...form, doctor_or_department: e.target.value, appointment_time: "" })
          }
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input-field"
            value={form.appointment_date}
            onChange={(e) =>
              setForm({ ...form, appointment_date: e.target.value, appointment_time: "" })
            }
            required
          />
        </div>
        <div>
          <label className="label">Available time</label>
          {timeSlots.length === 0 ? (
            <p className="text-sm text-amber-600">{UI.noSlots}</p>
          ) : (
            <select
              className="input-field"
              value={form.appointment_time}
              onChange={(e) =>
                setForm({ ...form, appointment_time: e.target.value })
              }
              required
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div>
        <label className="label">Appointment Type</label>
        <select
          className="input-field"
          value={form.appointment_type}
          onChange={(e) =>
            setForm({
              ...form,
              appointment_type: e.target.value as "In-person" | "Online",
            })
          }
        >
          {APPOINTMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input-field"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={loading || !form.appointment_time}
      >
        {loading ? "Booking..." : "Book Appointment"}
      </button>
    </form>
  );
}
