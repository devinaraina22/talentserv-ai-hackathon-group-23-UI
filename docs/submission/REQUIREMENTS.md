# MediBook Clinic — Requirements (Group 23)

**Hackathon:** TalentServ AI Hackathon  
**Product:** MediBook Clinic — healthcare clinic appointment booking MVP  
**Team:** Group 23

---

## Challenge summary

Build a **healthcare clinic appointment booking system** that lets clinic staff and patients manage appointments through structured forms (not a chatbot). The MVP must support third-party authentication, patient registration with validation, health intake capture, appointment booking with duplicate-slot prevention, role-based access, audit logging, and appointment reminders.

MediBook Clinic delivers a production-style split architecture: a Next.js UI deployed separately from a REST API backed by Neon Postgres on Vercel.

---

## Assumptions

| # | Assumption |
|---|------------|
| A1 | All patient and clinical data is **synthetic demo data** only — no real PHI. |
| A2 | Third-party auth is mandatory; custom password storage is out of scope. |
| A3 | Booking is **form-based**; no runtime AI diagnosis or LLM chat in the product. |
| A4 | Production persistence uses **Neon Postgres** (single JSON document row); local dev may use `data/store.json`. |
| A5 | Email delivery requires optional SMTP credentials; without SMTP, reminders are logged as simulated. |
| A6 | Roles are resolved from `role_assignments` in the database (staff) or patient email match (patients). |
| A7 | Demo login mode (`DEMO_LOGIN=true`) is enabled in production for judge access without Clerk sign-up. |
| A8 | SMS reminders are simulated only; email is the primary reminder channel. |

---

## Scope

### In scope

- Third-party authentication (Clerk) plus demo login picker for judges
- Patient registration with Zod validation and duplicate detection (email/phone)
- Health intake form with mandatory consent checkbox
- Appointment booking against doctor availability schedules
- Duplicate slot prevention (same department + date + time, excluding cancelled)
- Appointment list, search/filter, status updates (Booked / Completed / Cancelled)
- Dashboard widgets (totals, today, by status, by department, upcoming — no PHI in lists)
- Role-based access: Admin, Receptionist, Doctor, Patient
- Doctor availability configuration
- Audit log for create/update/reminder actions
- Email booking confirmation and day-before reminders (SMTP + Vercel Cron)
- Printable appointment receipt
- Staff access management (Admin)
- Vitest unit tests (backend) and Playwright e2e tests (frontend)
- CI/CD via GitHub Actions; Vercel deployment (UI + API)

### Out of scope

- Real-time chat or AI triage
- Custom username/password auth
- Multi-clinic tenancy
- HIPAA-compliant production hosting
- Native mobile apps
- Payment / insurance billing
- Full SMS gateway integration
- Automatic database seeding on every Vercel cold start

---

## User stories

### Authentication & roles

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US-01 | Visitor | Sign in with Clerk or demo login | I can access the app securely |
| US-02 | New Clerk user | Complete onboarding / role resolution | I see the correct nav for my role |
| US-03 | Admin | Manage staff role assignments | Only authorized emails get staff roles |
| US-04 | Patient | See only my appointments and profile | My data stays private from other patients |

### Patient management

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US-05 | Receptionist | Register a new patient with validated fields | Invalid data is rejected at entry |
| US-06 | Receptionist | See a duplicate warning for existing email/phone | I avoid creating duplicate records |
| US-07 | Staff | Capture health intake with consent | The clinic has visit context before the appointment |
| US-08 | Staff | View and edit patient details | Records stay current |

### Appointments

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US-09 | Staff | Book an appointment in an available slot | Patients get confirmed times |
| US-10 | System | Block double-booking the same slot | Scheduling conflicts are prevented |
| US-11 | Staff | Update appointment status | Visit outcomes are tracked |
| US-12 | User | Print/save an appointment receipt | Patients have confirmation documentation |
| US-13 | Doctor | Configure weekly availability | Booking only offers real slots |

