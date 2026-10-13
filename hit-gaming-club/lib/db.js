// lib/db.js - database helper (Neon Postgres). Uses DATABASE_URL (or POSTGRES_URL) set in Vercel.
const { neon } = require('@neondatabase/serverless');

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

function hasDb() {
  return Boolean(url);
}

let ready = null;
function getSql() {
  const sql = neon(url);
  if (!ready) {
    ready = sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        purpose VARCHAR(10) NOT NULL,
        fullname VARCHAR(100) NOT NULL,
        regnumber VARCHAR(20) NOT NULL,
        program VARCHAR(80) NOT NULL,
        email VARCHAR(120) NOT NULL,
        phone VARCHAR(20),
        games VARCHAR(255),
        message TEXT,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      )`.catch((e) => { ready = null; throw e; });
  }
  return { sql, ready };
}

async function insertSubmission(d) {
  const { sql, ready } = getSql();
  await ready;
  await sql`
    INSERT INTO submissions (purpose, fullname, regnumber, program, email, phone, games, message)
    VALUES (${d.purpose}, ${d.fullname}, ${d.regnumber}, ${d.program}, ${d.email}, ${d.phone}, ${d.games}, ${d.message})`;
}

async function listSubmissions() {
  const { sql, ready } = getSql();
  await ready;
  return sql`
    SELECT submitted_at, purpose, fullname, regnumber, program, email, phone, games, message
    FROM submissions ORDER BY id DESC LIMIT 500`;
}

module.exports = { hasDb, insertSubmission, listSubmissions };
