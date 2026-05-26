import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { serverApiJson } from "@/lib/api-server";
import { CLINIC, DISCLAIMER } from "@/lib/constants";
import { PrintButton } from "@/components/PrintButton";
import type { Appointment, Patient } from "@/lib/types";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await serverApiJson<{
    appointment: Appointment;
    patient: Patient | null;
  }>(`/api/appointments/${id}`).catch(() => null);
  if (!data?.appointment) notFound();

  const { appointment, patient } = data;

  return (
    <div>
      <div className="no-print mb-6 flex gap-3">
        <Link href={`/appointments/${id}`} className="btn-secondary">
          ← Back
        </Link>
        <PrintButton />
      </div>

      <article
        id="receipt"
        className="mx-auto max-w-lg rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 shadow-sm print:border-solid print:shadow-none"
      >
        <div className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xl font-bold text-slate-900">{CLINIC.name}</p>
          <p className="text-sm text-teal-700">{CLINIC.tagline}</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-cyan-700">
            Appointment Confirmation Receipt
          </p>
        </div>

        <div className="space-y-3 py-6 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Appointment ID</span>
            <span className="font-mono font-semibold text-violet-700">
              {appointment.appointment_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Patient ID</span>
            <span className="font-mono font-semibold text-cyan-700">
              {patient?.patient_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Patient</span>
            <span className="font-semibold">{patient?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department</span>
            <span>{appointment.doctor_or_department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span>{appointment.appointment_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Time</span>
            <span>{appointment.appointment_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type</span>
            <span>{appointment.appointment_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="font-semibold text-cyan-700">{appointment.status}</span>
          </div>
          {appointment.notes && (
            <div>
              <span className="text-slate-500">Notes</span>
              <p className="mt-1">{appointment.notes}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 text-sm">
          <p className="font-semibold text-cyan-900">Need to make a change?</p>
          <p className="mt-1 text-slate-700">
            To <strong>reschedule</strong> or <strong>cancel</strong>, reply by email to{" "}
            <strong className="text-teal-800">{CLINIC.email}</strong> or call{" "}
            <strong className="text-teal-800">{CLINIC.phoneDisplay}</strong>.
          </p>
          <p className="mt-2 text-xs text-slate-500">{CLINIC.address}</p>
        </div>

        <div className="mt-6 border-t border-teal-200 bg-teal-50/40 pt-6 text-center">
          <Image
            src="/medibook-clinic-logo.svg"
            alt={CLINIC.name}
            width={220}
            height={64}
            className="mx-auto"
          />
          <p className="mt-2 text-xs text-slate-500">{CLINIC.tagline}</p>
        </div>

        <div className="pt-4 text-center text-xs text-slate-500">
          <p>{DISCLAIMER}</p>
          <p className="mt-2">Generated {new Date().toLocaleString()}</p>
        </div>
      </article>
    </div>
  );
}
