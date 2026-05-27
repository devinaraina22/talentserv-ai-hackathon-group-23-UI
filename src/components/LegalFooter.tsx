import Link from "next/link";
import { CLINIC, DISCLAIMER } from "@/lib/constants";

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`legal-footer ${className}`}>
      <p className="legal-disclaimer">{DISCLAIMER}</p>
      <nav className="legal-links" aria-label="Legal">
        <Link href="/privacy">Privacy Policy</Link>
        <span aria-hidden>·</span>
        <Link href="/terms">Terms of Service</Link>
        <span aria-hidden>·</span>
        <a href={`mailto:${CLINIC.email}`}>Contact</a>
      </nav>
      <p className="legal-copy">
        © {new Date().getFullYear()} {CLINIC.name}. All rights reserved.
      </p>
    </footer>
  );
}
