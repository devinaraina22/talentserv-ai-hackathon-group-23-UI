import { test, expect } from "@playwright/test";
import { apiHeaders, API_BASE, ensureAppReady, setE2eRole } from "./fixtures";

const PERF = {
  pageLoadMs: 8000,
  apiGetMs: 2000,
};

test.describe("Performance thresholds", () => {
  test("landing page loads within threshold", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /trusted clinic appointment/i })).toBeVisible();
    expect(Date.now() - start).toBeLessThan(PERF.pageLoadMs);
  });

  test("admin dashboard loads within threshold", async ({ page, context }) => {
    await setE2eRole(context, "Admin");
    const start = Date.now();
    await ensureAppReady(page, "Admin");
    await expect(page.getByText("Total Appointments")).toBeVisible();
    expect(Date.now() - start).toBeLessThan(PERF.pageLoadMs);
  });

  test("GET /api/dashboard responds within threshold", async ({ request }) => {
    const start = Date.now();
    const res = await request.get(`${API_BASE}/api/dashboard`, {
      headers: apiHeaders("Admin"),
    });
    expect(res.status()).toBe(200);
    expect(Date.now() - start).toBeLessThan(PERF.apiGetMs);
  });

  test("GET /api/patients responds within threshold", async ({ request }) => {
    const start = Date.now();
    const res = await request.get(`${API_BASE}/api/patients`, {
      headers: apiHeaders("Admin"),
    });
    expect(res.status()).toBe(200);
    expect(Date.now() - start).toBeLessThan(PERF.apiGetMs);
  });

  test("GET /api/appointments responds within threshold", async ({ request }) => {
    const start = Date.now();
    const res = await request.get(`${API_BASE}/api/appointments`, {
      headers: apiHeaders("Admin"),
    });
    expect(res.status()).toBe(200);
    expect(Date.now() - start).toBeLessThan(PERF.apiGetMs);
  });
});
