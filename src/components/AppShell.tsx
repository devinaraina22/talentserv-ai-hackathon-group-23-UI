"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";
import { canAccessNav, ROLE_COLORS } from "@/lib/auth";
import { useRole } from "./RoleProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/availability", label: "Availability", icon: Stethoscope },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/audit", label: "Audit Log", icon: ClipboardList },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { profile } = useRole();

  const role = profile?.role ?? "Receptionist";
  const visibleNav = navItems.filter((item) => canAccessNav(role, item.href));

  return (
    <div className="flex min-h-screen">
      <aside className="glass-nav no-print flex w-64 shrink-0 flex-col text-white">
        <div className="border-b border-white/10 p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-500 shadow-lg shadow-teal-500/30">
              <span className="text-sm font-extrabold text-white">MB</span>
            </div>
            <div>
              <p className="font-display text-lg leading-tight text-white">MediBook</p>
              <p className="text-xs text-teal-200">Clinic</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white ring-1 ring-white/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="truncate text-sm font-medium">{user?.fullName ?? "User"}</p>
            <p className="truncate text-xs text-slate-400">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <span
              className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}
            >
              {role}
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
        <footer className="no-print border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-500">
          {DISCLAIMER}
        </footer>
      </div>
    </div>
  );
}
