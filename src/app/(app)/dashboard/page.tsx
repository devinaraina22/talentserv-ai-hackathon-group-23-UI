import Link from "next/link";
import { serverApiJson } from "@/lib/api-server";
import { getSessionProfile } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { CircadianInfoBanner } from "@/components/CircadianInfoBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { DashboardStats } from "@/lib/types";
import { Calendar, CheckCircle2, Clock, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/onboarding");

  const stats = await serverApiJson<DashboardStats>("/api/dashboard");

  const statCards = [
    {
      title: "Total Appointments",
      description: "All visits ever scheduled at your clinic",
      value: stats.totalAppointments,
      icon: Calendar,
    },
    {
      title: "Today",
      description: "Patients expected in the clinic today",
      value: stats.todaysAppointments,
      icon: Clock,
    },
    {
      title: "Booked",
      description: "Upcoming visits not yet completed",
      value: stats.byStatus.Booked,
      icon: Users,
    },
    {
      title: "Completed",
      description: "Successfully finished appointments",
      value: stats.byStatus.Completed,
      icon: CheckCircle2,
    },
  ];

  return (
    <div>
      <PageHeader
        emoji="👋"
        badge="Dashboard"
        title={`Hello, ${profile.name.split(" ")[0]}!`}
        subtitle={`You're signed in as ${profile.role}. Colors adapt to the time of day to support your circadian rhythm — hover the phase badge in the header for details.`}
        action={
          profile.role !== "Patient" ? (
            <Link href="/appointments/new" className="btn-primary">
              ✨ Book Appointment
            </Link>
          ) : null
        }
      />

      <CircadianInfoBanner />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s, i) => (
          <StatCard
            key={s.title}
            title={s.title}
            description={s.description}
            value={s.value}
            icon={s.icon}
            tintIndex={i}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card card-cute">
          <SectionHeader
            emoji="📊"
            title="By Status"
            description="See how many appointments are booked, done, or cancelled"
          />
          <div className="space-y-3">
            {(["Booked", "Completed", "Cancelled"] as const).map((status) => (
              <div key={status} className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2">
                <StatusBadge status={status} />
                <span className="text-lg font-bold text-[var(--cr-text)]">{stats.byStatus[status]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-cute">
          <SectionHeader
            emoji="🏥"
            title="By Department"
            description="Which specialties are busiest right now"
          />
          <div className="space-y-2">
            {Object.entries(stats.byDepartment).map(([dept, count]) => (
              <div
                key={dept}
                className="flex justify-between rounded-xl bg-white/60 px-3 py-2 text-sm"
              >
                <span className="text-[var(--cr-text-soft)]">{dept}</span>
                <span className="font-bold text-[var(--cr-text)]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-cute mt-6">
        <SectionHeader
          emoji="📅"
          title="Upcoming Appointments"
          description="The next patients on the schedule — click a name for full details"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--cr-text-muted)]">
                <th className="pb-2 font-medium">Patient</th>
                <th className="pb-2 font-medium">Department</th>
                <th className="pb-2 font-medium">When</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcoming.map((a) => (
                <tr key={a.appointment_id} className="border-t border-[var(--cr-border)]">
                  <td className="py-3">
                    <Link
                      href={`/appointments/${a.appointment_id}`}
                      className="font-medium text-[var(--cr-accent)] hover:underline"
                    >
                      {a.patient_name}
                    </Link>
                  </td>
                  <td className="py-3 text-[var(--cr-text-soft)]">{a.doctor_or_department}</td>
                  <td className="py-3 text-[var(--cr-text-soft)]">
                    {a.appointment_date} {a.appointment_time}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
