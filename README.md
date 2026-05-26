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

Open **http://localhost:3000** → Sign in → Dashboard.

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk sign-in UI |
| `CLERK_SECRET_KEY` | Server-side Clerk (session tokens) |
| `NEXT_PUBLIC_API_URL` | Backend URL for browser |
| `API_URL` | Backend URL for server components |

Local: both API URLs → `http://localhost:3001`

## Deploy on Vercel (UI project)

1. Import this repo → new Vercel project.
2. Set environment variables:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `NEXT_PUBLIC_API_URL` | `https://your-api.vercel.app` |
| `API_URL` | Same as `NEXT_PUBLIC_API_URL` |

3. In **Clerk dashboard**, add both UI and API Vercel URLs to allowed origins.
4. Deploy the **backend first** (with Neon Postgres + seed). See backend README.

No database or SMTP on the frontend project.

## Architecture

```
Frontend (this repo)          Backend (PatientBookingAI-backend)
├── src/app/(app)/* pages     ├── src/app/api/*
├── src/components/*    ──HTTP──►  Postgres (Neon) + db.ts
└── Clerk auth UI             └── Clerk JWT verification + RBAC
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Frontend on :3000 |
| `npm run build` | Production build |
| `npm run test:e2e` | Playwright (CI pre-builds both apps) |
