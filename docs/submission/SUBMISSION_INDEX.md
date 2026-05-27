# MediBook Clinic — Submission Index (Group 23)

Master checklist for the TalentServ AI Hackathon submission. **Group 23 — MediBook Clinic.**

---

## Quick links

| Resource | URL / path |
|----------|------------|
| **Production UI** | https://talentserv-ai-hackathon-group-23-ui-devinaraina22s-projects.vercel.app |
| **Production API** | https://talentserv-ai-hackathon-group-23-ba.vercel.app |
| **UI GitHub** | https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-UI |
| **API GitHub** | https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-backend |
| **UI branch** | `cursor/medibook-hackathon-mvp` |
| **API branch** | `main` (deployed from `api-only` remote branch) |

---

## Submission checklist

| # | Required item | Location | Status |
|---|---------------|----------|--------|
| 1 | GitHub repository (UI) | [talentserv-ai-hackathon-group-23-UI](https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-UI) | ✅ |
| 2 | GitHub repository (API) | [talentserv-ai-hackathon-group-23-backend](https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-backend) | ✅ |
| 3 | Deployed application (UI) | [Production UI](https://talentserv-ai-hackathon-group-23-ui-devinaraina22s-projects.vercel.app) | ✅ |
| 4 | Deployed API | [Production API](https://talentserv-ai-hackathon-group-23-ba.vercel.app) | ✅ |
| 5 | Setup / run instructions | [README.md](../../README.md) | ✅ |
| 6 | Groomed requirements | [REQUIREMENTS.md](./REQUIREMENTS.md) | ✅ |
| 7 | Solution / implementation plan | [SOLUTION_PLAN.md](./SOLUTION_PLAN.md) | ✅ |
| 8 | Architecture documentation | [ARCHITECTURE.md](./ARCHITECTURE.md) | ✅ |
| 9 | Test plan + evidence | [TEST_PLAN.md](./TEST_PLAN.md) | ✅ |
| 10 | Critical self-review | [CRITICAL_REVIEW.md](./CRITICAL_REVIEW.md) | ✅ |
| 11 | Agentic programming evidence | [AGENTIC_EVIDENCE.md](../../AGENTIC_EVIDENCE.md) | ✅ |
| 12 | AI assistant guide | [CLAUDE.md](../../CLAUDE.md) | ✅ |
| 13 | Environment variable reference | `.env.example` (both repos) | ✅ |
| 14 | Sample / seed data | `PatientBookingAI-backend/data/seed.json` | ✅ |
| 15 | Unit tests (15 passing) | `PatientBookingAI-backend/tests/booking.test.ts` | ✅ |
| 16 | E2E tests (33 passing) | `PatientBookingAI/e2e/*.spec.ts` | ✅ |
| 17 | CI/CD pipelines | `.github/workflows/ci.yml` (both repos) | ✅ |
| 18 | Third-party auth (Clerk) | Clerk dashboard + middleware | ✅ |
| 19 | Demo login for judges | `/login` when `NEXT_PUBLIC_DEMO_LOGIN=true` | ✅ |
| 20 | Demo video (3 sections) | *Team to record* | ⬜ **Pending** |

---

## Documentation map

```
PatientBookingAI/
├── README.md                          ← Quick start + Hackathon Submission section
├── AGENTIC_EVIDENCE.md                ← Agentic workflow + demo video outline
├── CLAUDE.md                          ← AI assistant project guide
└── docs/submission/
    ├── SUBMISSION_INDEX.md            ← This file (master checklist)
    ├── REQUIREMENTS.md                ← User stories + acceptance criteria
    ├── SOLUTION_PLAN.md               ← Phases + module map
    ├── ARCHITECTURE.md                ← System design + diagrams
    ├── TEST_PLAN.md                   ← 15 Vitest + 33 Playwright cases
    └── CRITICAL_REVIEW.md             ← Self-review + risks
```

---

## Local setup commands

### Backend (port 3001)

```bash
git clone https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-backend.git
cd talentserv-ai-hackathon-group-23-backend
npm install
cp .env.example .env.local    # Add Clerk keys
npm run db:seed               # Seeds data/store.json locally
npm run dev                   # http://localhost:3001
```

### Frontend (port 3000)

```bash
git clone https://github.com/devinaraina22/talentserv-ai-hackathon-group-23-UI.git
cd talentserv-ai-hackathon-group-23-UI
git checkout cursor/medibook-hackathon-mvp
npm install
cp .env.example .env.local    # Clerk keys + API URLs
npm run dev                   # http://localhost:3000
```

Open **http://localhost:3000** → `/login` → demo picker or Clerk sign-in.

---

## Production setup (one-time)

After linking Neon Postgres on the API Vercel project:

```bash
# With DATABASE_URL from Vercel → Storage → Neon
npm run db:init
npm run db:seed
```

---

## Environment variables summary

### Frontend Vercel project

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | `pk_test_...` |
| `CLERK_SECRET_KEY` | Yes | `sk_test_...` |
| `NEXT_PUBLIC_API_URL` | Yes | `https://talentserv-ai-hackathon-group-23-ba.vercel.app` |
| `API_URL` | Yes | Same as above |
| `NEXT_PUBLIC_DEMO_LOGIN` | Demo | `true` |

### Backend Vercel project

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Auto from Neon integration |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Same Clerk app as UI |
| `CLERK_SECRET_KEY` | Yes | Same Clerk app as UI |
| `FRONTEND_URL` | Yes | `https://talentserv-ai-hackathon-group-23-ui-devinaraina22s-projects.vercel.app` |
| `DEMO_LOGIN` | Demo | `true` |
| `CRON_SECRET` | Yes | Random secret string |
| `SMTP_HOST` | Optional | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | `587` |
| `SMTP_SECURE` | Optional | `false` |
| `SMTP_USER` | Optional | Gmail address |
| `SMTP_PASS` | Optional | App password |
| `SMTP_FROM` | Optional | `MediBook Clinic <email>` |

---

## Test commands

| Command | Repo | Purpose |
|---------|------|---------|
| `npm test` | Backend | 15 Vitest tests |
| `npm run test:e2e` | Frontend | 33 Playwright tests |
| `npm run email:test you@x.com` | Backend | SMTP smoke test |
| `npm run reminders:due` | Backend | Manual day-before job |

---

## Demo video outline (team action required)

Record ~5 minutes in **three sections** (see [AGENTIC_EVIDENCE.md](../../AGENTIC_EVIDENCE.md)):

1. **Intro & methodology** — Group 23, agentic workflow, architecture overview
2. **App demo** — Demo login → register patient → health intake → book → receipt → audit → reminders
3. **Wrap-up** — Tests (`npm test`, 33 e2e), CI, known limitations, repo links

---

## Hackathon requirement traceability

| Requirement | Evidence |
|-------------|----------|
| Third-party auth | Clerk + [ARCHITECTURE.md](./ARCHITECTURE.md) § Authentication |
| Patient registration | [REQUIREMENTS.md](./REQUIREMENTS.md) US-05–08, Vitest V1–V4 |
| Health intake | US-07, Vitest V5–V6, E2E E06/E14–E15 |
| Appointment booking | US-09–12, Vitest V9–V12, E2E E07/E22 |
| Role-based access | US-01–04, E2E E09–E10/E19/E23/E25 |
| Audit | US-16, Vitest V13, E2E E08/E26 |
| Reminders | US-15–17, Vitest V14, cron in ARCHITECTURE |
| Tests | [TEST_PLAN.md](./TEST_PLAN.md) — 15 + 33 |
| Deployment | URLs above + CI workflows |
| Agentic evidence | [AGENTIC_EVIDENCE.md](../../AGENTIC_EVIDENCE.md) |

---

## Remaining gaps (team)

| Gap | Owner | Priority |
|-----|-------|----------|
| Record and upload demo video | Group | **High** |
| Verify production Postgres seeded | Group | High |
| Rehearse live demo on production URL | Group | Medium |
| Optional SMTP live email in demo | Group | Low |
| Sync backend README (remove deprecated ADMIN_EMAILS note) | Group | Low |
