"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { APPOINTMENT_STATUSES, DEPARTMENTS } from "@/lib/constants";

export function AppointmentSearch() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/appointments?${next.toString()}`);
  }

  return (
    <div className="card flex flex-wrap gap-3">
      <input
        className="input-field max-w-xs"
        placeholder="Search patient, ID, department..."
        defaultValue={params.get("q") ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            update("q", (e.target as HTMLInputElement).value);
          }
        }}
      />
      <select
        className="input-field max-w-[140px]"
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
      >
        <option value="">All statuses</option>
        {APPOINTMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className="input-field max-w-[180px]"
        defaultValue={params.get("department") ?? ""}
        onChange={(e) => update("department", e.target.value)}
      >
        <option value="">All departments</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <input
        type="date"
        className="input-field max-w-[160px]"
        defaultValue={params.get("date") ?? ""}
        onChange={(e) => update("date", e.target.value)}
      />
    </div>
  );
}
