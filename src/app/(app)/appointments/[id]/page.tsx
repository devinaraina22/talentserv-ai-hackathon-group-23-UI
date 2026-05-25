import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAppointment,
  getHealthIntake,
  getPatient,
} from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusUpdater } from "@/components/StatusUpdater";
import { RemindButtons } from "@/components/RemindButtons";
import { canSendReminders } from "@/lib/auth";
import { getSessionProfile } from "@/lib/session";
import { FileText, Printer } from "lucide-react";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = getAppointment(id);
  if (!appointment) notFound();

  const patient = getPatient(appointment.patient_id);
  const health = getHealthIntake(appointment.patient_id);
  const profile = await getSessionProfile();
  const showReminders = profile ? canSendReminders(profile.role) : false;

  return (
    <div>
      <PageHeader
        title={appointment.appointment_id}
        subtitle={`${patient?.full_name ?? "Patient"} · ${appointment.doctor_or_department}`}
        action={
          <div className="flex gap-2">
            <Link href={`/appointments/${id}/receipt`} className="btn-primary">
              <Printer className="h-4 w-4" /> Receipt
            </Link>
            <StatusBadge status={appointment.status} />
          </div>
        }
      />

      <div className="card mb-6 grid gap-3 text-sm sm:grid-cols-2">
        <p>
          <span className="text-slate-500">Patient:</span>{" "}
          {patient ? (
            <Link
              href={`/patients/${patient.patient_id}`}
              className="font-medium text-cyan-600 hover:underline"
            >
              {patient.full_name}
            </Link>
          ) : (
            appointment.patient_id
          )}
        </p>
        <p>
          <span className="text-slate-500">When:</span> {appointment.appointment_date}{" "}
          {appointment.appointment_time}
        </p>
        <p>
          <span className="text-slate-500">Type:</span> {appointment.appointment_type}
        </p>
        <p>
          <span className="text-slate-500">Notes:</span> {appointment.notes || "—"}
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <StatusUpdater
          appointmentId={appointment.appointment_id}
          currentStatus={appointment.status}
        />
        {showReminders && patient && (
          <RemindButtons
            appointmentId={appointment.appointment_id}
            patientName={patient.full_name}
            patientId={patient.patient_id}
            patientEmail={patient.email}
            patientPhone={patient.phone_number}
            appointmentDate={appointment.appointment_date}
            appointmentTime={appointment.appointment_time}
          />
        )}
      </div>

      {health ? (
        <div className="card space-y-2 text-sm">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-cyan-600" />
            Health Intake (private detail view)
          </h2>
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
      ) : (
        <div className="card text-sm text-slate-500">
          No health intake on file.{" "}
          <Link
            href={`/patients/${appointment.patient_id}`}
            className="text-cyan-600 hover:underline"
          >
            Add health intake
          </Link>
        </div>
      )}
    </div>
  );
}
