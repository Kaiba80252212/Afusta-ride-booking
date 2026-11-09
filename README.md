# CampusTrike — AFUSTA campus mobility

CampusTrike is a browser-based campus tricycle booking and operations platform for Abdullahi Fodio University of Science and Technology, Aliero.

## Stack
- Frontend: responsive HTML, CSS and JavaScript
- API: Node.js + Express + TypeScript
- Database: Supabase PostgreSQL
- Hosting: Vercel (static frontend + Node.js API function)

## Main workflows
- Students: register/sign in, create and cancel pending bookings, review booking history.
- Drivers: register for approval, sign in after approval, accept requests, progress trips and report cash received.
- Administrators: approve/reject/suspend drivers, view operations overview, confirm reported cash payments and update fare settings.

## Quick start
1. Install dependencies from the repository root: `npm install`.
2. Copy `server/.env.example` to `server/.env` and set a PostgreSQL `DATABASE_URL` and strong `JWT_SECRET` (at least 32 characters — the API refuses to start otherwise).
3. Run `npm run db:migrate` from the root. It applies every file in `server/sql/` in order (`001_init.sql`, then `002_performance_indexes.sql`).
4. Run the API locally with `npm run dev:api`.
5. Serve the repository root with `npm run preview` (serves the frontend on port 3000 and proxies `/api/*` to the local API on port 4000) and open `http://localhost:3000`. The browser uses `/api` by default; for a separate local frontend origin set `window.CAMPUS_TRIKE_API` before `app.js` or configure the API CORS origin.

## Performance and hardening notes
- Static assets (`/assets/*`, `/styles.css`, `/app.js`) are served with explicit cache headers; HTML revalidates every load. Security headers (CSP, nosniff, frame-deny, referrer and permissions policy) are set in `vercel.json`.
- Google Fonts are loaded via `<link rel="preconnect">` + stylesheet instead of a render-blocking CSS `@import`; dark mode is applied before first paint via a tiny inline script (allow-listed in the CSP by hash).
- The booking/fare/location hot paths have dedicated PostgreSQL indexes (see `server/sql/002_performance_indexes.sql`), and fare/location reads are briefly cached in memory per instance.
- The API requires a strong `JWT_SECRET`, verifies JWTs with a pinned algorithm, equalises login timing with a dummy bcrypt compare, is transaction-safe for multi-step writes, rate-limits auth and booking creation, and refuses to act for suspended/rejected drivers even with an unexpired token.
- Icons were optimised (the 1 MB favicon PNG is now ~77 KB).

## Vercel + Supabase deployment
Follow [DEPLOYMENT_VERCEL_SUPABASE.md](DEPLOYMENT_VERCEL_SUPABASE.md). Vercel environment variables required: `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV=production`. `npm run db:migrate` applies both `server/sql/001_init.sql` and `server/sql/002_performance_indexes.sql`; the API refuses to start without a `JWT_SECRET` of at least 32 characters.

## Important
This repository is an integration-ready build, not a deployed service. No Supabase or Vercel account is connected from this workspace. Initial campus locations and ₦300 base fare are placeholders pending formal AFUSTA approval. Fare estimates currently use base fare only; per-zone pricing is not yet applied. Do not use real student data until the institution approves the service and the remaining security, privacy, backup and operational checks are complete.
