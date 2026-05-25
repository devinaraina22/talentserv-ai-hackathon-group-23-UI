import { beforeEach, describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import {
  checkDuplicatePatient,
  createAppointment,
  createPatient,
  getAvailabilityForDay,
  getDashboardStats,
  isSlotInAvailability,
  isSlotTaken,
  listAuditLogs,
  logAudit,
  resetStore,
  logReminder,
  hasReminderBeenSent,
  updateAppointmentStatus,
  upsertHealthIntake,
} from "@/lib/db";
import { appointmentSchema, healthIntakeSchema, patientSchema } from "@/lib/validation";

const SEED = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data/seed.json"), "utf-8")
);

beforeEach(() => {
  resetStore(SEED);
});

describe("Patient registration validation", () => {
  it("accepts valid patient data", () => {
    const result = patientSchema.safeParse({
      patient_id: "PAT-099",
      full_name: "Test User",
      age: 25,
      gender: "Female",
      phone_number: "1234567890",
      email: "test@example.com",
      city: "Pune",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone number", () => {
    const result = patientSchema.safeParse({
      patient_id: "PAT-099",
      full_name: "Test User",
      age: 25,
      gender: "Female",
      phone_number: "123",
      email: "test@example.com",
      city: "Pune",
    });
    expect(result.success).toBe(false);
  });

  it("detects duplicate patient by email", () => {
    const dup = checkDuplicatePatient("riya@example.com", "0000000000");
    expect(dup.duplicate).toBe(true);
    expect(dup.matches[0].patient_id).toBe("PAT-001");
  });

  it("creates a patient record", () => {
    const patient = createPatient({
      patient_id: "PAT-010",
      full_name: "Demo Patient",
      age: 40,
      gender: "Male",
      phone_number: "1112223334",
      email: "demo@example.com",
      city: "Delhi",
    });
    expect(patient.patient_id).toBe("PAT-010");
  });
});

describe("Health intake validation", () => {
  it("requires consent acknowledgement", () => {
    const result = healthIntakeSchema.safeParse({
      patient_id: "PAT-001",
      symptoms: "Headache",
      existing_conditions: "None",
      allergies: "None",
      current_medications: "None",
      visit_reason: "Checkup",
      emergency_contact: "Contact - 9999999999",
      consent_acknowledged: false,
    });
    expect(result.success).toBe(false);
  });

  it("saves health intake for existing patient", () => {
    const health = upsertHealthIntake({
      patient_id: "PAT-003",
      symptoms: "Rash",
      existing_conditions: "None",
      allergies: "None",
      current_medications: "None",
      visit_reason: "Pediatric visit",
      emergency_contact: "Parent - 9988776655",
      consent_acknowledged: true,
    });
    expect(health.patient_id).toBe("PAT-003");
  });
});

describe("Doctor availability", () => {
  it("returns slots for General Physician on Monday", () => {
    const slots = getAvailabilityForDay("General Physician", "2026-05-18");
    expect(slots.length).toBeGreaterThan(0);
    expect(slots).toContain("10:30 AM");
  });

  it("rejects booking outside availability", () => {
    expect(
      isSlotInAvailability("Pediatrics", "2026-05-18", "10:30 AM")
    ).toBe(false);
  });
});

describe("Appointment booking", () => {
  it("validates appointment schema", () => {
    const result = appointmentSchema.safeParse({
      patient_id: "PAT-001",
      doctor_or_department: "Dental",
      appointment_date: "2026-06-01",
      appointment_time: "11:00 AM",
      appointment_type: "In-person",
    });
    expect(result.success).toBe(true);
  });

  it("books on available slot", () => {
    const apt = createAppointment({
      patient_id: "PAT-001",
      doctor_or_department: "Dental",
      appointment_date: "2026-05-23",
      appointment_time: "09:00 AM",
      appointment_type: "In-person",
      notes: "Cleaning",
    });
    expect(apt.status).toBe("Booked");
  });
});

describe("Duplicate slot prevention", () => {
  it("detects taken slot", () => {
    expect(
      isSlotTaken("General Physician", "2026-05-22", "10:30 AM")
    ).toBe(true);
  });

  it("blocks duplicate booking", () => {
    expect(() =>
      createAppointment({
        patient_id: "PAT-002",
        doctor_or_department: "General Physician",
        appointment_date: "2026-05-22",
        appointment_time: "10:30 AM",
        appointment_type: "Online",
        notes: "Duplicate",
      })
    ).toThrow(/already booked/i);
  });
});

describe("Audit and reminders", () => {
  it("writes audit log entry", () => {
    const entry = logAudit({
      user_id: "u1",
      user_email: "admin@test.com",
      user_role: "Admin",
      action: "TEST",
      entity_type: "appointment",
      entity_id: "APT-001",
      details: "test",
    });
    expect(listAuditLogs()[0].id).toBe(entry.id);
  });

  it("logs reminder and prevents duplicate day_before", () => {
    const rem = logReminder({
      appointment_id: "APT-001",
      channel: "email",
      reminder_type: "day_before",
      recipient: "riya@example.com",
      message: "test",
      simulated: true,
    });
    expect(rem.reminder_type).toBe("day_before");
    expect(hasReminderBeenSent("APT-001", "day_before", "email")).toBe(true);
  });
});

describe("Status update and dashboard", () => {
  it("updates appointment status", () => {
    const updated = updateAppointmentStatus("APT-002", "Completed");
    expect(updated.status).toBe("Completed");
  });

  it("returns dashboard stats without health PHI", () => {
    const stats = getDashboardStats();
    expect(stats.totalAppointments).toBeGreaterThan(0);
    expect(stats.upcoming[0]).not.toHaveProperty("symptoms");
  });
});
