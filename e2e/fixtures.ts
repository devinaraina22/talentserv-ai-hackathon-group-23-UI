import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

const isCI = !!process.env.CI;
const e2eBackendPort = isCI ? 3001 : 3002;

export const E2E_ROLE_COOKIE = "medibook_e2e_role";
export const E2E_BEARER = "e2e-test-token";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${e2eBackendPort}`;

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

/** Provision role profile via API and land on dashboard when layout redirects to onboarding. */
export async function ensureAppReady(page: Page, role: E2eRole) {
  await page.goto("/dashboard");
  if (page.url().includes("/onboarding")) {
    await page.waitForURL("**/dashboard", { timeout: 20_000 });
  }
  await page.getByTestId("user-role-badge").waitFor({ state: "visible" });
  await expect(page.getByTestId("user-role-badge")).toHaveText(role);
}

export async function fillPatientForm(
  page: Page,
  data: {
    patientId: string;
    name: string;
    age: string;
    phone: string;
    email: string;
    city: string;
    countryCode?: string;
  }
) {
  const inputs = page.locator("form input.input-field");
  await inputs.nth(0).fill(data.patientId);
  await inputs.nth(1).fill(data.name);
  await inputs.nth(2).fill(data.age);
  await inputs.nth(3).fill(data.phone);
  await inputs.nth(4).fill(data.email);

  const countrySelect = page.getByTestId("country-select");
  await countrySelect.waitFor({ state: "visible" });
  await expect(countrySelect.locator("option")).not.toHaveCount(1, { timeout: 15_000 });
  await countrySelect.selectOption(data.countryCode ?? "IN");

  const cityInput = page.getByTestId("city-input");
  await expect(cityInput).toBeEnabled();
  await cityInput.fill(data.city);

  await cityInput.fill(data.city);
  await page.waitForTimeout(350);

  const suggestion = page.getByTestId("city-suggestion").filter({ hasText: data.city }).first();
  if (await suggestion.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await suggestion.click();
  }

  // Blur city field so the suggestions panel does not intercept submit clicks.
  await inputs.nth(1).click();
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
    await ensureAppReady(page, "Admin");
    await use(page);
    await context.close();
  },
  patientPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    await setE2eRole(context, "Patient");
    const page = await context.newPage();
    await ensureAppReady(page, "Patient");
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";

/** Next Monday on or after 2026-06-01 (has General Physician availability in seed). */
export function sampleBookingDate(): string {
  return "2026-06-01"; // Monday
}
