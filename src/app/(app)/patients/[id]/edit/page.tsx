import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatient } from "@/lib/db";
import { PatientForm } from "@/components/PatientForm";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  return (
    <div className="space-y-4">
      <Link href={`/patients/${id}`} className="text-sm text-clinic-600 hover:underline">
        ← Back to patient
      </Link>
      <h1 className="text-2xl font-bold">Edit Patient</h1>
      <PatientForm
        mode="edit"
        initial={{
          patient_id: patient.patient_id,
          full_name: patient.full_name,
          age: String(patient.age),
          gender: patient.gender,
          phone_number: patient.phone_number,
          email: patient.email,
          city: patient.city,
        }}
      />
    </div>
  );
}
