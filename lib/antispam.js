// Shared spam guard for the public form endpoints (contact + the four
// lead tools). Imported by every /api handler that accepts a public POST.
//
// Nothing here calls out to a third party unless Turnstile is configured,
// so it adds no latency and no cost. The guard is deliberately layered:
// a single signal rarely blocks anything, but real bot traffic trips
// several at once.
//
// Verdicts:
//   pass   — deliver normally
//   review — deliver, but flag it (owner email + leads board get a marker)
//   block  — drop silently; the caller still returns a success response so
//            the bot learns nothing and doesn't start probing
//
// Kill switch: set SPAM_GUARD=off to log verdicts without acting on them.

const BLOCK_AT = 7;
const REVIEW_AT = 4;

const CANONICAL_ORIGIN = 'https://leongovier.digital';

const ALLOWED_HOSTS = [
  'leongovier.digital',
  'www.leongovier.digital',
  'leongovier.com',
  'www.leongovier.com',
  'localhost',
  '127.0.0.1',
];

// Vercel preview deployments.
const ALLOWED_HOST_SUFFIXES = ['.vercel.app'];

// Free-mail domains that exist only to receive one message and vanish.
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com',
  'yopmail.com', 'yopmail.net', '10minutemail.com', '10minutemail.net',
  'tempmail.com', 'temp-mail.org', 'tempmailo.com', 'throwawaymail.com',
  'trashmail.com', 'trashmail.de', 'getnada.com', 'dispostable.com',
  'maildrop.cc', 'fakeinbox.com', 'mailnesia.com', 'mytemp.email',
  'emailondeck.com', 'moakt.com', 'tempr.email', 'spamgourmet.com',
  'grr.la', 'spam4.me', 'mailcatch.com', 'inboxbear.com', 'byom.de',
  'discard.email', 'mailbox52.ga', 'mohmal.com', 'harakirimail.com',
];

// Phrases that belong to bulk outreach / SEO / crypto spam, not to anyone
// asking about a design engagement.
const SPAM_PHRASES = [
  'seo service', 'seo services', 'search engine optimi', 'backlink', 'back link',
  'link building', 'guest post', 'guest posting', 'domain authority',
  'increase your traffic', 'rank your website', 'first page of google',
  'web design service', 'app development company', 'offshore development',
  'dedicated developers', 'hire our team', 'outsourcing company',
  'crypto', 'bitcoin', 'forex', 'binary option', 'casino', 'betting',
  'viagra', 'cialis', 'porn', 'escort', 'loan offer', 'make money online',
  'work from home', 'investment opportunity', 'bulk email', 'email list',
  'telegram me', 'whatsapp me', 'click here to unsubscribe',
];

// ---------------------------------------------------------------------------
// Origin / referer
// ---------------------------------------------------------------------------

