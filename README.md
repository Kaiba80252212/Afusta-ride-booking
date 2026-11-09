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
2. Copy `server/.env.example` to `server/.env` and set a PostgreSQL `DATABASE_URL` and strong `JWT_SECRET`.
3. Run `npm run db:migrate` from the root to apply the SQL schema.
4. Run the API locally with `npm run dev:api`.
5. Serve the repository root with a local static server and open the frontend. The browser uses `/api` by default; for a separate local frontend origin set `window.CAMPUS_TRIKE_API` before `app.js` or configure the API CORS origin.

## Vercel + Supabase deployment
Follow [DEPLOYMENT_VERCEL_SUPABASE.md](DEPLOYMENT_VERCEL_SUPABASE.md). Vercel environment variables required: `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV=production`.

## Important
This repository is an integration-ready build, not a deployed service. No Supabase or Vercel account is connected from this workspace. Initial campus locations and ₦300 base fare are placeholders pending formal AFUSTA approval. Fare estimates currently use base fare only; per-zone pricing is not yet applied. Do not use real student data until the institution approves the service and the remaining security, privacy, backup and operational checks are complete.
