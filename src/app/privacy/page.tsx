import { CLINIC, DISCLAIMER } from "@/lib/constants";
import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LegalFooter } from "@/components/LegalFooter";

export const metadata = {
  title: "Privacy Policy | MediBook Clinic",
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen">
      <AmbientBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm font-medium text-[var(--pro-accent)] hover:underline">
          ← Back to home
        </Link>
        <article className="legal-doc mt-8">
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: May 2026</p>

          <p>
            {CLINIC.name} (&quot;we,&quot; &quot;us&quot;) respects your privacy. This policy
            describes how we collect, use, and protect information when you use our
            appointment booking platform.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>Account information from our authentication provider (name, email)</li>
            <li>Patient registration details you provide (contact, demographics)</li>
            <li>Health intake information submitted for care coordination</li>
            <li>Appointment history and communication preferences</li>
            <li>Technical logs (access times, device type) for security and audit</li>
          </ul>

          <h2>How we use information</h2>
          <ul>
            <li>Scheduling and managing appointments</li>
            <li>Sending confirmations and reminders via email</li>
            <li>Role-based access for clinic staff</li>
            <li>Audit logging for compliance and quality</li>
          </ul>

          <h2>Data sharing</h2>
          <p>
            We do not sell personal information. Data is shared only with authorized
            clinic staff, service providers required to operate the platform (e.g.,
            authentication, email delivery), and when required by law.
          </p>

          <h2>Security</h2>
          <p>
            We use industry-standard authentication, encrypted connections (HTTPS),
            and access controls. No system is 100% secure; please use strong passwords
            and report suspicious activity.
          </p>

          <h2>Your choices</h2>
          <p>
            You may request access, correction, or deletion of your data by contacting{" "}
            <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>.
          </p>

          <h2>Demo notice</h2>
          <p className="legal-notice">{DISCLAIMER}</p>
        </article>
        <LegalFooter className="mt-12 !static !transform-none !max-w-none" />
      </div>
    </main>
  );
}
