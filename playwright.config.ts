import { defineConfig, devices } from "@playwright/test";

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "pk_test_ci_placeholder_key_012345678901234567890";
const clerkSecretKey =
  process.env.CLERK_SECRET_KEY ?? "sk_test_ci_placeholder_key_012345678901234567890";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const serverEnv = {
  ...process.env,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey,
  CLERK_SECRET_KEY: clerkSecretKey,
  NEXT_PUBLIC_API_URL: apiUrl,
  API_URL: apiUrl,
  ...(process.env.CI ? { E2E_TEST_MODE: "true" } : {}),
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI ? "npm run start" : "next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 60000 : 120000,
    env: serverEnv,
  },
});
