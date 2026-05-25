"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DEPARTMENTS, TIME_SLOTS } from "@/lib/constants";
import { DAY_NAMES } from "@/lib/constants";
import type { DoctorAvailability } from "@/lib/types";
import { useRole } from "@/components/RoleProvider";
import { Plus, Trash2 } from "lucide-react";

export default function AvailabilityPage() {
  const { profile } = useRole();
  const [list, setList] = useState<DoctorAvailability[]>([]);
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [day, setDay] = useState(1);
  const [slots, setSlots] = useState<string[]>([TIME_SLOTS[0], TIME_SLOTS[2]]);
  const canManage = profile?.role === "Admin" || profile?.role === "Doctor";

  const load = () =>
    fetch("/api/availability")
      .then((r) => r.json())
      .then(setList);

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_or_department: dept,
        day_of_week: day,
        time_slots: slots,
      }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/availability/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Doctor Availability"
        subtitle="Configure available days and time slots per department"
      />

      {canManage && (
        <form onSubmit={handleAdd} className="card mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Department</label>
            <select className="input-field" value={dept} onChange={(e) => setDept(e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Day</label>
            <select
              className="input-field"
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
            >
              {DAY_NAMES.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Time slots (toggle)</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setSlots((s) =>
                      s.includes(t) ? s.filter((x) => x !== t) : [...s, t]
                    )
                  }
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${
                    slots.includes(t)
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary sm:col-span-2 lg:col-span-4">
            <Plus className="h-4 w-4" /> Add availability block
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className="card flex justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">{a.doctor_or_department}</p>
              <p className="text-sm text-cyan-600">{DAY_NAMES[a.day_of_week]}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {a.time_slots.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
