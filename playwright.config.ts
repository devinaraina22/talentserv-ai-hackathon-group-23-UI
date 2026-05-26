import { defineConfig, devices } from "@playwright/test";
import path from "path";

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "pk_test_ci_placeholder_key_012345678901234567890";
const clerkSecretKey =
  process.env.CLERK_SECRET_KEY ?? "sk_test_ci_placeholder_key_012345678901234567890";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const backendDir =
  process.env.BACKEND_DIR ?? path.join(process.cwd(), "../PatientBookingAI-backend");
const isCI = !!process.env.CI;

const e2eEnv = {
  E2E_TEST_MODE: "true",
  NEXT_PUBLIC_E2E_TEST_MODE: "true",
};

const serverEnv = {
  ...process.env,
  ...e2eEnv,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey,
  CLERK_SECRET_KEY: clerkSecretKey,
  NEXT_PUBLIC_API_URL: apiUrl,
  API_URL: apiUrl,
  FRONTEND_URL: "http://localhost:3000",
};

/** CI pre-builds in GitHub Actions; locally we build inside webServer unless already built. */
const backendCommand = isCI
  ? "npm run start"
  : "npm run db:seed && npm run build && npm run start";

const frontendCommand = isCI ? "npm run start" : "next dev";

export default defineConfig({
  testDir: "./e2e",
  ...(isCI ? {} : { globalSetup: "./e2e/global-setup.ts" }),
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: backendCommand,
      cwd: backendDir,
      url: `${apiUrl}/api/health`,
      reuseExistingServer: !isCI,
      timeout: isCI ? 60_000 : 180_000,
      env: {
        ...serverEnv,
        E2E_TEST_MODE: "true",
      },
    },
    {
      command: frontendCommand,
      url: "http://localhost:3000",
      reuseExistingServer: !isCI,
      timeout: isCI ? 60_000 : 120_000,
      env: serverEnv,
    },
  ],
});
