import Link from "next/link";
import { listPatients, getPatientByEmail } from "@/lib/db";
import { getSessionProfile } from "@/lib/session";
import { AppointmentForm } from "@/components/AppointmentForm";
import { PageHeader } from "@/components/PageHeader";
import { redirect } from "next/navigation";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>;
}) {
  const { patient } = await searchParams;
  const profile = await getSessionProfile();
  if (!profile) redirect("/onboarding");

  let patients = await listPatients();
  if (profile.role === "Patient") {
    const linked = await getPatientByEmail(profile.email);
    patients = linked ? [linked] : [];
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
