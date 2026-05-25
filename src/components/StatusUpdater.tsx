"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@/lib/types";
import { APPOINTMENT_STATUSES } from "@/lib/constants";

export function StatusUpdater({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdate() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error ?? "Update failed");
      return;
    }
    setMessage("Status updated");
    router.refresh();
  }

  return (
    <div className="card flex flex-wrap items-end gap-3">
      <div>
        <label className="label">Update Status</label>
        <select
          className="input-field min-w-[160px]"
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
        >
          {APPOINTMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleUpdate}
        className="btn-primary"
        disabled={loading || status === currentStatus}
      >
        {loading ? "Updating..." : "Update"}
      </button>
      {message && <p className="text-sm text-green-700">{message}</p>}
    </div>
  );
}