### Operations

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US-14 | Admin/Receptionist | View dashboard stats | I see clinic workload at a glance |
| US-15 | Admin/Receptionist | Send manual email reminders | Patients are notified before visits |
| US-16 | Admin | Review audit log | Actions are traceable for compliance demo |
| US-17 | System | Send day-before reminder emails via cron | Reminders run without manual intervention |

---

## Acceptance criteria

### AC-01 — Third-party authentication

- [ ] Clerk sign-in/sign-up flows work when `NEXT_PUBLIC_DEMO_LOGIN` is not set
- [ ] Demo login picker at `/login` works when `NEXT_PUBLIC_DEMO_LOGIN=true`
- [ ] Unauthenticated API requests return **401**
- [ ] Staff demo sessions validate against `role_assignments` in the database

### AC-02 — Patient registration

- [ ] Required fields: patient ID, name, age, gender, phone (10 digits), email, country, city
- [ ] Invalid phone returns **400** with validation message
- [ ] `POST /api/patients/check` or duplicate logic warns on matching email/phone
- [ ] Patient role cannot create patients (**403**)

### AC-03 — Health intake

- [ ] Intake saves symptoms, conditions, allergies, medications, visit reason, emergency contact
- [ ] `consent_acknowledged: true` is required; false returns **400**
- [ ] Intake visible on patient detail page only (not dashboard widgets)

### AC-04 — Appointment booking

- [ ] Booking validates against `availability[]` for department and day of week
- [ ] Slot outside availability is rejected
- [ ] Duplicate active booking for same department/date/time returns **409**
- [ ] Cancelled appointments free the slot for rebooking
- [ ] Booking confirmation email sent when SMTP is configured

### AC-05 — Role-based access

- [ ] Admin: full access including `/staff` and audit
- [ ] Receptionist: patients, appointments, reminders, audit (no staff admin)
- [ ] Doctor: read patients/appointments, manage availability for own department
- [ ] Patient: own appointments only; redirected from `/patients` list

### AC-06 — Dashboard & privacy

- [ ] Dashboard shows total appointments, today's count, by status, by department
- [ ] Upcoming list shows name + department only — **no symptoms or health fields**

### AC-07 — Audit & reminders

- [ ] Create/update/reminder actions write to `audit_logs[]`
- [ ] Manual reminder via `/api/appointments/[id]/remind` restricted to Admin/Receptionist
- [ ] Day-before cron at `/api/cron/reminders` protected by `CRON_SECRET`
- [ ] Duplicate day-before reminders for same appointment are prevented

### AC-08 — Testing & deployment

- [ ] Backend Vitest suite passes (`npm test` in API repo — 15 cases)
- [ ] Frontend Playwright suite passes (**33 e2e tests**)
- [ ] UI deployed to Vercel and calls production API URL
- [ ] API deployed with Neon Postgres seeded once via `db:init` + `db:seed`

---

## Non-functional requirements

| Category | Requirement |
|----------|-------------|
| **Security** | JWT verification on API; RBAC on every mutating route; CORS limited to `FRONTEND_URL` |
| **Performance** | E2e performance tests: page load &lt; 8s, API GET &lt; 2s (local CI thresholds) |
| **Maintainability** | Shared Zod schemas; centralized `db.ts` business rules; typed API client in UI |
| **Observability** | Audit log captures user, role, action, entity, timestamp |
| **Deployability** | Separate UI/API Vercel projects; env vars documented in `.env.example` |

---

## Traceability

| Requirement area | Primary implementation |
|------------------|---------------------|
| Auth | Clerk + `demo-auth.ts`, `session.ts`, middleware |
| Patients | `POST /api/patients`, `PatientForm`, `patientSchema` |
| Health intake | `POST /api/health`, `HealthIntakeForm`, `healthIntakeSchema` |
| Appointments | `POST /api/appointments`, `AppointmentForm`, `isSlotTaken()` |
| RBAC | `src/lib/auth.ts` permissions + `canAccessNav()` |
| Audit | `logAudit()` in `db.ts`, `/audit` page |
| Reminders | `notifications.ts`, `/api/cron/reminders`, `/reminders` page |
| Storage | `storage.ts` — Postgres or local JSON |
