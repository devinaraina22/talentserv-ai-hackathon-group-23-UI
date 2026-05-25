"use client";

import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { UI } from "@/lib/user-messages";
import { AlertBanner } from "@/components/AlertBanner";

export function RemindButtons({
  appointmentId,
  patientName,
  patientId,
  patientEmail,
  appointmentDate,
  appointmentTime,
}: {
  appointmentId: string;
  patientName: string;
  patientId: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "sms" | null>(null);

  async function send(channel: "email" | "sms") {
    setMsg(null);
    setError(null);
    setLoading(channel);
    const res = await fetch(`/api/appointments/${appointmentId}/remind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });
    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setError(data.error ?? "We could not send the reminder. Please try again.");
      return;
    }

    setMsg(channel === "email" ? UI.reminderEmailSent : UI.reminderSmsSent);
  }

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">Send patient reminder</h3>
        <p className="mt-1 text-sm text-slate-500">
          Notify {patientName} about appointment {appointmentId} on {appointmentDate}{" "}
          at {appointmentTime}.
        </p>
      </div>

      <div className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <p>
          <span className="text-slate-500">Patient:</span> {patientName}{" "}
          <span className="font-mono text-xs text-cyan-700">({patientId})</span>
        </p>
        <p>
          <span className="text-slate-500">Appointment:</span>{" "}
          <span className="font-mono text-xs text-violet-700">{appointmentId}</span>
        </p>
        <p>
          <span className="text-slate-500">When:</span> {appointmentDate} {appointmentTime}
        </p>
        <p>
          <span className="text-slate-500">Email:</span> {patientEmail}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => send("email")}
          disabled={!!loading}
          className="btn-primary"
        >
          <Mail className="h-4 w-4" />
          {loading === "email" ? "Sending..." : "Send Email Reminder"}
        </button>
        <button
          type="button"
          onClick={() => send("sms")}
          disabled={!!loading}
          className="btn-secondary"
        >
          <MessageSquare className="h-4 w-4" />
          {loading === "sms" ? "Sending..." : "Send SMS Reminder"}
        </button>
      </div>

      {msg && <AlertBanner type="success" message={msg} />}
      {error && <AlertBanner type="error" message={error} />}
    </div>
  );
}
