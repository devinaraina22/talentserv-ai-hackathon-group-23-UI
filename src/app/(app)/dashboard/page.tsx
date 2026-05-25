import Link from "next/link";
import { getDashboardStats } from "@/lib/db";
import { getSessionProfile } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Calendar, CheckCircle2, Clock, Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  let profile;
  try {
    profile = await getSessionProfile();
  } catch {
    redirect("/onboarding");
  }
  if (!profile) redirect("/onboarding");

  const stats = await getDashboardStats(profile.role, profile.email, profile.department);

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "from-cyan-500 to-teal-500",
    },
    {
      title: "Today",
      value: stats.todaysAppointments,
      icon: Clock,
      color: "from-violet-500 to-purple-500",
    },
    {
      title: "Booked",
      value: stats.byStatus.Booked,
      icon: Users,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Completed",
      value: stats.byStatus.Completed,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Good day, ${profile.name.split(" ")[0]}`}
        subtitle={`${profile.role} overview — health details stay in patient & appointment views`}
        action={
          profile.role !== "Patient" ? (
            <Link href="/appointments/new" className="btn-primary">
              + Book Appointment
            </Link>
          ) : null
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="card stat-glow overflow-hidden transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.title}</p>
                  <p className="mt-2 text-4xl font-bold text-slate-900">{s.value}</p>
                </div>
                <div
                  className={`rounded-xl bg-gradient-to-br ${s.color} p-3 text-white shadow-lg`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold text-slate-900">By Status</h2>
          <div className="space-y-3">
            {(["Booked", "Completed", "Cancelled"] as const).map((status) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-lg font-bold">{stats.byStatus[status]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold text-slate-900">By Department</h2>
          <div className="space-y-2">
            {Object.entries(stats.byDepartment).map(([dept, count]) => (
              <div key={dept} className="flex justify-between text-sm">
                <span>{dept}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 font-semibold text-slate-900">Upcoming</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Patient</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">When</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcoming.map((a) => (
                <tr key={a.appointment_id} className="border-t border-slate-100">
                  <td className="py-3">
                    <Link
                      href={`/appointments/${a.appointment_id}`}
                      className="font-medium text-cyan-600 hover:underline"
                    >
                      {a.patient_name}
                    </Link>
                  </td>
                  <td className="py-3">{a.doctor_or_department}</td>
                  <td className="py-3">
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
