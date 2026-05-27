# Agentic Programming Evidence — MediBook Clinic (Group 23)

This document satisfies the hackathon requirement to show **agentic programming** across requirement breakdown, design, implementation, testing, review, and iteration.

**Primary tool:** [Cursor Agent](https://cursor.com) (Composer / Agent mode)  
**Product:** MediBook Clinic — TalentServ AI Hackathon, Group 23  
**Repositories:** UI + API (see [Submission Index](./docs/submission/SUBMISSION_INDEX.md))

---

## Submission documentation package

| Document | Purpose |
|----------|---------|
| [SUBMISSION_INDEX.md](./docs/submission/SUBMISSION_INDEX.md) | Master checklist, URLs, env vars, setup |
| [REQUIREMENTS.md](./docs/submission/REQUIREMENTS.md) | Groomed requirements, user stories, acceptance criteria |
| [SOLUTION_PLAN.md](./docs/submission/SOLUTION_PLAN.md) | Phased implementation plan and module map |
| [ARCHITECTURE.md](./docs/submission/ARCHITECTURE.md) | Frontend/backend split, Postgres, auth, API design |
| [TEST_PLAN.md](./docs/submission/TEST_PLAN.md) | 15 Vitest + 33 Playwright test cases |
| [CRITICAL_REVIEW.md](./docs/submission/CRITICAL_REVIEW.md) | Self-review, risks, tech debt |
| [CLAUDE.md](./CLAUDE.md) | AI assistant project guide |

---

## 1. Requirement breakdown (AI-assisted)

| Hackathon requirement | Implementation |
|----------------------|----------------|
| Third-party authentication | Clerk — middleware, sign-in; demo login at `/login` |
| Patient registration + validation | `PatientForm`, Zod `patientSchema`, `POST /api/patients` |
| Health intake | `HealthIntakeForm`, consent checkbox, `POST /api/health` |
| Appointment booking | `AppointmentForm`, availability-aware slots |
| Duplicate slot prevention | `isSlotTaken()` in backend `src/lib/db.ts` |
| Booking list / search / status | `/appointments`, filters, status updater |
| Dashboard widgets | `/dashboard` — total, today, by status, by department, upcoming |
| Privacy guardrails | No PHI in dashboard/upcoming lists; detail views only |
| Tests | Backend Vitest (15) + frontend Playwright (33) |
| Deployment | Vercel UI + API; Neon Postgres; GitHub Actions CI |
| **Extensions** | Roles, availability, audit, email, receipt, staff admin, demo login |

**Assumptions documented with AI:**
- Neon Postgres (production) / JSON file store (local dev) for hackathon speed
- Synthetic seed data only (`data/seed.json`)
- No runtime AI / diagnosis in the product itself
- Split frontend/backend repos for independent Vercel deploys

Full detail: [REQUIREMENTS.md](./docs/submission/REQUIREMENTS.md)

---

## 2. Design (AI-assisted)

### Architecture

- **Frontend:** Next.js 15 UI — pages, components, Clerk/demo login, API client
- **Backend:** Next.js Route Handlers — REST API, `db.ts`, Postgres adapter, SMTP

See [ARCHITECTURE.md](./docs/submission/ARCHITECTURE.md) for diagrams.

### Data model — backend `src/lib/types.ts`

- `Patient`, `HealthIntake`, `Appointment`, `DoctorAvailability`
- `UserProfile`, `RoleAssignment`, `AuditLogEntry`, `ReminderLog`
- `DataStore` aggregate persisted as JSONB in Neon (`medibook_store`)

### API design — backend `src/app/api/*`

REST handlers with session + role permissions (`src/lib/auth.ts`).

### Validation — backend `src/lib/validation.ts`

Zod schemas for patient, health intake, appointment, search filters.

### Privacy design

- Dashboard `getDashboardStats().upcoming` returns name + department only
- Health intake visible on patient detail and appointment detail pages

### Email design — backend `src/lib/email-templates.ts`

- MediBook Clinic branding, MB shield logo
- Separate Patient ID (`PAT-xxx`) and Appointment ID (`APT-xxx`)
- Logo at email footer on light background for contrast

Implementation sequence: [SOLUTION_PLAN.md](./docs/submission/SOLUTION_PLAN.md)

---

## 3. Implementation (AI-assisted)

### Phase 1 — MVP core
- Next.js scaffold, Clerk middleware, patient/appointment flows
- Dashboard widgets, Vitest tests, README

### Phase 2 — Extensions
- Role onboarding + `role_assignments`
- Doctor availability + slot-aware booking
- Duplicate patient detection API
- Audit log, printable receipt
- MediBook UI redesign (sidebar, teal medical theme)

### Phase 3 — Email & reminders
- Nodemailer SMTP integration
- Booking confirmation on create
- Day-before cron (`npm run reminders:due`, `/api/cron/reminders`)
- Admin/Receptionist manual reminders

### Phase 4 — Split & Postgres
- Separate UI and API repos
- Neon Postgres JSONB storage
- Cross-origin CORS + Bearer JWT auth
- Expanded Playwright suite (33 tests)

### Key files touched by agentic coding

```
Backend (PatientBookingAI-backend)
├── src/lib/db.ts, storage.ts     # Persistence, business rules
├── src/lib/notifications.ts      # Email orchestration
├── src/lib/email-templates.ts    # HTML templates
├── src/lib/demo-auth.ts          # Demo login sessions
├── src/middleware.ts             # CORS
└── src/app/api/*                 # REST API

Frontend (PatientBookingAI)
├── src/middleware.ts             # Auth + demo redirect
├── src/app/(app)/*               # Protected UI
├── src/components/*              # Forms, AppShell, DemoLoginPicker
├── src/lib/api-client.ts         # HTTP to backend
└── e2e/*.spec.ts                 # 33 Playwright tests
```

---

## 4. Testing (AI-generated & maintained)

Full test plan: [TEST_PLAN.md](./docs/submission/TEST_PLAN.md)

### Vitest — backend `tests/booking.test.ts` (15 tests)

Patient validation, duplicate detection, health consent, availability, booking, duplicate slots, audit, reminders, dashboard PHI guard.

```bash
cd PatientBookingAI-backend && npm test
```

### Playwright — frontend `e2e/*.spec.ts` (33 tests passing)

| Spec file | Tests | Coverage |
|-----------|-------|----------|
| `landing.spec.ts` | 1 | Public branding |
| `admin-patient-flows.spec.ts` | 10 | Admin + patient UI flows |
| `api.spec.ts` | 17 | API auth, validation, RBAC |
| `performance.spec.ts` | 5 | Page/API load thresholds |

```bash
cd PatientBookingAI && npm run test:e2e
```

### Manual / SMTP

```bash
cd PatientBookingAI-backend
npm run email:test your@gmail.com
```

---

## 5. Review (AI-assisted findings → fixes)

Full self-review: [CRITICAL_REVIEW.md](./docs/submission/CRITICAL_REVIEW.md)

| Review finding | Fix applied |
|----------------|-------------|
| Dashboard exposed health data | Removed PHI from list widgets |
| Cancelled slots not reusable | `isSlotTaken()` excludes Cancelled |
| Monolith file storage on Vercel | Migrated to Neon Postgres |
| Cross-origin API auth broken | JWT validated in handlers, not middleware protect |
| Clerk sign-up friction for judges | Demo login picker at `/login` |
| SMTP TLS mismatch | Port 587 + `SMTP_SECURE=false` guidance |
| White/invisible logo in emails | Dark wordmark + logo moved to footer |
| Reminders open to all roles | Restricted to Admin + Receptionist |
| Thin e2e coverage | Expanded to 33 Playwright tests |

---

## 6. Iteration log (agent feedback loops)

| Iteration | Input | Agent action |
|-----------|-------|--------------|
| 1 | Hackathon brief (forms, not chat bot) | Built form-based clinic MVP |
| 2 | Extension features + better UI | Roles, availability, audit, MediBook redesign |
| 3 | Real email + day-before reminders | Nodemailer, templates, cron script |
| 4 | RSVP + logo + MediBook branding | Email templates, logo asset |
| 5 | Split UI/API for production | Two repos, Postgres, CORS, API client |
| 6 | Demo login + comprehensive e2e | Role picker, 33 Playwright tests |
| 7 | Submission documentation | Full docs package in `docs/submission/` |

---

## 7. Tooling summary

| Tool | Usage |
|------|-------|
| **Cursor Agent** | Requirements → code → tests → docs → fixes |
| **Clerk** | Authentication (mandatory third-party) |
| **Neon Postgres** | Production persistence |
| **Zod** | Input validation |
| **Vitest** | Unit/integration tests on db layer (backend) |
| **Playwright** | E2E UI + API + performance tests (frontend) |
| **GitHub Actions** | CI on both repos |
| **Nodemailer** | SMTP email delivery |
| **Vercel** | UI + API deployment, cron |

---

## 8. Demo video script (3 sections — ~5 minutes)

Record the demo video in **three distinct sections** as required by hackathon submission guidelines.

### Section A — Intro & methodology (~1–1.5 min)

**Talking points:**
- Group 23 — MediBook Clinic for TalentServ AI Hackathon
- Problem: clinic staff need form-based patient registration, health intake, and appointment booking with role-based access
- Agentic approach: Cursor Agent decomposed requirements → designed split architecture → implemented UI/API → generated tests → iterated on review findings
- Architecture: Next.js UI + REST API + Neon Postgres + Clerk + demo login for judges
- Show [ARCHITECTURE.md](./docs/submission/ARCHITECTURE.md) diagram or repo structure briefly

### Section B — App demo (~2.5–3 min)

**Live on production UI** (demo login enabled):

1. Open production URL → `/login` → select **Admin** from demo picker
2. **Dashboard** — stats widgets (no PHI in lists)
3. **Register patient** — PAT-099, valid synthetic data; show validation error on bad phone
4. **Health intake** — consent checkbox required → save
5. **Book appointment** — pick department + available slot → **receipt** page
6. **Duplicate slot** — retry same slot → error
7. **Audit log** — CREATE / UPDATE entries
8. **Reminders** — manual send or show reminder log
9. Switch to **Patient** demo login — limited nav, own appointments only
10. Optional: **Staff** page (Admin) — role assignments

### Section C — Wrap-up (~1 min)

**Talking points:**
- Tests: 15 Vitest (backend) + **33 Playwright e2e** (frontend) — all passing in CI
- Show terminal: `npm test` or GitHub Actions green check
- Deployment: UI + API on Vercel; Postgres seeded once
- Known limitations: synthetic data, demo login for judges, JSONB storage (see [CRITICAL_REVIEW.md](./docs/submission/CRITICAL_REVIEW.md))
- Repositories and [SUBMISSION_INDEX.md](./docs/submission/SUBMISSION_INDEX.md)

**Status:** ⬜ Demo video — *team to record and upload*

---

## 9. Submission checklist

| Item | Location |
|------|----------|
| Master index | [docs/submission/SUBMISSION_INDEX.md](./docs/submission/SUBMISSION_INDEX.md) |
| Production UI | https://talentserv-ai-hackathon-group-23-ui-devinaraina22s-projects.vercel.app |
| Production API | https://talentserv-ai-hackathon-group-23-ba.vercel.app |
| GitHub UI | https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-UI |
| GitHub API | https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-backend |
| Setup instructions | [README.md](./README.md) |
| Sample data | Backend `data/seed.json` |
| Local run | See README — both repos required |
| Test evidence | [TEST_PLAN.md](./docs/submission/TEST_PLAN.md) |
| Agentic evidence | **This file** |
| Demo video | Section 8 above — pending |

---

## 10. Suggested judge talking points

> "We used Cursor Agent end-to-end: the brief was decomposed into user stories, the split UI/API architecture was designed with AI, implementation was pair-programmed with the agent across two repos, tests were generated and expanded to 15 Vitest and 33 Playwright cases after review, and we iterated on Postgres migration, demo login, and email templates based on agent-suggested fixes."

**Evidence artifacts:** git history, this document, submission docs in `docs/submission/`, CI test output, `CLAUDE.md` for reproducibility.
