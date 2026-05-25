import type { AppointmentStatus } from "@/lib/types";

const styles: Record<AppointmentStatus, string> = {
  Booked: "bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200",
  Completed: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  Cancelled: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
