# Agentic Programming Evidence — MediBook Clinic

This document satisfies the hackathon requirement to show **agentic programming** across requirement breakdown, design, implementation, testing, review, and iteration.

**Primary tool:** [Cursor Agent](https://cursor.com) (Composer / Agent mode)  
**Repository:** PatientBookingAI — TalentServ Healthcare Hackathon MVP

---

## 1. Requirement breakdown (AI-assisted)

| Hackathon requirement | Implementation |
|----------------------|----------------|
| Third-party authentication | Clerk — `src/middleware.ts`, sign-in/sign-up pages |
| Patient registration + validation | `PatientForm`, Zod `patientSchema`, `POST /api/patients` |
| Health intake | `HealthIntakeForm`, consent checkbox, `POST /api/health` |
| Appointment booking | `AppointmentForm`, availability-aware slots |
| Duplicate slot prevention | `isSlotTaken()` in `src/lib/db.ts` |
| Booking list / search / status | `/appointments`, filters, `StatusUpdater` |
| Dashboard widgets | `/dashboard` — total, today, by status, by department, upcoming |
| Privacy guardrails | No PHI in dashboard/upcoming lists; detail views only |
| Tests (5–10) | `tests/booking.test.ts` — 15+ cases |
| Deployment | Vercel-ready + GitHub Actions CI |
| **Extensions (bonus)** | Roles, availability, audit, email, receipt, Playwright, CI/CD |

**Assumptions documented with AI:**
- JSON file store for hackathon speed (`data/store.json`)
- Synthetic seed data only (`data/seed.json`)
- No runtime AI / diagnosis in the product itself

---

## 2. Design (AI-assisted)

### Data model — `src/lib/types.ts`

- `Patient`, `HealthIntake`, `Appointment`, `DoctorAvailability`
- `UserProfile` (role), `AuditLogEntry`, `ReminderLog`
- `DataStore` aggregate for JSON persistence

### API design — `src/app/api/*`

REST Route Handlers with Clerk session + role permissions (`src/lib/auth.ts`).

### Validation — `src/lib/validation.ts`

Zod schemas for patient, health intake, appointment, search filters.

### Privacy design

- Dashboard `getDashboardStats().upcoming` returns name + department only
- Health intake visible on patient detail and appointment detail pages

### Email design — `src/lib/email-templates.ts`

- MediBook Clinic branding, MB shield logo
- Separate Patient ID (`PAT-xxx`) and Appointment ID (`APT-xxx`)
- RSVP: reschedule/cancel via reply (no “confirm” wording)
- Logo at email footer on light background for contrast

---

## 3. Implementation (AI-assisted)

### Phase 1 — MVP core
- Next.js 15 scaffold, Clerk middleware, patient/appointment flows
- Dashboard widgets, Vitest tests, README

### Phase 2 — Extensions (agent iterations)
- Role onboarding (`/onboarding`, `user_profiles`)
- Doctor availability + slot-aware booking
- Duplicate patient detection API
- Audit log, printable receipt
- MediBook UI redesign (sidebar, teal medical theme)

### Phase 3 — Email & reminders (agent iterations)
- Nodemailer SMTP integration
- Booking confirmation on create
- Day-before cron (`npm run reminders:due`, `/api/cron/reminders`)
- Admin/Receptionist manual reminders

### Key files touched by agentic coding

```
src/lib/db.ts                 # Persistence, business rules
src/lib/notifications.ts      # Email orchestration
src/lib/email-templates.ts    # HTML templates
src/middleware.ts             # Auth + onboarding redirect
src/app/(app)/*               # Protected UI
src/app/api/*                 # REST API
src/components/*              # Forms, AppShell, RoleProvider
tests/booking.test.ts         # Unit tests
e2e/landing.spec.ts           # E2E
.github/workflows/ci.yml      # CI/CD
```

---

## 4. Testing (AI-generated & maintained)

### Vitest — `tests/booking.test.ts`

| # | Test area |
|---|-----------|
| 1 | Valid patient schema |
| 2 | Invalid phone rejection |
| 3 | Duplicate patient detection |
| 4 | Patient creation |
| 5 | Health consent required |
| 6 | Health intake save |
| 7 | Doctor availability slots |
| 8 | Booking outside availability blocked |
| 9 | Appointment schema validation |
| 10 | Appointment booking |
| 11 | Duplicate slot detection |
| 12 | Duplicate booking blocked |
| 13 | Audit log write |
| 14 | Reminder log + dedup |
| 15 | Status update + dashboard (no PHI) |

```bash
npm test
```

### Playwright — `e2e/landing.spec.ts`

- Public landing branding + sign-in CTA
- API auth guard (401 without session)

```bash
npm run test:e2e
```

### Manual / SMTP

```bash
npm run email:test your@gmail.com
```

---

## 5. Review (AI-assisted findings → fixes)

| Review finding | Fix applied |
|----------------|-------------|
| Dashboard exposed health data | Removed PHI from list widgets |
| Cancelled slots not reusable | `isSlotTaken()` excludes Cancelled |
| Clerk quickstart broke layout (`Show` import) | Restored minimal `ClerkProvider` layout |
| Placeholder Clerk keys in `.env.local` | Added `check-clerk-env.ts` pre-dev check |
| SMTP TLS mismatch | Port 587 + `SMTP_SECURE=false` guidance |
| White/invisible logo in emails | Dark wordmark + logo moved to footer |
| Patient vs Appointment ID confusion | Both shown separately in emails |
| Reminders open to all roles | Restricted to Admin + Receptionist |

---

## 6. Iteration log (agent feedback loops)

| Iteration | User / review input | Agent action |
|-----------|---------------------|--------------|
| 1 | Hackathon brief (forms, not chat bot) | Rebuilt as form-based clinic MVP |
| 2 | Extension features + better UI | Roles, availability, audit, MediBook redesign |
| 3 | Real email + day-before reminders | Nodemailer, templates, cron script |
| 4 | RSVP + logo + MediBook branding | Email templates, `medibook-clinic-logo.svg` |
| 5 | Documentation for judges | README, CLAUDE.md, this file |

---

## 7. Tooling summary

| Tool | Usage |
|------|-------|
| **Cursor Agent** | Requirements → code → tests → docs → fixes |
| **Clerk** | Authentication (mandatory third-party) |
| **Zod** | Input validation |
| **Vitest** | Unit/integration tests on db layer |
| **Playwright** | E2E smoke tests |
| **GitHub Actions** | CI pipeline |
| **Nodemailer** | SMTP email delivery |

---

## 8. Demo trace (5 minutes)

1. **Login** — Clerk sign-in
2. **Onboarding** — Select Receptionist
3. **Register** — PAT-004 with synthetic data; show duplicate warning on existing email
4. **Health intake** — Consent checkbox required
5. **Book** — Pick department + available slot → confirmation email (SMTP)
6. **Duplicate slot** — Retry same slot → error
7. **Receipt** — Print / Save as PDF with MediBook logo
8. **Reminders** — Admin sends email; run day-before job
9. **Audit** — Show CREATE / UPDATE_STATUS entries
10. **Tests** — `npm test` in terminal

---

## 9. Submission checklist

| Item | Location |
|------|----------|
| GitHub repository | Remote origin |
| Setup instructions | [README.md](./README.md) |
| Auth configuration | README + `.env.example` |
| Sample data | `data/seed.json` |
| Local run | `npm install && npm run db:seed && npm run dev` |
| Test evidence | `npm test`, `npm run test:e2e` |
| Privacy notes | README + `DISCLAIMER` in app footer |
| Agentic evidence | **This file** |
| AI assistant guide | [CLAUDE.md](./CLAUDE.md) |
| Known limitations | README + CLAUDE.md |

---

## 10. Suggested judge talking points

> “We used Cursor Agent end-to-end: the brief was decomposed into user stories, the data model and API were designed with AI, implementation was pair-programmed with the agent, tests were generated and expanded after review, and we iterated on SMTP, roles, and email templates based on agent-suggested fixes and user feedback.”

**Evidence artifacts:** git history, this document, test output, `CLAUDE.md` for reproducibility.
