import Link from "next/link";
import { PatientForm } from "@/components/PatientForm";
import { listPatients } from "@/lib/db";

export default function NewPatientPage() {
  const nextId = `PAT-${String(listPatients().length + 1).padStart(3, "0")}`;

  return (
    <div className="space-y-4">
      <Link href="/patients" className="text-sm text-clinic-600 hover:underline">
        ← Back to patients
      </Link>
      <h1 className="text-2xl font-bold">Register Patient</h1>
      <p className="text-sm text-slate-500">Use synthetic data only for demo and testing.</p>
      <PatientForm mode="create" initial={{ patient_id: nextId }} />
    </div>
  );
}
