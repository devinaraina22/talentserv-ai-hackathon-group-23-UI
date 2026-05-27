import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApiJson } from "@/lib/api-server";
import { HealthIntakeForm } from "@/components/HealthIntakeForm";
import type { HealthIntake, Patient } from "@/lib/types";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await serverApiJson<{ patient: Patient; health: HealthIntake | null }>(
    `/api/patients/${id}`
  ).catch(() => null);
  if (!data?.patient) notFound();

  const { patient, health } = data;

  return (
    <div className="space-y-6">
      <Link href="/patients" className="text-sm text-clinic-600 hover:underline">
        ← Back to patients
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{patient.full_name}</h1>
        <div className="flex gap-2">
          <Link href={`/patients/${id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <Link href={`/appointments/new?patient=${id}`} className="btn-primary">
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="card grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <span className="text-slate-500">Patient ID:</span> {patient.patient_id}
        </p>
        <p>
          <span className="text-slate-500">Age / Gender:</span> {patient.age} /{" "}
          {patient.gender}
        </p>
        <p>
          <span className="text-slate-500">Phone:</span> {patient.phone_number}
        </p>
        <p>
          <span className="text-slate-500">Email:</span> {patient.email}
        </p>
        <p>
          <span className="text-slate-500">Location:</span>{" "}
          {[patient.city, patient.country ?? patient.country_code].filter(Boolean).join(", ") ||
            "—"}
        </p>
      </div>

      {health ? (
        <div className="card space-y-2 text-sm">
          <h2 className="text-lg font-semibold">Saved Health Intake</h2>
          <p>
            <span className="text-slate-500">Symptoms:</span> {health.symptoms}
          </p>
          <p>
            <span className="text-slate-500">Conditions:</span>{" "}
            {health.existing_conditions}
          </p>
          <p>
            <span className="text-slate-500">Allergies:</span> {health.allergies}
          </p>
          <p>
            <span className="text-slate-500">Medications:</span>{" "}
            {health.current_medications}
          </p>
          <p>
            <span className="text-slate-500">Visit reason:</span> {health.visit_reason}
          </p>
          <p>
            <span className="text-slate-500">Emergency:</span> {health.emergency_contact}
          </p>
        </div>
      ) : null}

      <HealthIntakeForm patientId={id} initial={health ?? undefined} />
    </div>
  );
}
