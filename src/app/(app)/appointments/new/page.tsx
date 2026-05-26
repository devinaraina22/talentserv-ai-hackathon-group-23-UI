import Link from "next/link";
import { serverApiJson } from "@/lib/api-server";
import { getSessionProfile } from "@/lib/session";
import { AppointmentForm } from "@/components/AppointmentForm";
import { PageHeader } from "@/components/PageHeader";
import type { Patient } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const { patient } = await searchParams;
  const profile = await getSessionProfile();
  if (!profile) redirect("/onboarding");

  let patients = await serverApiJson<Patient[]>("/api/patients");
  if (profile.role === "Patient") {
    patients = patients.filter(
      (p) => p.email.toLowerCase() === profile.email.toLowerCase()
    );
  }

  return (
    <div>
      <PageHeader
        title="Book Appointment"
        subtitle="Choose an available time slot for your visit"
      />
      <AppointmentForm patients={patients} defaultPatientId={patient} />
      <Link href="/appointments" className="mt-4 inline-block text-sm text-cyan-600 hover:underline">
        ← Back to appointments
      </Link>
    </div>
  );
}
