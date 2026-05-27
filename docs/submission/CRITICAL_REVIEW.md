# MediBook Clinic — Critical Review (Group 23)

Self-review of the TalentServ AI Hackathon MVP before submission. Honest assessment of quality, risks, and follow-up work.

---

## Overall assessment

MediBook Clinic meets the hackathon brief: form-based healthcare booking with third-party auth, validation, RBAC, audit, reminders, automated tests, and split Vercel deployment with persistent Postgres. The codebase is coherent for a time-boxed MVP, with clear separation between UI and API and documented env configuration.

**Submission readiness:** Strong for functional demo and documentation. Remaining gap is the **recorded demo video** (see bottom).

---

## Code quality

### Strengths

- **Centralized business logic** in backend `db.ts` — slot rules, duplicate detection, audit, reminders in one module
- **Zod validation** at API boundary with consistent error responses
- **Typed API client** in frontend reduces ad-hoc fetch duplication
- **Permission matrix** in `auth.ts` is explicit and test-covered
- **Storage adapter** abstracts Postgres vs file store without duplicating business rules
- **E2E fixtures** (`adminPage`, `patientPage`, `apiHeaders`) keep specs readable

### Weaknesses

- JSONB single-document store mixes all entities — no relational integrity at DB level
- Some UI forms use index-based locators in e2e (fragile if field order changes)
- Frontend duplicates validation awareness (server is source of truth; client hints vary)
- Legacy demo session formats still supported (`userFromLegacyStaffId`) — adds complexity

### Score: **B+** for hackathon scope

---

## Security

### Strengths

- No custom password storage — Clerk + demo session only
- API enforces RBAC on every mutating route via `requireProfile()` + `hasPermission()`
- CORS restricted to configured `FRONTEND_URL` and localhost
- Cron endpoint protected by `CRON_SECRET`
- Dashboard/upcoming widgets strip health PHI (test-enforced)
- Audit log captures actor, role, action, entity

### Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Demo login enabled in production | **Medium** | Intended for judges; must disable for real clinic use |
| Demo Bearer token is static (`demo-login-token`) | Medium | Acceptable for demo; not production-safe |
| Single JSONB row — no row-level DB ACL | Low | Application-layer filtering only |
| E2E auth bypass code in production bundle paths | Low | Gated by `E2E_TEST_MODE` env |
| No rate limiting on API | Low | Vercel default; brute-force not mitigated |
| Staff role assignments editable by Admin without re-auth | Low | Expected for admin panel demo |

### Score: **B** — appropriate for synthetic demo data; not HIPAA-ready

---

## Performance

### Strengths

- Playwright performance suite enforces baseline thresholds (8s page, 2s API GET)
- Dashboard stats computed in single store read
- Audit log capped at 500 entries
- Frontend static pages built at deploy time

### Risks

- Full store loaded/saved on every mutation — O(n) on document size
- No pagination on patient/appointment lists (fine for demo scale)
- Postgres JSONB write is single-row lock — concurrent writes could conflict
- No CDN caching strategy for API responses

### Score: **B-** — adequate for demo; would need pagination and normalized tables at scale

---

## Maintainability

### Strengths

- Two-repo split with README in each
- `.env.example` documents all required variables
- `CLAUDE.md` guides future AI/human contributors
- CI on both repos catches regressions
- Consistent ID formats (`PAT-`, `APT-`, `AUD-`, `RA-`)

### Weaknesses

- Submission docs now in `docs/submission/` but backend lacks mirror copy
- Some README drift (backend still references deprecated `ADMIN_EMAILS`)
- Monolithic `seed.json` must stay in sync with test expectations
- No OpenAPI spec for API contract

### Score: **B+**

---

## Known limitations

| Limitation | Impact |
|------------|--------|
| Synthetic data only | Cannot use with real patients |
| Demo login in production | Judges can access without Clerk; insecure for real use |
| SMS reminders simulated | Email only for real notifications |
| Manual one-time Postgres seed | New Vercel env requires `db:init` + `db:seed` |
| Role stored in JSON, not Clerk metadata | Role changes require DB update |
| Single-region Vercel + Neon | No multi-region failover |
| Cancelled slot reuse depends on status string exact match | Edge case if status enum extended |
| File storage fallback not used on Vercel production | Local dev differs from prod adapter |

---

## Tech debt (post-hackathon)

| Priority | Item | Effort |
|----------|------|--------|
| P1 | Disable demo login in production; Clerk-only | Small |
| P2 | Normalize Postgres schema (patients, appointments tables) | Large |
| P3 | OpenAPI / typed client generation | Medium |
| P4 | Pagination + search indexes | Medium |
| P5 | Clerk publicMetadata for roles | Medium |
| P6 | Remove legacy demo session code paths | Small |
| P7 | Real SMS provider integration | Medium |
| P8 | Rate limiting + request logging | Small |

---

## Post-review improvements already applied

| Finding | Fix |
|---------|-----|
| Dashboard exposed health data | Removed PHI from list widgets; Vitest assertion added |
| Cancelled slots not reusable | `isSlotTaken()` excludes Cancelled |
| Cross-origin API auth broken | JWT validated in handlers, not middleware protect |
| Reminders open to all roles | Restricted to Admin + Receptionist |
| Email logo invisible on white | Footer placement + contrast fix |
| Vercel ephemeral storage | Migrated to Neon Postgres JSONB |
| Judge Clerk sign-up friction | Demo login picker at `/login` |
| Insufficient e2e coverage | Expanded to 33 Playwright tests across UI, API, perf |

---

## Risks for judge demo

| Risk | Mitigation |
|------|------------|
| Production DB empty | Verify seed was run; rehearse on live URL |
| Demo login disabled | Confirm `NEXT_PUBLIC_DEMO_LOGIN=true` on UI Vercel project |
| CORS failure | Confirm `FRONTEND_URL` matches UI Vercel URL on API project |
| SMTP not configured | Explain simulated reminders; show reminder log in UI |
| Slow cold start | Pre-warm URL before recording video |

---

## Conclusion

MediBook Clinic is a **complete hackathon MVP** with defensible architecture, test coverage (15 Vitest + 33 Playwright), and production deployment. The main honest gaps are demo-mode security trade-offs inherent to judge access, JSONB storage scalability, and the **pending demo video recording**.

**Recommended before final submission:**

1. Record 3-part demo video (see `AGENTIC_EVIDENCE.md`)
2. Smoke-test production demo login end-to-end
3. Confirm Postgres seed data present on API deployment
4. Optional: run SMTP smoke test for live email demo
