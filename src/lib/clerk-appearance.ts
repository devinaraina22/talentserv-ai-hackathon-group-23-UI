import { CLINIC } from "./constants";

/** Shared Clerk UI branding — overrides default "MyApplication" from the Clerk dashboard. */
export const clerkAppearance = {
  layout: {
    applicationName: "MediBook",
    unsafe_disableDevelopmentModeWarnings: true,
  },
  elements: {
    headerTitle: "Welcome to MediBook",
    headerSubtitle: `Sign in to ${CLINIC.name}`,
    footerActionLink: "text-[var(--cr-accent)] font-semibold hover:opacity-90",
    formButtonPrimary:
      "bg-[var(--cr-accent)] hover:opacity-90 text-white font-semibold shadow-sm",
    card: "shadow-xl border border-[var(--cr-border)] bg-[var(--cr-surface-solid)]",
    rootBox: "mx-auto",
    // Dev-instance badge shown when using Clerk test keys
    developmentModeNotice: "hidden",
    devBar: "hidden",
  },
};

export const clerkLocalization = {
  applicationName: "MediBook",
  signIn: {
    start: {
      title: "Welcome to MediBook",
      subtitle: `Sign in to ${CLINIC.name}`,
    },
  },
  signUp: {
    start: {
      title: "Join MediBook",
      subtitle: `Create your ${CLINIC.name} account`,
    },
  },
};
