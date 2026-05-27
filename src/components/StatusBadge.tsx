import type { AppointmentStatus } from "@/lib/types";

const styles: Record<AppointmentStatus, string> = {
  Booked: "badge-booked",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`status-badge ${styles[status]}`} title={`Appointment is ${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
