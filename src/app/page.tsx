import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CLINIC, DISCLAIMER } from "@/lib/constants";
import { UI } from "@/lib/user-messages";
import { Activity, ArrowRight, Calendar, Shield } from "lucide-react";

export default async function HomePage() {
  if (process.env.E2E_TEST_MODE !== "true") {
    const { userId } = await auth();
    if (userId) redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-cyan-300">
          <Shield className="h-4 w-4" />
          {CLINIC.name}
        </div>
        <h1 className="font-display max-w-2xl text-5xl leading-tight md:text-6xl">
          {UI.landingTagline}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-slate-400">
          Register patients, complete health intake, book appointments with real-time
          availability, and receive email confirmations — all in one secure workspace
          for your clinic team.
        </p>
        <p className="mt-4 max-w-xl rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {DISCLAIMER}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-8 py-3.5 font-semibold shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 font-semibold transition hover:bg-white/5"
          >
            Create Account
          </Link>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Activity, label: "Live dashboard" },
            { icon: Calendar, label: "Online booking" },
            { icon: Shield, label: "Role-based access" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <Icon className="mb-2 h-6 w-6 text-cyan-400" />
              <p className="font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
