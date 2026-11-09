# CampusTrike project status

## Current integration milestone
- Browser frontend now uses authenticated `/api` calls instead of localStorage for accounts, bookings and fares.
- Student, driver and administrator workspaces use server data; student booking/cancellation, driver acceptance/trip progression/cash reporting and admin driver approval/payment confirmation/fare management are wired to API routes.
- Express API is exposed through a Vercel Node.js Function at `api/index.ts`.
- Supabase PostgreSQL schema and seed SQL are in `server/sql/001_init.sql`.
- Added Vercel deployment configuration, root dependency manifest and `DEPLOYMENT_VERCEL_SUPABASE.md`.
- JWT is stored in sessionStorage (cleared when the browser session ends); no database credentials are embedded in frontend code.

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
