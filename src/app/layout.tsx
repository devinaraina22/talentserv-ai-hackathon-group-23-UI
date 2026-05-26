import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { DISCLAIMER } from "@/lib/constants";
import { AppAuthProvider } from "@/hooks/useAppAuth";

export const metadata: Metadata = {
  title: "Clinic Patient Booking",
  description: DISCLAIMER,
};

export const dynamic = "force-dynamic";

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "pk_test_ci_placeholder_key_012345678901234567890";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AppAuthProvider>{children}</AppAuthProvider>
      </body>
    </html>
  );

  if (process.env.E2E_TEST_MODE === "true") {
    return <ClerkProvider publishableKey={clerkPublishableKey}>{content}</ClerkProvider>;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
