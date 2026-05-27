import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { DISCLAIMER } from "@/lib/constants";
import { AppAuthProvider } from "@/hooks/useAppAuth";
import { isE2eMode } from "@/lib/e2e";

export const metadata: Metadata = {
  title: "Clinic Patient Booking",
  description: DISCLAIMER,
};

export const dynamic = "force-dynamic";

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

  // CI e2e uses cookie-based auth — Clerk rejects placeholder keys if Provider mounts.
  if (isE2eMode()) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
