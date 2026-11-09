# CampusTrike project status

## Current integration milestone
- Browser frontend now uses authenticated `/api` calls instead of localStorage for accounts, bookings and fares.
- Student, driver and administrator workspaces use server data; student booking/cancellation, driver acceptance/trip progression/cash reporting and admin driver approval/payment confirmation/fare management are wired to API routes.
- Express API is exposed through a Vercel Node.js Function at `api/index.ts`.
- Supabase PostgreSQL schema and seed SQL are in `server/sql/001_init.sql`.
- Added Vercel deployment configuration, root dependency manifest and `DEPLOYMENT_VERCEL_SUPABASE.md`.
- JWT is stored in sessionStorage (cleared when the browser session ends); no database credentials are embedded in frontend code.

## Performance & hardening milestone (2026-11-09)
- Frontend: Google Fonts moved from CSS `@import` to `<link>` + preconnect; ~1 MB favicon set optimised to ~77 KB PNG / 15 KB ICO (+ dedicated 180px apple-touch-icon); Open Graph/description meta; explicit width/height on icons; `:focus-visible`, skip link and `prefers-reduced-motion` support; dark mode applied before first paint; auth gate now uses `inert`/`aria-modal`; all API calls carry a 15s timeout; bootstrap data fetched in parallel; admin "recorded fares" stat now uses the server-computed `completed_fares` aggregate.
- Backend: `JWT_SECRET` validated at startup (min 32 chars, HS256 pinned); timing-equalised login (dummy bcrypt hash); fare/location reads cached in-memory with short TTL; admin overview now runs as one parallel fan-out and returns `completed_fares`; fare update is transactional and invalidates the fare cache; suspension/rejection is enforced on booking status, payment and accept routes; booking creation rate-limited; `Cache-Control: no-store` on `/api/*`; serverless-tuned pg pool (`PGPOOL_MAX`, `PG_CONNECT_TIMEOUT_MS`).
- Database: new `server/sql/002_performance_indexes.sql` (partial index for the open-pending board, status/student/created indexes, active-location and active-fare lookups, users role+status, payment status, audit entity). Migrations now apply every `server/sql/*.sql` file in order. `pgcrypto` no longer required (gen_random_uuid is core on PG 13+).
- Hosting: `vercel.json` sets CSP (inline theme bootstrap allow-listed by hash), nosniff, frame-deny, referrer/permissions policy, cache headers for assets/HTML/CSS/JS.
- Verified locally against a real PostgreSQL: full student → driver → admin lifecycle, driver approval flow, fare change propagation, rate limiting, suspended-driver enforcement, and transactional fare update.
- Added `npm run preview` (zero-dependency static server + `/api` proxy) for local end-to-end testing.

## Deployment build fix + test milestone (2026-11-09, later)
- Added `scripts/build.mjs` and pointed root `npm run build` at it: produces `dist/` (the Vercel project is configured with framework "vite" and `outputDirectory: dist`). Previously `npm run build` only built `server/dist`, so a from-this-repo deployment would have failed or served nothing.
- Added `tests/smoke.test.mjs` — 7 automated end-to-end API tests (health, auth, wrong-password rejection, booking validation, full student→driver→admin ride lifecycle with payment confirmation, fare read, unauthenticated rejection). Run with `npm test` against a running API; admin-dependent test skips when `ADMIN_EMAIL`/`ADMIN_PASSWORD` are not set.
- `npm run typecheck` runs the server TypeScript build.
- Discovered the live `campustrike.vercel.app` deployment was built from a **different, uncommitted local codebase** (a `src/`-based app with `dashboard.css` and `scripts/build.mjs`), not from this repository. The repository's `dist/` layout now matches what the Vercel project expects.

## Not yet live / outstanding
- No actual Supabase project, database password, Vercel project or deployment credentials are connected from this workspace.
- This build has not been compiled against installed dependencies or tested against a live PostgreSQL database; dependency installation timed out in this environment.
- Fare estimates currently use base fare only; per-zone fare is stored but route-zone/distance pricing is not implemented.
- Vehicle registration and approval, GPS tracking, push/SMS notifications, formal student identity verification, token revocation/refresh, automated tests, monitoring, backups and a full security review remain outstanding.
- Campus locations and ₦300 base fare are illustrative placeholders and must be confirmed by AFUSTA.

## Next actions
1. Create the Supabase project and run `server/sql/001_init.sql`.
2. Configure `DATABASE_URL`, `JWT_SECRET` and `NODE_ENV=production` in Vercel project environment variables.
3. Deploy the repository root to Vercel and verify `/api/health`.
4. Provision the first admin account securely using the deployment guide.
5. Run student/driver/admin acceptance tests and complete remaining security and institution-specific work.

Never commit `.env`, database passwords, JWT secrets or administrator credentials. Do not describe this code as live until deployment and database tests pass.
