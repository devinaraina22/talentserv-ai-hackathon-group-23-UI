import { test as base, type BrowserContext, type Page } from "@playwright/test";

export const E2E_ROLE_COOKIE = "medibook_e2e_role";
export const E2E_BEARER = "e2e-test-token";
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type E2eRole = "Admin" | "Patient";

export async function setE2eRole(context: BrowserContext, role: E2eRole) {
  await context.addCookies([
    {
      name: E2E_ROLE_COOKIE,
      value: role,
      domain: "localhost",
      path: "/",
    },
  ]);
}

export function apiHeaders(role: E2eRole): Record<string, string> {
  return {
    Authorization: `Bearer ${E2E_BEARER}`,
    "X-E2E-Role": role,
    "Content-Type": "application/json",
  };
}

type RoleFixtures = {
  adminPage: Page;
  patientPage: Page;
};

export const test = base.extend<RoleFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await setE2eRole(context, "Admin");
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  patientPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await setE2eRole(context, "Patient");
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";

/** Next Monday on or after 2026-06-01 (has General Physician availability in seed). */
export function sampleBookingDate(): string {
  return "2026-06-01"; // Monday
}
