import { test, expect } from "@playwright/test";

test.describe("Public landing", () => {
  test("shows MediBook branding and sign-in CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /trusted clinic appointment/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });
});

test.describe("API health", () => {
  test("patients check endpoint requires auth", async ({ request }) => {
    const res = await request.get("/api/patients/check?email=test@example.com&phone=1234567890");
    expect(res.status()).toBe(401);
  });
});
