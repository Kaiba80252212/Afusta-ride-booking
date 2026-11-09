import pg from 'pg';
const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
// Supabase issues its own root CA. If provided, trust it explicitly so
// TLS verification (rejectUnauthorized) succeeds for the pooler/direct host.
// The value may contain literal \\n sequences (pasted from an escaped env dump) or real newlines.
const rawCa = process.env.DATABASE_CA?.replace(/\\n/g, '\n').trim();
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? (rawCa ? { rejectUnauthorized: true, ca: rawCa } : { rejectUnauthorized: true })
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
});
