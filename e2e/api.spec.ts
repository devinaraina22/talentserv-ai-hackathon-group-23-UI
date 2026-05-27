import { test, expect } from "@playwright/test";
import { apiHeaders, API_BASE } from "./fixtures";

test.describe("API — health", () => {
  test("GET /api/health returns ok (positive)", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("POST /api/health without auth returns 401 (negative)", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/health`, {
      data: { patient_id: "PAT-001", symptoms: "x" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/health without consent returns 400 (negative)", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/health`, {
      headers: apiHeaders("Admin"),
      data: {
        patient_id: "PAT-001",
        symptoms: "Fever",
        existing_conditions: "None",
        allergies: "None",
        current_medications: "None",
        visit_reason: "Checkup",
        emergency_contact: "Contact 9999999999",
        consent_acknowledged: false,
      },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/health saves intake (positive)", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/health`, {
      headers: apiHeaders("Admin"),
      data: {
        patient_id: "PAT-003",
        symptoms: "Mild fever",
        existing_conditions: "None",
        allergies: "None",
        current_medications: "None",
        visit_reason: "Pediatric check",
        emergency_contact: "Parent 9988776655",
        consent_acknowledged: true,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.patient_id).toBe("PAT-003");
  });
});

test.describe("API — patients", () => {
  test("GET /api/patients as Admin returns list (positive)", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/patients`, {
      headers: apiHeaders("Admin"),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test("GET /api/patients as Patient returns own record only (positive)", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/patients`, {
      headers: apiHeaders("Patient"),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].email).toBe("riya@example.com");
  });

  test("POST /api/patients with invalid phone returns 400 (negative)", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/patients`, {
      headers: apiHeaders("Admin"),
      data: {
        patient_id: "PAT-099",
        full_name: "Bad Phone",
        age: 30,
        gender: "Male",
        phone_number: "123",
        email: "bad@example.com",
        country: "India",
        country_code: "IN",
        city: "Pune",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/patients as Patient returns 403 (negative)", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/patients`, {
      headers: apiHeaders("Patient"),
      data: {
        patient_id: "PAT-099",
        full_name: "Blocked",
        age: 30,
        gender: "Male",
        phone_number: "9876543211",
        email: "blocked@example.com",
        country: "India",
        country_code: "IN",
        city: "Pune",
      },
    });
    expect(res.status()).toBe(403);
  });

  test("POST /api/patients creates record (positive)", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/patients`, {
      headers: apiHeaders("Admin"),
      data: {
        patient_id: "PAT-010",
        full_name: "E2E Test Patient",
        age: 28,
        gender: "Female",
        phone_number: "9000000010",
        email: "e2e.patient@example.com",
        country: "India",
        country_code: "IN",
        city: "Pune",
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.patient_id).toBe("PAT-010");
  });
});

test.describe("API — appointments", () => {
  test("GET /api/appointments as Admin (positive)", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/appointments`, {
      headers: apiHeaders("Admin"),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).length).toBeGreaterThan(0);
  });

  test("POST /api/appointments on taken slot returns 409 (negative)", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/appointments`, {
      headers: apiHeaders("Admin"),
      data: {
        patient_id: "PAT-001",
        doctor_or_department: "General Physician",
        appointment_date: "2026-05-22",
        appointment_time: "10:30 AM",
        appointment_type: "In-person",
        notes: "Duplicate attempt",
      },
    });
    expect(res.status()).toBe(409);
  });

  test("PATCH /api/appointments as Patient returns 403 (negative)", async ({
    request,
  }) => {
    const res = await request.patch(`${API_BASE}/api/appointments/APT-001`, {
      headers: apiHeaders("Patient"),
      data: { status: "Completed" },
    });
    expect(res.status()).toBe(403);
  });

  test("PATCH /api/appointments as Admin updates status (positive)", async ({
    request,
  }) => {
    const res = await request.patch(`${API_BASE}/api/appointments/APT-003`, {
      headers: apiHeaders("Admin"),
      data: { status: "Completed" },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).status).toBe("Completed");
  });
});

test.describe("API — permissions", () => {
  test("GET /api/audit as Patient returns 403 (negative)", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/audit`, {
      headers: apiHeaders("Patient"),
    });
    expect(res.status()).toBe(403);
  });

  test("GET /api/audit as Admin returns logs (positive)", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/audit`, {
      headers: apiHeaders("Admin"),
    });
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test("GET /api/user/role assigns Admin for admin email (positive)", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/user/role`, {
      headers: apiHeaders("Admin"),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.profile.role).toBe("Admin");
    expect(body.profile.email).toBe("devina.raina@talentserv.co.in");
  });

  test("GET /api/user/role assigns Patient for patient email (positive)", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/user/role`, {
      headers: apiHeaders("Patient"),
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).profile.role).toBe("Patient");
  });
});
