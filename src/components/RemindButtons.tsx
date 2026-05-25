"use client";

import { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";

export function RemindButtons({
  appointmentId,
  patientName,
  patientId,
  patientEmail,
  patientPhone,
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
      setError(data.error ?? "Failed to send reminder");
      return;
    }
    const mode = data.simulated
      ? "(logged to console — configure SMTP in .env.local)"
      : "(email delivered)";
    setMsg(
      channel === "email"
        ? `Email sent to ${patientName} <${data.recipient}> ${mode}`
        : `SMS simulation logged for ${patientPhone}`
    );
  }

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">Send patient reminder</h3>
        <p className="mt-1 text-sm text-slate-500">
          Email includes <strong>Patient ID {patientId}</strong> and{" "}
          <strong>Appointment ID {appointmentId}</strong> (separate IDs).
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
          {loading === "sms" ? "Sending..." : "Send SMS (simulated)"}
        </button>
      </div>

      {msg && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
