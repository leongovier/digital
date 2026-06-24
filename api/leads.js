// Private leads API — list / move / note, gated by username + 8-digit PIN.
// Credentials live in env vars (LEADS_USER, LEADS_PIN) and are checked on
// every request. PIN is never trusted from the client.
import { listLeads, moveLead, addNote, STAGES } from '../lib/store.js';

const rateLimit = new Map();

function authOk(body) {
  const u = process.env.LEADS_USER;
  const p = process.env.LEADS_PIN;
  if (!u || !p) return false;
  return body.username === u && String(body.pin) === String(p);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed.' });
  }

  // Throttle to slow PIN brute-force — 20 requests / IP / minute.
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > 60000) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateLimit.set(ip, entry);
  if (entry.count > 20) {
    return res.status(429).json({ ok: false, message: 'Too many attempts — try again shortly.' });
  }

  const body = req.body || {};

  if (!authOk(body)) {
    return res.status(401).json({ ok: false, message: 'Invalid username or PIN.' });
  }

  try {
    const action = body.action;

    if (action === 'login') {
      return res.status(200).json({ ok: true });
    }
    if (action === 'list') {
      return res.status(200).json({ ok: true, leads: await listLeads() });
    }
    if (action === 'move') {
      if (STAGES.indexOf(body.stage) === -1) {
        return res.status(400).json({ ok: false, message: 'Invalid stage.' });
      }
      await moveLead(body.id, body.stage);
      return res.status(200).json({ ok: true });
    }
    if (action === 'note') {
      const text = String(body.text || '').trim();
      if (!text) return res.status(400).json({ ok: false, message: 'Note is empty.' });
      const note = await addNote(body.id, text.slice(0, 5000));
      return res.status(200).json({ ok: true, note });
    }
    return res.status(400).json({ ok: false, message: 'Unknown action.' });
  } catch (err) {
    console.error('leads api error:', err);
    return res.status(500).json({ ok: false, message: 'Server error.' });
  }
}
