import Link from "next/link";
import { Suspense } from "react";
import { serverApiJson } from "@/lib/api-server";
import { StatusBadge } from "@/components/StatusBadge";
import { AppointmentSearch } from "@/components/AppointmentSearch";
import { PageHeader } from "@/components/PageHeader";
import { getSessionProfile } from "@/lib/session";
import type { Appointment, Patient } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    department?: string;
    date?: string;
  }>;
}) {
  const profile = await getSessionProfile();
  if (!profile) redirect("/onboarding");

  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.department) query.set("department", params.department);
  if (params.date) query.set("date", params.date);

  const qs = query.toString();
  const appointments = await serverApiJson<Appointment[]>(
    `/api/appointments${qs ? `?${qs}` : ""}`
  );
  const patients = await serverApiJson<Patient[]>("/api/patients");
  const patientMap = new Map(patients.map((p) => [p.patient_id, p.full_name]));

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="View and manage clinic appointments"
        action={
          <Link href="/appointments/new" className="btn-primary">
            + Book
          </Link>
        }
      />

      <Suspense fallback={<div className="card">Loading filters...</div>}>
        <AppointmentSearch />
      </Suspense>

      <p className="text-sm text-slate-500">
        Select an appointment to view full details and health intake.
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Patient</th>
              <th className="pb-2 pr-4">Department</th>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2 pr-4">Time</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-slate-500">
                  No appointments match your filters.
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.appointment_id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/appointments/${a.appointment_id}`}
                      className="font-mono text-xs text-clinic-600 hover:underline"
                    >
                      {a.appointment_id}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    {patientMap.get(a.patient_id) ?? a.patient_id}
                  </td>
                  <td className="py-2 pr-4">{a.doctor_or_department}</td>
                  <td className="py-2 pr-4">{a.appointment_date}</td>
                  <td className="py-2 pr-4">{a.appointment_time}</td>
                  <td className="py-2 pr-4">{a.appointment_type}</td>
                  <td className="py-2">
                    <StatusBadge status={a.status} />
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
