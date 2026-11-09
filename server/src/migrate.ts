import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import { pool } from './db.js';

// Apply every migration in server/sql in lexical order (001_, 002_, ...).
const dir = new URL('../sql/', import.meta.url);
const files = (await readdir(dir)).filter(f => /^\d+.*\.sql$/.test(f)).sort();
for (const file of files) {
  const sql = await readFile(new URL(file, dir), 'utf8');
  await pool.query(sql);
  console.log(`Applied ${file}`);
}
console.log('CampusTrike database schema applied.');
await pool.end();
