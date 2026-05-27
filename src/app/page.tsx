import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CLINIC, DISCLAIMER } from "@/lib/constants";
import { DEMO_SESSION_COOKIE, isDemoLoginEnabled } from "@/lib/demo-auth";
import { UI } from "@/lib/user-messages";
import { CIRCADIAN_PHASES } from "@/lib/circadian";
import { Activity, ArrowRight, MessageCircle, Shield, Sparkles } from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { AssistWidgets } from "@/components/AssistWidgets";
import { CircadianInfoBanner } from "@/components/CircadianInfoBanner";
import { LegalFooter } from "@/components/LegalFooter";
import { MediBookLogo } from "@/components/MediBookLogo";

export default async function HomePage() {
  if (process.env.E2E_TEST_MODE !== "true") {
    if (isDemoLoginEnabled()) {
      const demoSession = (await cookies()).get(DEMO_SESSION_COOKIE)?.value;
      if (demoSession) redirect("/dashboard");
    } else {
      const { userId } = await auth();
      if (userId) redirect("/dashboard");
    }
  }

  const phases = Object.entries(CIRCADIAN_PHASES).map(([key, p]) => ({ key, ...p }));

  const features = [
    {
      icon: Activity,
      emoji: "📊",
      label: "Live Dashboard",
      desc: "Stats & upcoming visits — colours shift with your day",
      theme: "feature-pink",
    },
    {
      icon: MessageCircle,
      emoji: "💬",
      label: "AI Booking Chat",
      desc: "Book appointments step-by-step through conversation",
      theme: "feature-purple",
    },
    {
      icon: Shield,
      emoji: "🔒",
      label: "Safe & Private",
      desc: "Privacy policy, terms, and role-based access",
      theme: "feature-mint",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden pb-24">
      <AmbientBackground />
      <AssistWidgets authenticated={false} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-20">
        <span className="cute-badge mb-4 inline-flex w-fit items-center gap-2">
          <MediBookLogo size={28} showBackground={false} className="cute-badge-logo" />
          <Sparkles className="h-3.5 w-3.5 text-[var(--cr-accent)]" />
          {CLINIC.name}
        </span>

        <h1 className="landing-title max-w-2xl">
          <span className="landing-title-gradient">{UI.landingTagline}</span>
        </h1>

        <p className="landing-subtitle mt-5 max-w-lg">
          A circadian-aware clinic app — the interface automatically adjusts colour
          temperature through four daily phases to support focus by day and sleep at night.
        </p>

        <div className="mt-6 max-w-lg">
          <CircadianInfoBanner />
        </div>

        <p className="cute-notice mt-5 max-w-lg">{DISCLAIMER}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/login" className="btn-primary px-7 py-3.5 text-[15px]">
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
          {!isDemoLoginEnabled() && (
            <Link href="/sign-up" className="btn-secondary px-7 py-3.5 text-[15px]">
              Create Free Account
            </Link>
          )}
        </div>

        <div className="mt-14">
          <h2 className="section-title mb-3">🌈 Four phases, one day</h2>
          <p className="section-desc mb-4 max-w-lg">
            Light affects melatonin. This theme reduces blue light in the evening and night
            while keeping peak contrast during work hours.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {phases.map((p) => (
              <div key={p.key} className="feature-card">
                <p className="feature-label">
                  {p.emoji} {p.label}
                </p>
                <p className="text-[11px] font-semibold text-[var(--cr-accent)]">{p.hours}</p>
                <p className="feature-desc mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, emoji, label, desc, theme }) => (
            <div key={label} className={`feature-card ${theme}`}>
              <div className="flex items-start gap-3">
                <div className="feature-icon">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="feature-label">
                    <span aria-hidden>{emoji} </span>
                    {label}
                  </p>
                  <p className="feature-desc">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LegalFooter className="landing-footer" />
    </main>
  );
}
