"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { clientApiFetch } from "@/lib/api-client";
import { PageHeader } from "@/components/PageHeader";
import { AlertBanner } from "@/components/AlertBanner";
import { useRole } from "@/components/RoleProvider";
import { canSendReminders } from "@/lib/auth";
import { UI } from "@/lib/user-messages";
import type { ReminderLog } from "@/lib/types";
import { CalendarClock, Mail, MessageSquare, Send } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  booking_confirmation: "Booking confirmation",
  day_before: "Appointment reminder",
  manual: "Manual reminder",
};

export default function RemindersPage() {
  const { profile } = useRole();
  const { getToken } = useAuth();
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [appointmentId, setAppointmentId] = useState("APT-001");
  const [sending, setSending] = useState<"email" | "sms" | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [cronResult, setCronResult] = useState<string | null>(null);

  const allowed = profile ? canSendReminders(profile.role) : false;

  const load = () =>
    clientApiFetch(getToken, "/api/reminders")
      .then((r) => (r.ok ? r.json() : []))
      .then(setReminders);

  useEffect(() => {
    if (allowed) load();
  }, [allowed]);

  async function send(channel: "email" | "sms") {
    setSending(channel);
    setFeedback(null);
    const res = await clientApiFetch(getToken, `/api/appointments/${appointmentId}/remind`, {
      method: "POST",
      body: JSON.stringify({ channel }),
    });
    const data = await res.json();
    setSending(null);
    if (res.ok) {
      setFeedback({
        type: "success",
        message: channel === "email" ? UI.reminderEmailSent : UI.reminderSmsSent,
      });
      load();
    } else {
      setFeedback({
        type: "error",
        message: data.error ?? "We could not send the reminder. Please try again.",
      });
    }
  }

  async function runDueReminders() {
    setCronResult(null);
    const res = await clientApiFetch(getToken, "/api/cron/reminders", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      const sent = data.sent ?? 0;
      setCronResult(
        sent === 0
          ? "No reminders were due today."
          : `${sent} reminder${sent === 1 ? "" : "s"} sent successfully.`
      );
      load();
    } else {
      setCronResult("Unable to run reminders right now. Please try again later.");
    }
  }

  if (!allowed) {
    return (
      <div className="card max-w-lg text-center">
        <p className="font-semibold text-slate-900">Access restricted</p>
        <p className="mt-2 text-sm text-slate-500">
          Only Admin and Receptionist can send patient reminders.
        </p>
        <Link href="/dashboard" className="btn-secondary mt-4 inline-flex">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Patient Reminders"
        subtitle="Send confirmation and appointment reminder emails to patients"
      />

      <div className="card mb-6 border-cyan-200 bg-cyan-50/50">
        <h3 className="flex items-center gap-2 font-semibold text-cyan-900">
          <CalendarClock className="h-5 w-5" />
          Day-before reminders
        </h3>
        <p className="mt-2 text-sm text-cyan-800">
          Patients with a booked appointment tomorrow receive a friendly email with their
          appointment details and reference numbers.
        </p>
        <button type="button" onClick={runDueReminders} className="btn-primary mt-4">
          Send due reminders now
        </button>
        {cronResult && (
          <p className="mt-3 text-sm text-slate-700">{cronResult}</p>
        )}
      </div>

      <div className="card mb-8 space-y-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <Send className="h-5 w-5 text-cyan-600" />
          Send manual reminder
        </h3>
        <div>
          <label className="label">Appointment reference</label>
          <input
            className="input-field max-w-xs font-mono"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            placeholder="APT-001"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!!sending}
            onClick={() => send("email")}
            className="btn-primary"
          >
            <Mail className="h-4 w-4" />
            {sending === "email" ? "Sending..." : "Email patient"}
          </button>
          <button
            type="button"
            disabled={!!sending}
            onClick={() => send("sms")}
            className="btn-secondary"
          >
            <MessageSquare className="h-4 w-4" />
            {sending === "sms" ? "Sending..." : "SMS patient"}
          </button>
        </div>
        {feedback && <AlertBanner type={feedback.type} message={feedback.message} />}
      </div>

      <h3 className="mb-4 font-semibold text-slate-900">Recent reminders</h3>
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-sm text-slate-500">No reminders sent yet.</p>
        ) : (
          reminders.map((r) => (
            <div key={r.id} className="card flex gap-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {TYPE_LABELS[r.reminder_type ?? "manual"]} · {r.appointment_id}
                  <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                    sent
                  </span>
                </p>
                <p className="text-slate-600">{r.message}</p>
                <p className="text-xs text-slate-400">
                  {r.channel} → {r.recipient} · {new Date(r.sent_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
