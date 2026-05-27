import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { DISCLAIMER } from "@/lib/constants";
import { clerkAppearance, clerkLocalization } from "@/lib/clerk-appearance";
import { AppAuthProvider } from "@/hooks/useAppAuth";
import { isE2eMode } from "@/lib/e2e";
import { isDemoLoginEnabled } from "@/lib/demo-auth";
import { CircadianThemeProvider } from "@/components/CircadianThemeProvider";

export const metadata: Metadata = {
  title: "MediBook Clinic",
  description: DISCLAIMER,
  icons: {
    icon: "/logo/medibook-logo.svg",
    apple: "/logo/medibook-logo.svg",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" data-circadian="morning" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <CircadianThemeProvider>
          <AppAuthProvider>{children}</AppAuthProvider>
        </CircadianThemeProvider>
      </body>
    </html>
  );

  // CI e2e and demo login use cookie-based auth — Clerk rejects keys if Provider mounts unnecessarily.
  if (isE2eMode() || isDemoLoginEnabled()) {
    return content;
  }

  return (
    <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
      {content}
    </ClerkProvider>
  );
}
