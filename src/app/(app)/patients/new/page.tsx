import Link from "next/link";
import { PatientForm } from "@/components/PatientForm";
import { serverApiJson } from "@/lib/api-server";
import type { Patient } from "@/lib/types";

export default async function NewPatientPage() {
  const patients = await serverApiJson<Patient[]>("/api/patients");
  const nextId = `PAT-${String(patients.length + 1).padStart(3, "0")}`;

  return (
    <div className="space-y-4">
      <Link href="/patients" className="text-sm text-clinic-600 hover:underline">
        ← Back to patients
      </Link>
      <h1 className="text-2xl font-bold">Register Patient</h1>
      <p className="text-sm text-slate-500">
        Enter patient details to create a new record at MediBook Clinic.
      </p>
      <PatientForm mode="create" initial={{ patient_id: nextId }} />
    </div>
  );
}
