import { test, expect } from "./fixtures";

test.describe("Public landing", () => {
  test("shows MediBook branding and sign-in CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /trusted clinic appointment/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });
});
