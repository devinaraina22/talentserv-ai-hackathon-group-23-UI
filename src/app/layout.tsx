import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { DISCLAIMER } from "@/lib/constants";
import { clerkAppearance, clerkLocalization } from "@/lib/clerk-appearance";
import { AppAuthProvider } from "@/hooks/useAppAuth";
import { isE2eMode } from "@/lib/e2e";
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

  // CI e2e uses cookie-based auth — Clerk rejects placeholder keys if Provider mounts.
  if (isE2eMode()) {
    return content;
  }

  return (
    <ClerkProvider appearance={clerkAppearance} localization={clerkLocalization}>
      {content}
    </ClerkProvider>
  );
}
