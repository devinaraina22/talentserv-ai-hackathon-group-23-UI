# MediBook Clinic — Patient Booking System

Hackathon MVP for clinic patient registration, health intake, appointment booking, and role-based dashboard. Built with **Next.js 15**, **Clerk authentication**, and **agentic programming** (Cursor Agent).

> **Disclaimer:** For appointment booking and basic intake only. No medical advice, diagnosis, or treatment. **Use synthetic patient data only.**

---

## Quick start

```bash
git clone <repository-url>
cd PatientBookingAI
npm install
cp .env.example .env.local
# Edit .env.local — add Clerk keys (required) and SMTP (optional, for real emails)
npm run db:seed
npm run dev
```

Open **http://localhost:3000** → Sign in → Choose role at `/onboarding` → Dashboard.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (checks Clerk env first) |
| `npm run db:seed` | Reset `data/store.json` from `data/seed.json` |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run email:test you@gmail.com` | Test SMTP configuration |
| `npm run reminders:due` | Send day-before reminder emails |
| `npm run build` | Production build |

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React 19 + Tailwind + App Router)                │
│  src/app/(app)/*  src/components/*                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch / server components
┌──────────────────────────▼──────────────────────────────────┐
│  API LAYER (Next.js Route Handlers)                         │
│  src/app/api/*                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  BUSINESS LOGIC                                             │
│  src/lib/db.ts  validation.ts  auth.ts  notifications.ts    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  DATA (JSON file store)                                     │
│  data/store.json  ← runtime   data/seed.json  ← demo seed   │
└─────────────────────────────────────────────────────────────┘

AUTH: Clerk (@clerk/nextjs) via src/middleware.ts
EMAIL: Nodemailer (SMTP) via src/lib/email.ts
```

---

