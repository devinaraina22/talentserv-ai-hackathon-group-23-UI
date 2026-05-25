"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useRole } from "@/components/RoleProvider";
import { canSendReminders } from "@/lib/auth";
import type { ReminderLog } from "@/lib/types";
import { CalendarClock, Mail, MessageSquare, Send } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  booking_confirmation: "Booking confirmation",
  day_before: "1 day before (friendly)",
  manual: "Manual reminder",
};

export default function RemindersPage() {
  const { profile } = useRole();
  const [reminders, setReminders] = useState<ReminderLog[]>([]);
  const [appointmentId, setAppointmentId] = useState("APT-001");
  const [sending, setSending] = useState<"email" | "sms" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [cronResult, setCronResult] = useState<string | null>(null);

  const allowed = profile ? canSendReminders(profile.role) : false;

  const load = () =>
    fetch("/api/reminders")
      .then((r) => (r.ok ? r.json() : []))
      .then(setReminders);

  useEffect(() => {
    if (allowed) load();
  }, [allowed]);

  async function send(channel: "email" | "sms") {
    setSending(channel);
    setFeedback(null);
    const res = await fetch(`/api/appointments/${appointmentId}/remind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });
    const data = await res.json();
    setSending(null);
    if (res.ok) {
      setFeedback(
        data.simulated
          ? `Logged (configure SMTP for real email). Type: ${data.reminder_type}`
          : `Real email sent to ${data.recipient}`
      );
      load();
    } else {
      setFeedback(data.error ?? "Failed");
    }
  }

  async function runDueReminders() {
    setCronResult("Running day-before job...");
    const res = await fetch("/api/cron/reminders", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setCronResult(
        `Sent ${data.sent} friendly reminder(s), skipped ${data.skipped}. Email configured: ${data.emailConfigured}`
      );
      load();
    } else {
      setCronResult(data.error ?? "Cron failed — set CRON_SECRET or use: npm run reminders:due");
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
        title="Patient Emails & Reminders"
        subtitle="Real SMTP emails on booking + friendly reminder 1 day before"
      />

      <div className="card mb-6 border-cyan-200 bg-cyan-50/50">
        <h3 className="flex items-center gap-2 font-semibold text-cyan-900">
          <CalendarClock className="h-5 w-5" />
          Automatic day-before reminders
        </h3>
        <p className="mt-2 text-sm text-cyan-800">
          Patients with a <strong>Booked</strong> appointment tomorrow receive a friendly email
          with their name, <strong>Patient ID</strong> (PAT-xxx) and <strong>Appointment ID</strong>{" "}
          (APT-xxx).
        </p>
        <button type="button" onClick={runDueReminders} className="btn-primary mt-4">
          Run due reminders now
        </button>
        <p className="mt-2 text-xs text-cyan-700">
          Production: schedule daily → <code className="rounded bg-white px-1">npm run reminders:due</code> or POST /api/cron/reminders
        </p>
        {cronResult && <p className="mt-2 text-sm text-slate-700">{cronResult}</p>}
      </div>

      <div className="card mb-8 space-y-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <Send className="h-5 w-5 text-cyan-600" />
          Send manual reminder
        </h3>
        <div>
          <label className="label">Appointment ID (APT-xxx)</label>
          <input
            className="input-field max-w-xs font-mono"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
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
            SMS (simulated)
          </button>
        </div>
        {feedback && (
          <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{feedback}</p>
        )}
      </div>

      <h3 className="mb-4 font-semibold text-slate-900">Sent log</h3>
      <div className="space-y-3">
        {reminders.map((r) => (
          <div key={r.id} className="card flex gap-4 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {TYPE_LABELS[r.reminder_type ?? "manual"]} · {r.appointment_id}
                {r.simulated ? (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    dev/log
                  </span>
                ) : (
                  <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                    sent
                  </span>
                )}
              </p>
              <p className="text-slate-600">{r.message}</p>
              <p className="text-xs text-slate-400">
                {r.channel} → {r.recipient} · {new Date(r.sent_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
