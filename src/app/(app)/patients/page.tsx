import Link from "next/link";
import { listPatients } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { getSessionProfile } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PatientsPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/onboarding");
  if (profile.role === "Patient") redirect("/appointments");

  const patients = await listPatients();

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle="Manage patient records at MediBook Clinic"
        action={
          <Link href="/patients/new" className="btn-primary">
            + Register Patient
          </Link>
        }
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Age</th>
              <th className="pb-2 pr-4">City</th>
              <th className="pb-2 pr-4">Phone</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-slate-500">
                  No patients registered yet. Register your first patient to get started.
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.patient_id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-mono text-xs">{p.patient_id}</td>
                  <td className="py-2 pr-4">{p.full_name}</td>
                  <td className="py-2 pr-4">{p.age}</td>
                  <td className="py-2 pr-4">{p.city}</td>
                  <td className="py-2 pr-4">{p.phone_number}</td>
                  <td className="py-2">
                    <Link
                      href={`/patients/${p.patient_id}`}
                      className="text-clinic-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
