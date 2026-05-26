# MediBook Clinic — Frontend (UI)

Next.js UI for MediBook Clinic. All data flows through the **separate backend API** at `NEXT_PUBLIC_API_URL`.

## Quick start (local)

Run **both** projects:

```bash
# Terminal 1 — backend (port 3001)
cd ../PatientBookingAI-backend
npm install && npm run db:seed && npm run dev

# Terminal 2 — frontend (port 3000)
cd PatientBookingAI
npm install
cp .env.example .env.local   # add Clerk keys + API URLs
npm run dev
```

Open **http://localhost:3000** → Sign in → Onboarding → Dashboard.

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk sign-in UI |
| `CLERK_SECRET_KEY` | Server-side Clerk (session tokens) |
| `NEXT_PUBLIC_API_URL` | Backend URL for browser (`http://localhost:3001`) |
| `API_URL` | Backend URL for server components (same locally) |

## Architecture

```
Frontend (this repo)          Backend (PatientBookingAI-backend)
├── src/app/(app)/* pages     ├── src/app/api/*
├── src/components/*    ──HTTP──►  src/lib/db.ts, email, Redis
└── Clerk auth UI             └── Clerk JWT verification + RBAC
```

## Deploy (Vercel)

Create a **UI-only** Vercel project from this repo:

1. Env: Clerk keys + `NEXT_PUBLIC_API_URL` + `API_URL` → your backend Vercel URL
2. No Redis/SMTP needed on frontend

Backend deploy: see `PatientBookingAI-backend/README.md`.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Frontend on :3000 |
| `npm run build` | Production build |
| `npm run test:e2e` | Playwright (requires both apps running) |
