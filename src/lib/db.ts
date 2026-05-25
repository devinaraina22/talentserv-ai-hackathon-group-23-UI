import fs from "fs";
import path from "path";
import type {
  Appointment,
  AppointmentStatus,
  AuditLogEntry,
  DashboardStats,
  DataStore,
  DoctorAvailability,
  DuplicatePatientWarning,
  HealthIntake,
  Patient,
  ReminderChannel,
  ReminderLog,
  ReminderType,
  UserProfile,
  UserRole,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const SEED_PATH = path.join(DATA_DIR, "seed.json");

import { DAY_NAMES } from "./constants";

function migrate(raw: Partial<DataStore>): DataStore {
  return {
    patients: raw.patients ?? [],
    health_intakes: raw.health_intakes ?? [],
    appointments: raw.appointments ?? [],
    availability: raw.availability ?? [],
    user_profiles: raw.user_profiles ?? [],
    audit_logs: raw.audit_logs ?? [],
    reminders: raw.reminders ?? [],
  };
}

function ensureStore(): DataStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    const seed = fs.existsSync(SEED_PATH)
      ? migrate(JSON.parse(fs.readFileSync(SEED_PATH, "utf-8")) as Partial<DataStore>)
      : migrate({});
    fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2));
  }
  const store = migrate(JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as Partial<DataStore>);
  return store;
}

function writeStore(store: DataStore): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function readStore(): DataStore {
  return ensureStore();
}

export function resetStore(seed?: DataStore): void {
  if (seed) writeStore(seed);
  else if (fs.existsSync(SEED_PATH))
    writeStore(migrate(JSON.parse(fs.readFileSync(SEED_PATH, "utf-8")) as Partial<DataStore>));
  else writeStore(migrate({}));
}

// --- Audit ---

