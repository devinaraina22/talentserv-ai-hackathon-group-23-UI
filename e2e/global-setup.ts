import { execSync } from "child_process";
import path from "path";

export default function globalSetup() {
  const backendDir =
    process.env.BACKEND_DIR ?? path.join(process.cwd(), "../PatientBookingAI-backend");
  execSync("npm run db:seed", {
    cwd: backendDir,
    stdio: "inherit",
    env: { ...process.env, E2E_TEST_MODE: "true" },
  });
}
