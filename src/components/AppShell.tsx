"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import { canAccessNav, ROLE_COLORS } from "@/lib/auth";
import { isE2eClient } from "@/lib/e2e";
import { useRole } from "./RoleProvider";
import { AmbientBackground } from "./AmbientBackground";
import { AssistWidgets } from "./AssistWidgets";
import { BubbleNav, type BubbleNavItem } from "./BubbleNav";
import { CircadianBadge } from "./CircadianBadge";
import { MediBookLogo } from "./MediBookLogo";
import { LegalFooter } from "./LegalFooter";
import type { UserProfile } from "@/lib/types";

const navItems: Omit<BubbleNavItem, "testId">[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Stats & overview",
    icon: LayoutDashboard,
  },
  {
    href: "/patients",
    label: "Patients",
    description: "Register & profiles",
    icon: Users,
  },
  {
    href: "/appointments",
    label: "Appointments",
    description: "Book & manage visits",
    icon: Calendar,
  },
  {
    href: "/availability",
    label: "Availability",
    description: "Doctor time slots",
    icon: Stethoscope,
  },
  {
    href: "/reminders",
    label: "Reminders",
    description: "Email & SMS alerts",
    icon: Bell,
  },
  {
    href: "/audit",
    label: "Audit",
    description: "Activity history",
    icon: ClipboardList,
  },
  {
    href: "/staff",
    label: "Staff Access",
    description: "Assign roles by email",
    icon: Shield,
  },
];

function TopUserChip({ profile, role }: { profile: UserProfile | null; role: string }) {
  if (isE2eClient()) {
    return (
      <div className="top-user-chip">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold top-user-name">{profile?.name ?? "E2E User"}</p>
          <span
            className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_COLORS[role as keyof typeof ROLE_COLORS]}`}
            data-testid="user-role-badge"
          >
            {role}
          </span>
        </div>
      </div>
    );
  }

  return <ClerkTopUserChip role={role} />;
}

function ClerkTopUserChip({ role }: { role: string }) {
  const { user } = useUser();
  return (
    <div className="top-user-chip flex items-center gap-3">
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-semibold top-user-name">{user?.fullName ?? "User"}</p>
        <span
          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${ROLE_COLORS[role as keyof typeof ROLE_COLORS]}`}
          data-testid="user-role-badge"
        >
          {role}
        </span>
      </div>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useRole();
  const role = profile?.role ?? "Receptionist";
  const visibleNav: BubbleNavItem[] = navItems
    .filter((item) => canAccessNav(role, item.href))
    .map((item) => ({
      ...item,
      testId: `nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`,
    }));

  return (
    <div className="app-shell relative min-h-screen">
      <AmbientBackground />

      <header className="app-topbar no-print">
        <Link href="/dashboard" className="brand-bubble">
          <span className="brand-logo-wrap">
            <MediBookLogo size={44} />
          </span>
          <span className="brand-bubble-text">
            <span className="brand-name font-display">MediBook</span>
            <span className="brand-tagline">Circadian-aware clinic care</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <CircadianBadge />
          <TopUserChip profile={profile} role={role} />
        </div>
      </header>

      <main className="app-main animate-fade-in">
        <div className="app-content-glass">{children}</div>
      </main>

      <LegalFooter className="app-footer no-print" />

      <BubbleNav items={visibleNav} />
      <AssistWidgets authenticated />
    </div>
  );
}
