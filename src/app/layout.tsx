import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { DISCLAIMER } from "@/lib/constants";

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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );

  if (process.env.E2E_TEST_MODE === "true") {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