function extraAllowedHosts() {
  return String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => { try { return new URL(s).hostname; } catch (_) { return s.replace(/^https?:\/\//, '').split('/')[0]; } });
}

function hostAllowed(host) {
  if (!host) return false;
  const h = host.toLowerCase().split(':')[0];
  if (ALLOWED_HOSTS.indexOf(h) !== -1) return true;
  if (extraAllowedHosts().indexOf(h) !== -1) return true;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => h.endsWith(suffix));
}

function hostOf(value) {
  if (!value) return null;
  try { return new URL(value).hostname; } catch (_) { return null; }
}

// 'ok' — came from one of our pages
// 'bad' — came from somewhere else entirely (cross-site post)
// 'missing' — no Origin and no Referer, which a real browser form submit
//             effectively never does on a POST
export function originVerdict(req) {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'] || req.headers['referrer'];
  if (origin && origin !== 'null') return hostAllowed(hostOf(origin)) ? 'ok' : 'bad';
  if (referer) return hostAllowed(hostOf(referer)) ? 'ok' : 'bad';
  return 'missing';
}

// Echo back the caller's origin when we recognise it, instead of the old
// blanket '*'. Call this on both the preflight and the real request.
export function applyCors(req, res) {
  const origin = req.headers['origin'];
  const allow = origin && hostAllowed(hostOf(origin)) ? origin : CANONICAL_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ---------------------------------------------------------------------------
// Gibberish detection
//
// This is what catches the keyboard-mash submissions ("lecbzxc lcdhvkddi",
// "BzgzDGcZxdwlWvEzs"). y and w count as vowels so Welsh and Slavic names
// don't get caught in the net, and short tokens are skipped entirely so
// acronyms (KYC, AML, FCA) are always safe.
// ---------------------------------------------------------------------------

const URL_RE = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|ru|cn|xyz|top|info|biz|shop|online|site|club|icu)\b/gi;

const VOWEL_RE = /[aeiouyw]/g;
const VOWEL_SPLIT = /[aeiouyw]/;

// 0 = looks like language, 1 = odd, 2 = almost certainly mashed
function tokenGibberish(token) {
  const letters = token.replace(/[^A-Za-z]/g, '');
  if (letters.length < 6) return 0;
  const lower = letters.toLowerCase();

  let signals = 0;

  const vowels = (lower.match(VOWEL_RE) || []).length;
  if (vowels / lower.length < 0.18) signals++;

  const runs = lower.split(VOWEL_SPLIT).map((s) => s.length);
  if (Math.max.apply(null, runs) >= 5) signals++;

  // hUnTeD case, e.g. "BzgzDGcZxdwlWvEzs"
  if (letters.length >= 8) {
    let flips = 0;
    for (let i = 1; i < letters.length; i++) {
      if (/[a-z]/.test(letters[i - 1]) && /[A-Z]/.test(letters[i])) flips++;
    }
    if (flips >= 3) signals++;
  }

  return signals >= 2 ? 2 : (signals === 1 ? 1 : 0);
}

export function gibberishScore(value) {
  // URLs are scored separately — don't let a domain read as a keyboard mash.
  const str = String(value == null ? '' : value).replace(URL_RE, ' ').trim();
  if (!str) return 0;
  const tokens = str.split(/\s+/).filter((t) => t.replace(/[^A-Za-z]/g, '').length >= 6);
  if (!tokens.length) return 0;

  const strengths = tokens.map(tokenGibberish);
  const bad = strengths.filter((s) => s > 0).length;
  if (!bad) return 0;
  if (strengths.some((s) => s === 2)) return 4;   // at least one clear mash
  if (bad === tokens.length) return 2;            // everything is merely odd
  return 1;
}

// ---------------------------------------------------------------------------
// Other content checks
// ---------------------------------------------------------------------------

function countUrls(value) {
  const m = String(value == null ? '' : value).match(URL_RE);
  return m ? m.length : 0;
}

function hasSpamPhrase(value) {
  const s = String(value == null ? '' : value).toLowerCase();
  return SPAM_PHRASES.some((p) => s.indexOf(p) !== -1);
}

// Cyrillic, Greek, CJK, Arabic, Hebrew in a field we only ever expect in
// Latin script. Mild on its own — plenty of real names carry accents, which
// stay in the Latin ranges and aren't matched here.
const NON_LATIN_RE = /[Ѐ-ӿͰ-Ͽ一-鿿぀-ヿ؀-ۿ֐-׿]/;

function disposableEmail(email) {
  const domain = String(email || '').split('@')[1];
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.indexOf(domain.toLowerCase()) !== -1;
}

// ---------------------------------------------------------------------------
// Duplicate suppression — same payload replayed within the window.
// In-memory, so it only sees one Vercel instance's traffic; treat it as a
// bonus signal rather than the main defence.
// ---------------------------------------------------------------------------

const recent = new Map();
const DUPLICATE_WINDOW = 10 * 60 * 1000;

function fingerprint(source, fields) {
  const basis = [source, fields.email, fields.name, fields.business, fields.message]
    .map((v) => String(v == null ? '' : v).trim().toLowerCase())
    .join('|');
  let hash = 5381;
  for (let i = 0; i < basis.length; i++) hash = ((hash * 33) ^ basis.charCodeAt(i)) >>> 0;
  return String(hash);
}

function seenRecently(key) {
  const now = Date.now();
  for (const [k, t] of recent) if (now - t > DUPLICATE_WINDOW) recent.delete(k);
  const hit = recent.has(key);
  recent.set(key, now);
  return hit;
}

// ---------------------------------------------------------------------------
// Rate limiting — shared so every endpoint uses the same window.
// ---------------------------------------------------------------------------

const rateBuckets = new Map();

export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

export function rateLimited(req, { max = 5, windowMs = 60_000 } = {}) {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = rateBuckets.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateBuckets.set(ip, entry);
  return entry.count > max;
}

// ---------------------------------------------------------------------------
// Cloudflare Turnstile — optional. Inert until TURNSTILE_SECRET_KEY is set
// (and the matching site key is added to the pages); see README.
// ---------------------------------------------------------------------------

export function turnstileEnabled() {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

async function verifyTurnstile(token, ip) {
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    // Never lock the form out because Cloudflare had a bad minute.
    console.error('[spam] turnstile verification error:', err);
    return true;
  }
}

// ---------------------------------------------------------------------------
// The guard
// ---------------------------------------------------------------------------

/**
 * @param {object}   opts
 * @param {object}   opts.req      the Vercel request
 * @param {string}   opts.source   endpoint name, for logging
 * @param {object}   opts.body     the parsed request body
 * @param {object}   opts.fields   { name, email, business, message } — the
 *                                 human-written values worth inspecting
 * @returns {Promise<{verdict:'pass'|'review'|'block', score:number, reasons:string[], flagged:boolean}>}
 */
export async function inspect({ req, source, body, fields }) {
  const b = body || {};
  const f = fields || {};
  const reasons = [];
  let score = 0;
  const add = (points, reason) => { score += points; reasons.push(reason + ' (+' + points + ')'); };

  const hard = (reason) => ({
    verdict: 'block', score: 99, reasons: reasons.concat([reason]), flagged: true,
  });

  // --- hard stops ---------------------------------------------------------

  // Honeypots: the original hidden field plus the one formguard.js injects.
  if (b.website || b.company_url) return hard('honeypot filled');

  const origin = originVerdict(req);
  if (origin === 'bad') return hard('request came from another site');

  if (turnstileEnabled()) {
    const ok = await verifyTurnstile(b['cf-turnstile-response'] || b.turnstile_token, clientIp(req));
    if (!ok) return hard('turnstile verification failed');
  }

  // --- scored signals -----------------------------------------------------

  if (origin === 'missing') add(4, 'no origin or referer header');

  // Timing + interaction, stamped by js/formguard.js.
  const dt = Number(b._dt);
  if (!Number.isFinite(dt)) {
    add(3, 'no form timing field');
  } else if (dt < 2000) {
    add(4, 'form submitted in ' + dt + 'ms');
  } else if (dt < 5000) {
    add(2, 'form submitted in ' + dt + 'ms');
  }

  const hv = Number(b._hv);
  if (Number.isFinite(hv) && hv === 0) add(4, 'no keyboard or pointer input recorded');

  // Keyboard-mash text.
  const nameGib = gibberishScore(f.name);
  if (nameGib) add(nameGib, 'name looks like gibberish');
  const bizGib = gibberishScore(f.business);
  if (bizGib) add(bizGib, 'business/initiative looks like gibberish');
  const msgGib = gibberishScore(f.message);
  if (msgGib) add(msgGib, 'message looks like gibberish');

  // Links where a link is never wanted.
  if (countUrls(f.name) || countUrls(f.business)) add(5, 'link in a name field');
  if (countUrls(f.message) > 2) add(3, 'multiple links in the message');

  // Bulk-outreach vocabulary.
  if (hasSpamPhrase(f.message) || hasSpamPhrase(f.name) || hasSpamPhrase(f.business)) {
    add(4, 'known spam phrasing');
  }

  // Throwaway inbox.
  if (disposableEmail(f.email)) add(4, 'disposable email domain');

  // Unexpected script in a Latin-only field.
  if (NON_LATIN_RE.test(String(f.name || '')) || NON_LATIN_RE.test(String(f.business || ''))) {
    add(2, 'non-Latin script in a name field');
  }

  // Same submission again, moments later.
  if (seenRecently(fingerprint(source, f))) add(4, 'duplicate of a recent submission');

  const verdict = score >= BLOCK_AT ? 'block' : (score >= REVIEW_AT ? 'review' : 'pass');
  return { verdict, score, reasons, flagged: verdict !== 'pass' };
}

// Logs the verdict and tells the caller whether to stop. Honours the
// SPAM_GUARD=off kill switch: verdicts are still logged, nothing is dropped.
export function shouldBlock(result, source, fields) {
  if (result.verdict !== 'block') {
    if (result.verdict === 'review') {
      console.warn('[spam] flagged for review', { source, score: result.score, reasons: result.reasons, email: fields && fields.email });
    }
    return false;
  }
  console.warn('[spam] blocked', {
    source,
    score: result.score,
    reasons: result.reasons,
    email: fields && fields.email,
    name: fields && fields.name,
  });
  if (String(process.env.SPAM_GUARD || '').toLowerCase() === 'off') {
    console.warn('[spam] SPAM_GUARD=off — delivering anyway');
    return false;
  }
  return true;
}

// Marker prefixed onto the owner email subject and the leads-board summary
// for review-band submissions, so a borderline real lead is still visible.
export function reviewMarker(result) {
  return result.verdict === 'review' ? '[possible spam] ' : '';
}
