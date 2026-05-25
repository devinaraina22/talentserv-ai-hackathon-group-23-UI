# CLAUDE.md — Project guide for AI assistants

Use this file when working on **MediBook Clinic** (PatientBookingAI) in Cursor, Claude Code, or similar agentic tools.

---

## What this app is

A **healthcare hackathon MVP**: clinic staff and patients book appointments via forms (not chat AI). Includes Clerk auth, role-based UI, JSON file storage, SMTP emails, and audit logging. **Synthetic data only.**

---

## Commands

```bash
npm install
cp .env.example .env.local    # Clerk keys required; SMTP optional
npm run db:seed               # data/seed.json → data/store.json
npm run dev                   # http://localhost:3000
npm test                      # Vitest — tests/booking.test.ts
npm run test:e2e              # Playwright — e2e/
npm run email:test user@x.com # SMTP smoke test
npm run reminders:due         # Day-before appointment emails
npm run build
```

---

## Architecture (single Next.js app)

| Concern | Location | Notes |
|---------|----------|-------|
| **Frontend pages** | `src/app/(app)/*`, `src/app/onboarding`, `src/app/page.tsx` | Server + client components |
| **UI components** | `src/components/*` | Forms, AppShell, RoleProvider |
| **API / backend** | `src/app/api/**/route.ts` | Next.js Route Handlers (REST) |
| **Business logic** | `src/lib/db.ts` | Read/write JSON store, slot rules, audit |
| **Validation** | `src/lib/validation.ts` | Zod schemas |
| **Auth (Clerk)** | `src/middleware.ts`, `src/lib/session.ts` | No custom passwords |
| **Roles** | `src/lib/auth.ts` | Admin, Receptionist, Doctor, Patient |
| **Email** | `src/lib/email.ts`, `email-templates.ts`, `notifications.ts` | Nodemailer + SMTP |
| **Types** | `src/lib/types.ts` | Patient, Appointment, DataStore, etc. |
| **Constants** | `src/lib/constants.ts` | CLINIC branding, departments, slots |
| **Data** | `data/store.json` (runtime), `data/seed.json` (seed) | File-based, not SQL |

There is **no separate backend server** — API routes and UI share the same Next.js process.

---

## Authentication flow

1. **Clerk** handles sign-in/sign-up (`/sign-in`, `/sign-up`)
2. `src/middleware.ts` protects all routes except public landing + auth pages
3. New users → `/onboarding` → `POST /api/user/role` → profile in `store.json` → `user_profiles[]`
4. API routes call `requireProfile()` from `src/lib/session.ts` and check `hasPermission()` from `src/lib/auth.ts`

**Never** implement custom password auth — hackathon requirement is third-party auth only.

---

## Data model (JSON store)

```typescript
// src/lib/types.ts → DataStore
{
  patients: Patient[]           // PAT-001 format
  health_intakes: HealthIntake[]
  appointments: Appointment[]   // APT-001, status: Booked|Completed|Cancelled
  availability: DoctorAvailability[]
  user_profiles: UserProfile[]  // clerk_user_id + role
  audit_logs: AuditLogEntry[]
  reminders: ReminderLog[]
}
```

**All mutations** go through `src/lib/db.ts` → `writeStore()`. Do not write `store.json` from components directly.

**Duplicate slot rule:** same `doctor_or_department` + `appointment_date` + `appointment_time`, excluding `Cancelled` appointments.

**Availability:** booking validates against `availability[]` for that department/day.

---

## API routes map

```
GET/POST     /api/patients
GET          /api/patients/check
GET/PUT      /api/patients/[id]
POST         /api/health
GET/POST     /api/appointments
GET/PATCH    /api/appointments/[id]
POST         /api/appointments/[id]/remind
GET          /api/dashboard
GET/POST     /api/availability
DELETE       /api/availability/[id]
GET          /api/audit
GET          /api/reminders
GET/POST     /api/user/role
POST         /api/cron/reminders
```

Patient role: appointments filtered by email. Doctor role: filtered by `department`.

---

## Frontend routes (protected unless noted)

| Route | Page |
|-------|------|
| `/` | Public landing |
| `/onboarding` | Role picker (first login) |
| `/dashboard` | Stats widgets |
| `/patients`, `/patients/new`, `/patients/[id]` | Patient CRUD + health intake |
| `/appointments`, `/appointments/new`, `/appointments/[id]` | Booking + status |
| `/appointments/[id]/receipt` | Printable receipt |
| `/availability` | Doctor slot config |
| `/reminders` | Email/SMS reminders (Admin/Receptionist) |
| `/audit` | Audit log |

Nav visibility: `canAccessNav()` in `src/lib/auth.ts` + `AppShell.tsx`.

---

## Environment variables

Required:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Optional (real email):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `CRON_SECRET` for `/api/cron/reminders`

Copy from `.env.example`. Dev script `scripts/check-clerk-env.ts` runs before `npm run dev`.

---

## Coding conventions

1. **Minimal scope** — match existing patterns in neighboring files
2. **Validation** — use Zod in `validation.ts`; validate in API routes
3. **Audit** — call `logAudit()` on create/update/reminder actions
4. **Privacy** — no health PHI on dashboard list widgets; detail pages only
5. **IDs** — `PAT-xxx` patients, `APT-xxx` appointments (separate IDs in emails)
6. **Branding** — use `CLINIC` from `constants.ts` (MediBook Clinic, MB logo)
7. **Tests** — add Vitest cases in `tests/booking.test.ts` for db logic
8. **No runtime AI** — product is form-based booking, not LLM diagnosis

---

## Common tasks

| Task | Where to change |
|------|-----------------|
| Add API endpoint | `src/app/api/.../route.ts` + `db.ts` if new logic |
| Add page | `src/app/(app)/.../page.tsx` + nav in `AppShell.tsx` |
| Change validation | `src/lib/validation.ts` |
| Change email copy | `src/lib/email-templates.ts` |
| Change clinic info | `src/lib/constants.ts` → `CLINIC` |
| Reset demo data | `npm run db:seed` (wipes runtime `store.json`) |

---

## Testing

- **Unit:** `npm test` — resets store from seed in `beforeEach`
- **E2E:** `npm run test:e2e` — needs dev server; landing page test
- **CI:** `.github/workflows/ci.yml` — test + build + e2e

---

## Known limitations

- File storage not suitable for multi-instance production (use Postgres for prod)
- SMS reminders are simulated only
- Role selection is demo-local (stored in JSON, not Clerk metadata)
- Vercel deploy may lose `store.json` between invocations

---

## Agentic workflow reference

See [AGENTIC_EVIDENCE.md](./AGENTIC_EVIDENCE.md) for hackathon requirement breakdown, design, implementation, testing, review, and iteration evidence.

When extending this project, prefer editing existing `db.ts` / API / component patterns over introducing new frameworks.
