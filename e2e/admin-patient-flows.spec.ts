import { test, expect, sampleBookingDate, fillPatientForm } from "./fixtures";

test.describe("Admin UI flows (positive)", () => {
  test("dashboard loads with stats", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");
    await adminPage.waitForURL("**/dashboard");
    await expect(adminPage.getByRole("heading", { name: /hello,/i })).toBeVisible();
    await expect(adminPage.getByText("Total Appointments")).toBeVisible();
    await expect(adminPage.getByTestId("user-role-badge")).toHaveText("Admin");
  });

  test("patients list shows seeded records", async ({ adminPage }) => {
    await adminPage.goto("/patients");
    await expect(adminPage.getByRole("heading", { name: "Patients" })).toBeVisible();
    await expect(adminPage.getByText("Riya Sharma")).toBeVisible();
    await expect(adminPage.getByText("PAT-001")).toBeVisible();
  });

  test("register patient with validation error on bad phone (negative UI)", async ({
    adminPage,
  }) => {
    await adminPage.goto("/patients/new");
    await fillPatientForm(adminPage, {
      patientId: "PAT-020",
      name: "Invalid Phone Test",
      age: "25",
      phone: "12345",
      email: "invalid.phone@example.com",
      city: "Pune",
    });
    await adminPage.getByRole("button", { name: /register patient/i }).click();
    await expect(adminPage.getByText(/check the patient details|failed/i)).toBeVisible();
  });

  test("register patient successfully (positive UI)", async ({ adminPage }) => {
    await adminPage.goto("/patients/new");
    await fillPatientForm(adminPage, {
      patientId: "PAT-021",
      name: "Playwright Patient",
      age: "34",
      phone: "9000000021",
      email: "playwright@example.com",
      city: "Mumbai",
    });
    await adminPage.getByRole("button", { name: /register patient/i }).click();
    await adminPage.waitForURL(/\/patients\/PAT-021/);
    await expect(adminPage.getByRole("heading", { name: "Playwright Patient" })).toBeVisible();
  });

  test("save health intake on patient detail (positive UI)", async ({ adminPage }) => {
    await adminPage.goto("/patients/PAT-003");
    const inputs = adminPage.locator("form input.input-field");
    await inputs.nth(0).fill("Runny nose");
    await inputs.nth(1).fill("None");
    await inputs.nth(2).fill("None");
    await inputs.nth(3).fill("None");
    await inputs.nth(4).fill("Pediatric visit");
    await inputs.nth(5).fill("Parent 9988776655");
    await adminPage.getByRole("checkbox").check();
    await adminPage.getByRole("button", { name: /save health intake/i }).click();
    await expect(adminPage.getByText("Saved Health Intake")).toBeVisible();
  });

  test("book appointment on available slot (positive UI)", async ({ adminPage }) => {
    await adminPage.goto("/appointments/new");
    await adminPage.locator("select.input-field").nth(0).selectOption("PAT-001");
    await adminPage.locator("select.input-field").nth(1).selectOption("General Physician");
    await adminPage.locator('input[type="date"]').fill(sampleBookingDate());
    const timeSelect = adminPage.locator("select.input-field").nth(2);
    await expect(timeSelect).toBeVisible({ timeout: 15_000 });
    await expect(timeSelect.locator("option")).not.toHaveCount(0);
    const firstSlot = await timeSelect.locator("option").nth(1).getAttribute("value");
    if (firstSlot) await timeSelect.selectOption(firstSlot);
    await adminPage.getByRole("button", { name: /book appointment/i }).click();
    await adminPage.waitForURL(/\/appointments\/APT-\d+\/receipt/);
    await expect(adminPage.getByText("Appointment Confirmation Receipt")).toBeVisible();
  });

  test("audit log accessible for admin", async ({ adminPage }) => {
    await adminPage.goto("/audit");
    await expect(adminPage.getByRole("heading", { name: "Audit Log" })).toBeVisible();
    await expect(adminPage.getByRole("cell", { name: "ASSIGN_ROLE" })).toBeVisible();
  });
});

test.describe("Patient UI flows", () => {
  test("patient sees limited nav (positive)", async ({ patientPage }) => {
    await patientPage.goto("/dashboard");
    await patientPage.waitForURL("**/dashboard");
    await expect(patientPage.getByTestId("user-role-badge")).toHaveText("Patient");
    await expect(patientPage.getByTestId("nav-patients")).toHaveCount(0);
    await expect(patientPage.getByTestId("nav-audit-log")).toHaveCount(0);
    await expect(patientPage.getByTestId("nav-appointments")).toBeVisible();
  });

  test("patient redirected from patients list (negative access)", async ({ patientPage }) => {
    await patientPage.goto("/patients");
    await patientPage.waitForURL(/\/appointments/);
    expect(patientPage.url()).toContain("/appointments");
  });

  test("patient can view own appointments (positive)", async ({ patientPage }) => {
    await patientPage.goto("/appointments");
    await expect(patientPage.getByText("APT-001")).toBeVisible();
  });
});
