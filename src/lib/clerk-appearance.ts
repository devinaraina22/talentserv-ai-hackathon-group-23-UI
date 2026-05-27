import { CLINIC } from "./constants";

/** Shared Clerk UI branding — overrides default "MyApplication" from the Clerk dashboard. */
export const clerkAppearance = {
  elements: {
    headerTitle: "Welcome to MediBook",
    headerSubtitle: `Sign in to ${CLINIC.name}`,
    footerActionLink: "text-[var(--cr-accent)] font-semibold hover:opacity-90",
    formButtonPrimary:
      "bg-[var(--cr-accent)] hover:opacity-90 text-white font-semibold shadow-sm",
    card: "shadow-xl border border-[var(--cr-border)] bg-[var(--cr-surface-solid)]",
    rootBox: "mx-auto",
  },
};
