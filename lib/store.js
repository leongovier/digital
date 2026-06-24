// Shared leads datastore — Neon Postgres (serverless HTTP driver).
// Imported by api/leads.js and the form endpoints. Lives outside /api so
// Vercel treats it as a bundled module, not a route.
import { neon } from '@neondatabase/serverless';

const CONN = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = CONN ? neon(CONN) : null;

const STAGES = ['new', 'contacted', 'quoted', 'won', 'lost'];

let schemaReady = false;
async function ensureSchema() {
  if (!sql) throw new Error('No database connection string (DATABASE_URL).');
  if (schemaReady) return;
  await sql`CREATE TABLE IF NOT EXISTS leads (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    source      TEXT NOT NULL,
    name        TEXT,
    email       TEXT,
    business    TEXT,
    summary     TEXT,
    payload     JSONB,
    stage       TEXT NOT NULL DEFAULT 'new'
  )`;
  await sql`CREATE TABLE IF NOT EXISTS lead_notes (
    id          BIGSERIAL PRIMARY KEY,
    lead_id     BIGINT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  schemaReady = true;
}

// Best-effort capture from a form submission. Never throws to the caller
// in a way that should break the email flow — wrap calls in try/catch.
export async function insertLead({ source, name, email, business, summary, payload }) {
  await ensureSchema();
  const rows = await sql`
    INSERT INTO leads (source, name, email, business, summary, payload)
    VALUES (${source}, ${name || null}, ${email || null}, ${business || null},
            ${summary || null}, ${payload ? JSON.stringify(payload) : null})
    RETURNING id`;
  return rows[0] && rows[0].id;
}

export async function listLeads() {
  await ensureSchema();
  const leads = await sql`
    SELECT id, created_at, updated_at, source, name, email, business, summary, payload, stage
    FROM leads ORDER BY created_at DESC`;
  const notes = await sql`
    SELECT id, lead_id, body, created_at FROM lead_notes ORDER BY created_at ASC`;
  const byLead = {};
  for (const n of notes) {
    (byLead[n.lead_id] = byLead[n.lead_id] || []).push({ id: n.id, body: n.body, created_at: n.created_at });
  }
  return leads.map((l) => Object.assign({}, l, { notes: byLead[l.id] || [] }));
}

export async function moveLead(id, stage) {
  if (STAGES.indexOf(stage) === -1) throw new Error('Invalid stage');
  await ensureSchema();
  await sql`UPDATE leads SET stage = ${stage}, updated_at = now() WHERE id = ${id}`;
}

export async function addNote(leadId, body) {
  await ensureSchema();
  const rows = await sql`
    INSERT INTO lead_notes (lead_id, body) VALUES (${leadId}, ${body})
    RETURNING id, lead_id, body, created_at`;
  await sql`UPDATE leads SET updated_at = now() WHERE id = ${leadId}`;
  return rows[0];
}

export { STAGES };