export function logAudit(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const store = readStore();
  const record: AuditLogEntry = {
    ...entry,
    id: `AUD-${String(store.audit_logs.length + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString(),
  };
  store.audit_logs.unshift(record);
  if (store.audit_logs.length > 500) store.audit_logs = store.audit_logs.slice(0, 500);
  writeStore(store);
  return record;
}

export function listAuditLogs(limit = 100): AuditLogEntry[] {
  return readStore().audit_logs.slice(0, limit);
}

// --- User profiles / roles ---

export function getUserProfile(clerkUserId: string): UserProfile | undefined {
  return readStore().user_profiles.find((u) => u.clerk_user_id === clerkUserId);
}

export function upsertUserProfile(profile: UserProfile): UserProfile {
  const store = readStore();
  const idx = store.user_profiles.findIndex((u) => u.clerk_user_id === profile.clerk_user_id);
  if (idx === -1) store.user_profiles.push(profile);
  else store.user_profiles[idx] = profile;
  writeStore(store);
  return profile;
}

// --- Duplicate patient detection ---

export function checkDuplicatePatient(
  email: string,
  phone: string,
  excludePatientId?: string
): DuplicatePatientWarning {
  const store = readStore();
  const matches = store.patients.filter(
    (p) =>
      p.patient_id !== excludePatientId &&
      (p.email.toLowerCase() === email.toLowerCase() || p.phone_number === phone)
  );
  return {
    duplicate: matches.length > 0,
    matches: matches.map((p) => ({
      patient_id: p.patient_id,
      full_name: p.full_name,
      email: p.email,
      phone_number: p.phone_number,
    })),
  };
}

// --- Availability ---

export function listAvailability(department?: string): DoctorAvailability[] {
  let list = readStore().availability;
  if (department) list = list.filter((a) => a.doctor_or_department === department);
  return list;
}

export function getAvailabilityForDay(
  department: string,
  dateStr: string
): string[] {
  const day = new Date(dateStr + "T12:00:00").getDay();
  const slots = readStore()
    .availability.filter(
      (a) => a.doctor_or_department === department && a.day_of_week === day
    )
    .flatMap((a) => a.time_slots);
  return [...new Set(slots)].sort();
}

export function isSlotInAvailability(
  department: string,
  dateStr: string,
  time: string
): boolean {
  const available = getAvailabilityForDay(department, dateStr);
  if (available.length === 0) return true;
  return available.includes(time);
}

export function createAvailability(
  data: Omit<DoctorAvailability, "id">
): DoctorAvailability {
  const store = readStore();
  const record: DoctorAvailability = {
    ...data,
    id: `AVL-${String(store.availability.length + 1).padStart(3, "0")}`,
  };
  store.availability.push(record);
  writeStore(store);
  return record;
}

export function deleteAvailability(id: string): void {
  const store = readStore();
  store.availability = store.availability.filter((a) => a.id !== id);
  writeStore(store);
}

// --- Patients ---

export function listPatients(): Patient[] {
  return readStore().patients;
}

export function getPatient(patientId: string): Patient | undefined {
  return readStore().patients.find((p) => p.patient_id === patientId);
}

export function getPatientByEmail(email: string): Patient | undefined {
  return readStore().patients.find(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );
}

export function createPatient(
  data: Omit<Patient, "created_at" | "updated_at">,
  options?: { allowDuplicate?: boolean }
): Patient {
  const dup = checkDuplicatePatient(data.email, data.phone_number);
  if (dup.duplicate && !options?.allowDuplicate) {
    throw new Error(
      `Duplicate patient detected: ${dup.matches.map((m) => m.full_name).join(", ")}`
    );
  }
  const store = readStore();
  if (store.patients.some((p) => p.patient_id === data.patient_id)) {
    throw new Error("Patient ID already exists");
  }
  const now = new Date().toISOString();
  const patient: Patient = { ...data, created_at: now, updated_at: now };
  store.patients.push(patient);
  writeStore(store);
  return patient;
}

export function updatePatient(
  patientId: string,
  data: Partial<Omit<Patient, "patient_id" | "created_at">>
): Patient {
  const store = readStore();
  const index = store.patients.findIndex((p) => p.patient_id === patientId);
  if (index === -1) throw new Error("Patient not found");
  if (data.email || data.phone_number) {
    const dup = checkDuplicatePatient(
      data.email ?? store.patients[index].email,
      data.phone_number ?? store.patients[index].phone_number,
      patientId
    );
    if (dup.duplicate) {
      throw new Error(`Duplicate: ${dup.matches.map((m) => m.full_name).join(", ")}`);
    }
  }
  const updated: Patient = {
    ...store.patients[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  store.patients[index] = updated;
  writeStore(store);
  return updated;
}

// --- Health intake ---

export function getHealthIntake(patientId: string): HealthIntake | undefined {
  return readStore().health_intakes.find((h) => h.patient_id === patientId);
}

export function upsertHealthIntake(
  data: Omit<HealthIntake, "updated_at">
): HealthIntake {
  const store = readStore();
  if (!store.patients.some((p) => p.patient_id === data.patient_id)) {
    throw new Error("Patient not found");
  }
  const index = store.health_intakes.findIndex((h) => h.patient_id === data.patient_id);
  const record: HealthIntake = { ...data, updated_at: new Date().toISOString() };
  if (index === -1) store.health_intakes.push(record);
  else store.health_intakes[index] = record;
  writeStore(store);
  return record;
}

// --- Appointments ---

export function listAppointments(filters?: {
  q?: string;
  status?: string;
  department?: string;
  date?: string;
  patientId?: string;
  patientEmail?: string;
  doctorDepartment?: string;
}): Appointment[] {
  const store = readStore();
  let results = [...store.appointments];

  if (filters?.patientId) {
    results = results.filter((a) => a.patient_id === filters.patientId);
  }
  if (filters?.patientEmail) {
    const patient = getPatientByEmail(filters.patientEmail);
    if (patient) results = results.filter((a) => a.patient_id === patient.patient_id);
    else results = [];
  }
  if (filters?.doctorDepartment) {
    results = results.filter(
      (a) => a.doctor_or_department === filters.doctorDepartment
    );
  }
  if (filters?.status) results = results.filter((a) => a.status === filters.status);
  if (filters?.department)
    results = results.filter((a) => a.doctor_or_department === filters.department);
  if (filters?.date)
    results = results.filter((a) => a.appointment_date === filters.date);
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    const patientMap = new Map(store.patients.map((p) => [p.patient_id, p.full_name]));
    results = results.filter((a) => {
      const name = patientMap.get(a.patient_id)?.toLowerCase() ?? "";
      return (
        name.includes(q) ||
        a.appointment_id.toLowerCase().includes(q) ||
        a.doctor_or_department.toLowerCase().includes(q)
      );
    });
  }

  return results.sort((a, b) =>
    `${a.appointment_date} ${a.appointment_time}`.localeCompare(
      `${b.appointment_date} ${b.appointment_time}`
    )
  );
}

export function getAppointment(appointmentId: string): Appointment | undefined {
  return readStore().appointments.find((a) => a.appointment_id === appointmentId);
}

export function isSlotTaken(
  doctorOrDepartment: string,
  appointmentDate: string,
  appointmentTime: string,
  excludeAppointmentId?: string
): boolean {
  return readStore().appointments.some(
    (a) =>
      a.doctor_or_department === doctorOrDepartment &&
      a.appointment_date === appointmentDate &&
      a.appointment_time === appointmentTime &&
      a.status !== "Cancelled" &&
      a.appointment_id !== excludeAppointmentId
  );
}

export function generateAppointmentId(): string {
  const store = readStore();
  const nums = store.appointments
    .map((a) => parseInt(a.appointment_id.replace(/^APT-/i, ""), 10))
    .filter((n) => !Number.isNaN(n));
  return `APT-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
}

export function createAppointment(
  data: Omit<Appointment, "appointment_id" | "status" | "created_at" | "updated_at"> & {
    appointment_id?: string;
  }
): Appointment {
  if (!isSlotInAvailability(data.doctor_or_department, data.appointment_date, data.appointment_time)) {
    const day = DAY_NAMES[new Date(data.appointment_date + "T12:00:00").getDay()];
    throw new Error(
      `Selected time is not available for ${data.doctor_or_department} on ${day}`
    );
  }
  if (isSlotTaken(data.doctor_or_department, data.appointment_date, data.appointment_time)) {
    throw new Error(
      "This time slot is already booked for the selected doctor or department"
    );
  }
  const store = readStore();
  if (!store.patients.some((p) => p.patient_id === data.patient_id)) {
    throw new Error("Patient not found");
  }
  const now = new Date().toISOString();
  const appointment: Appointment = {
    appointment_id: data.appointment_id ?? generateAppointmentId(),
    patient_id: data.patient_id,
    doctor_or_department: data.doctor_or_department,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    appointment_type: data.appointment_type,
    status: "Booked",
    notes: data.notes ?? "",
    created_at: now,
    updated_at: now,
  };
  store.appointments.push(appointment);
  writeStore(store);
  return appointment;
}

export function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Appointment {
  const store = readStore();
  const index = store.appointments.findIndex((a) => a.appointment_id === appointmentId);
  if (index === -1) throw new Error("Appointment not found");
  store.appointments[index] = {
    ...store.appointments[index],
    status,
    updated_at: new Date().toISOString(),
  };
  writeStore(store);
  return store.appointments[index];
}

// --- Reminders ---

export function hasReminderBeenSent(
  appointmentId: string,
  reminderType: ReminderType,
  channel: ReminderChannel = "email"
): boolean {
  return readStore().reminders.some(
    (r) =>
      r.appointment_id === appointmentId &&
      (r.reminder_type ?? "manual") === reminderType &&
      r.channel === channel
  );
}

export function logReminder(
  data: Omit<ReminderLog, "id" | "sent_at">
): ReminderLog {
  const store = readStore();
  const log: ReminderLog = {
    ...data,
    id: `REM-${String(store.reminders.length + 1).padStart(4, "0")}`,
    sent_at: new Date().toISOString(),
  };
  store.reminders.unshift(log);
  writeStore(store);
  return log;
}

export function listReminders(limit = 50): ReminderLog[] {
  return readStore().reminders.slice(0, limit);
}

// --- Dashboard ---

export function getDashboardStats(role?: UserRole, userEmail?: string, department?: string): DashboardStats {
  const store = readStore();
  const today = new Date().toISOString().slice(0, 10);
  const patientMap = new Map(store.patients.map((p) => [p.patient_id, p.full_name]));

  let appointments = store.appointments;
  if (role === "Patient" && userEmail) {
    const p = getPatientByEmail(userEmail);
    appointments = p ? appointments.filter((a) => a.patient_id === p.patient_id) : [];
  } else if (role === "Doctor" && department) {
    appointments = appointments.filter((a) => a.doctor_or_department === department);
  }

  const byStatus: DashboardStats["byStatus"] = { Booked: 0, Completed: 0, Cancelled: 0 };
  const byDepartment: Record<string, number> = {};

  for (const apt of appointments) {
    byStatus[apt.status]++;
    byDepartment[apt.doctor_or_department] =
      (byDepartment[apt.doctor_or_department] ?? 0) + 1;
  }

  const upcoming = appointments
    .filter((a) => a.status === "Booked" && a.appointment_date >= today)
    .sort((a, b) =>
      `${a.appointment_date} ${a.appointment_time}`.localeCompare(
        `${b.appointment_date} ${b.appointment_time}`
      )
    )
    .slice(0, 5)
    .map((a) => ({
      appointment_id: a.appointment_id,
      patient_name: patientMap.get(a.patient_id) ?? "Unknown",
      doctor_or_department: a.doctor_or_department,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      status: a.status,
    }));

  return {
    totalAppointments: appointments.length,
    todaysAppointments: appointments.filter(
      (a) => a.appointment_date === today && a.status !== "Cancelled"
    ).length,
    byStatus,
    byDepartment,
    upcoming,
  };
}

