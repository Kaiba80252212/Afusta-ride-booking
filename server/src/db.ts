import pg from 'pg';
const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
// Supabase issues its own root CA. If provided, trust it explicitly so
// TLS verification (rejectUnauthorized) succeeds for the pooler/direct host.
// The value may contain literal \\n sequences (pasted from an escaped env dump) or real newlines.
const rawCa = process.env.DATABASE_CA?.replace(/\\n/g, '\n').trim();
// Serverless functions (Vercel) should hold a very small pool per instance; the long-running
// local API can use more. Both are overridable via PGPOOL_MAX.
const defaultMax = process.env.VERCEL === '1' ? 2 : 10;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? (rawCa ? { rejectUnauthorized: true, ca: rawCa } : { rejectUnauthorized: true })
    : undefined,
  max: Number(process.env.PGPOOL_MAX || defaultMax),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS || 5000),
});