## Tech stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 App Router, React 19, TypeScript | Pages, forms, dashboard |
| **Styling** | Tailwind CSS 3, Lucide icons | UI / sidebar / cards |
| **Backend** | Next.js API Routes (`src/app/api/`) | REST endpoints |
| **Auth** | [Clerk](https://clerk.com) | Third-party login; no custom passwords |
| **Validation** | Zod | Patient, health, appointment schemas |
| **Storage** | JSON files (`data/store.json`) | Patients, appointments, audit, roles |
| **Email** | Nodemailer + SMTP | Booking confirmation & reminders |
| **Tests** | Vitest + Playwright | Unit + E2E |
| **CI** | GitHub Actions (`.github/workflows/ci.yml`) | Build, test, E2E |

---

## Authentication (Clerk)

1. Create app at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Add to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_<full-key>
CLERK_SECRET_KEY=sk_test_<full-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

3. **Protected routes:** `src/middleware.ts` uses `clerkMiddleware` + `auth.protect()` for all routes except `/`, `/sign-in`, `/sign-up`.
4. **Role onboarding:** First login redirects to `/onboarding` to pick Admin / Receptionist / Doctor / Patient (stored in `data/store.json` → `user_profiles[]`).

---

## Data storage

| File | Role |
|------|------|
| `data/seed.json` | Committed demo data (PAT-001…, APT-001…) |
| `data/store.json` | **Live runtime data** — all API writes go here |

**Example:** Registering **PAT-004** appends to `store.json` → `patients[]`. Health intake, appointments, audit logs, reminders, and user roles are in the same file.

```bash
# View patients
cat data/store.json | grep patient_id

# Reset to seed (⚠️ deletes PAT-004 and other runtime data)
npm run db:seed
```

`data/store.json` is gitignored. For production, migrate to PostgreSQL/Supabase.

---

## API reference

All API routes require Clerk session unless noted. Role checks in `src/lib/auth.ts`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List patients |
| POST | `/api/patients` | Create patient (duplicate detection) |
| GET | `/api/patients/check?email=&phone=` | Duplicate patient warning |
| GET/PUT | `/api/patients/[id]` | View / update patient + health |
| POST | `/api/health` | Upsert health intake |
| GET | `/api/appointments` | List/search (role-filtered) |
| POST | `/api/appointments` | Book appointment + confirmation email |
| GET/PATCH | `/api/appointments/[id]` | Detail / update status |
| POST | `/api/appointments/[id]/remind` | Send email/SMS reminder (Admin/Receptionist) |
| GET | `/api/dashboard` | Dashboard stats |
| GET/POST | `/api/availability` | List / create doctor slots |
| DELETE | `/api/availability/[id]` | Remove availability block |
| GET | `/api/audit` | Audit log |
| GET | `/api/reminders` | Reminder history |
| GET/POST | `/api/user/role` | Get / set user role |
| POST | `/api/cron/reminders` | Day-before email job (CRON_SECRET) |

---

## Features

- **Patient registration** — validation, duplicate email/phone warning
- **Health intake** — symptoms, allergies, consent checkbox
- **Appointments** — department, date, time, duplicate slot prevention
- **Doctor availability** — configure days/times per department
- **Role-based access** — Admin, Receptionist, Doctor, Patient
- **Dashboard** — metrics without PHI in list views
- **Audit log** — who created/updated records
- **Email** — booking confirmation; day-before reminder; manual reminders
- **Receipt** — printable PDF at `/appointments/[id]/receipt`

---

## Email (SMTP)

Add to `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="MediBook Clinic <your@gmail.com>"
CRON_SECRET=random-secret-for-cron
```

| Event | Trigger |
|-------|---------|
| Booking confirmation | Auto on `POST /api/appointments` |
| Day-before reminder | `npm run reminders:due` or cron |
| Manual reminder | Admin/Receptionist on appointment page |

Without SMTP, emails log to the **terminal** (dev mode).

**Gmail:** Enable 2FA → [App Password](https://myaccount.google.com/apppasswords) → use as `SMTP_PASS`.

---

## Project structure

```
PatientBookingAI/
├── data/
│   ├── seed.json              # Demo seed data
│   └── store.json             # Runtime DB (gitignored)
├── public/
│   └── medibook-clinic-logo.svg
├── src/
│   ├── app/
│   │   ├── (app)/             # Protected UI (dashboard, patients, …)
│   │   ├── api/               # REST API routes
│   │   ├── onboarding/        # Role selection
│   │   ├── sign-in/ sign-up/
│   │   └── page.tsx           # Public landing
│   ├── components/            # Forms, AppShell, etc.
│   ├── lib/
│   │   ├── db.ts              # JSON persistence + business rules
│   │   ├── auth.ts            # Roles & permissions
│   │   ├── validation.ts      # Zod schemas
│   │   ├── email.ts           # Nodemailer
│   │   ├── email-templates.ts # HTML email bodies
│   │   └── notifications.ts   # Booking + reminder logic
│   └── middleware.ts          # Clerk + onboarding guard
├── tests/booking.test.ts      # Vitest
├── e2e/landing.spec.ts        # Playwright
├── scripts/                   # seed, email test, cron reminders
├── AGENTIC_EVIDENCE.md        # Hackathon agentic proof
├── CLAUDE.md                  # AI assistant project guide
└── README.md
```

---

## Demo script (judges)

1. Sign in with Clerk
2. Select **Receptionist** at onboarding
3. Register patient **PAT-004** (synthetic data)
4. Add health intake + consent
5. Book appointment → receive confirmation email (if SMTP configured)
6. Retry same doctor/date/time → blocked
7. Update status to **Completed**
8. View **Audit log** and **Dashboard**
9. Run `npm test`

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add Clerk + SMTP env vars
4. Note: file-based `store.json` resets on serverless cold starts — use external DB for production

---

## Healthcare & privacy

- Synthetic data only (`data/seed.json`)
- No diagnosis or treatment features
- Dashboard lists exclude health PHI; detail pages show intake
- Consent required on health intake form

---

## Documentation

| File | Audience |
|------|----------|
| [README.md](./README.md) | Developers & judges — setup & architecture |
| [CLAUDE.md](./CLAUDE.md) | AI assistants — codebase map & conventions |
| [AGENTIC_EVIDENCE.md](./AGENTIC_EVIDENCE.md) | Hackathon — agentic programming proof |

---

## License

MIT
