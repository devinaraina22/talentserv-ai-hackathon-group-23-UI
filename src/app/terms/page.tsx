import { CLINIC, DISCLAIMER } from "@/lib/constants";
import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LegalFooter } from "@/components/LegalFooter";

export const metadata = {
  title: "Terms of Service | MediBook Clinic",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen">
      <AmbientBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm font-medium text-[var(--pro-accent)] hover:underline">
          ← Back to home
        </Link>
        <article className="legal-doc mt-8">
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: May 2026</p>

          <p>
            By accessing {CLINIC.name}, you agree to these Terms. If you do not agree,
            please do not use the service.
          </p>

          <h2>Service description</h2>
          <p>
            MediBook provides appointment scheduling and clinic workflow tools. It is
            not a substitute for emergency care, medical advice, diagnosis, or treatment.
          </p>

          <h2>Accounts &amp; roles</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login.
            Clinic administrators assign staff roles; patients may only access their own
            records as permitted by the clinic.
          </p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Provide accurate registration and appointment information</li>
            <li>Do not attempt unauthorized access to other users&apos; data</li>
            <li>Do not misuse automated tools to disrupt the service</li>
          </ul>

          <h2>AI assistant &amp; call support</h2>
          <p>
            Chat and voice assistants help guide booking flows. Responses are automated
            and may be incomplete. Always verify appointment details in your confirmation
            email and receipt. Voice call support in this demo is simulated.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            The platform is provided &quot;as is&quot; for demonstration purposes. {CLINIC.name}{" "}
            is not liable for indirect damages arising from use of the service.
          </p>

          <h2>Contact</h2>
          <p>
            Questions: <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a> ·{" "}
            {CLINIC.phoneDisplay}
          </p>

          <p className="legal-notice">{DISCLAIMER}</p>
        </article>
        <LegalFooter className="mt-12 !static !transform-none !max-w-none" />
      </div>
    </main>
  );
}
