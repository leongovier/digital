# Assessment-to-email tool — architecture blueprint

Background reading for the `scaffold-assessment-tool` skill. Read this when you
need to understand *why* a piece exists, or when the user wants to deviate from
the standard pattern. For the step-by-step build, see `../SKILL.md`.

## The three files

```
<slug>.html      → markup + scoped <style> (shell + empty containers the JS fills)
js/<slug>.js     → the whole interactive widget (vanilla JS, no deps)
api/<slug>.js    → one serverless function: validate → capture lead → send 2 emails
```

Data flow: visitor rates dimensions in the browser → JS computes a live
score/plan with zero server round-trips → on email submit, JS POSTs a JSON
payload to `/api/<slug>` → the function emails a branded report to the visitor
**and** a lead alert to the owner, and inserts a row in the leads DB.

The split is deliberate: all the interactive logic is client-side so it's fast,
free, and works even if the API is down (you just can't email). The server only
exists to send mail and capture the lead — and to keep the Resend API key off
the client.

## 1. The content model (`DIMS`) — the only domain-specific part

The entire tool is driven by one array at the top of the JS. Each entry:

```js
{
  id: 'problem',                                  // stable key for DOM IDs + state
  name: 'Problem definition',                     // card heading
  q:    'Can you prove this is a real problem?',   // sub-question under the heading
  what: 'Stakeholders reject business cases that…',// why this dimension matters
  fix:  'Talk to three people who experience it…', // the single next action
  proven: 'You can present a crisp problem statement…', // what a perfect score looks like
  arts: [ 'Stakeholder interviews…', 'Problem statement…' ] // evidence, weakest→strongest
}
```

Plus two parallel scales:

```js
const RATINGS = ['None', 'Weak', 'Partial', 'Strong', 'Watertight']; // index = score 0–4
const FILL_C  = [ … ]; // progress-bar colour per score
```

`arts` is ordered weakest→strongest because the coaching panel shows
`arts.slice(score)` — i.e. only the evidence you haven't yet earned. The checklist
shrinks as the user scores higher, which is what makes the coaching feel
responsive. Get the ordering right.

## 2. Client widget logic

A single IIFE that binds to empty containers in the HTML by ID. Key functions:

- **`buildCards()`** — renders one accordion card per dimension from `DIMS`, each
  with 5 rating buttons.
- **`setScore()`** — on a rating click: fills + recolours the bar, then calls
  `renderCoach()`.
- **`renderCoach()`** — the smart bit. At max score it shows a "maintain"
  message; otherwise it shows the remaining `arts`, the `fix` action, and the
  `proven` target.
- **`update()`** — live results: `pct = total / (maxScore × dimCount)`, coverage =
  dimensions scoring ≥2, weakest = lowest dimension, and a verdict band keyed off
  `pct` (default ≥80 / ≥50 / else). Rewrite the three blurbs per domain.
- **`buildPlan()`** — sorts dimensions worst-first, tags them Fix first / Fix
  next / Polish later.
- **`buildReportText()`** — assembles the plain-text version shipped in the email
  payload (and used as the email's `text` part).
- **form submit** — validates name/email, checks the honeypot, POSTs JSON to
  `/api/<slug>`, swaps the button for a success/error message.

## 3. Serverless function

A standard Vercel handler (`export default async function handler(req, res)`):

1. **Rate-limit** — in-memory `Map`, ~5 req/IP/min. Resets on cold start; enough
   for casual spam, not a security boundary.
2. **Honeypot** — a hidden `website` field; if filled, return `200` silently so
   the bot thinks it succeeded.
3. **Validate** — required fields + email regex.
4. **Capture the lead** — `insertLead({ source: '<slug>', name, email, business,
   summary, payload })`, wrapped in try/catch so a DB hiccup never blocks the
   email. Imported from `lib/store.js`.
5. **Build the branded HTML report** — `buildReportHtml()` is table-based,
   inline-styled, 600px wide, light-mode-locked (bulletproof-email markup).
6. **Dual-send via Resend** with `Promise.allSettled` — visitor report + owner
   alert sent independently so one failing doesn't kill the other. Only the
   visitor send must succeed to return success. The owner alert reuses
   `ownerLeadEmail()` from `lib/email.js`.

## 4. Shared modules (import, don't duplicate)

- **`lib/store.js`** — Neon Postgres via the serverless HTTP driver. Exports
  `insertLead`, `listLeads`, `moveLead`, `addNote`, `STAGES`. Tables auto-create
  on first query. Reads `DATABASE_URL` (fallback `POSTGRES_URL`).
- **`lib/email.js`** — branded light-mode email builders. `ownerLeadEmail({
  source, name, replyEmail, rows, message })` is the owner alert every tool uses;
  pass it the rows you want in the summary table. `esc()` lives here too.

## 5. What changes per tool vs. what's fixed

| Changes per tool | Copied verbatim |
|---|---|
| `DIMS` array | accordion build / toggle logic |
| verdict bands + copy | scoring maths (pct, coverage, weakest) |
| page `<title>`/meta/hero/`<style>` | honeypot + rate-limit |
| email subjects + `buildReportHtml` copy | `Promise.allSettled` dual-send |
| `source` slug + leads-board label | `insertLead` / `ownerLeadEmail` calls |
| `/api/<slug>` fetch path | `esc()` escaping |

## Gotchas

- **IDs are the contract** between HTML and JS. If you rename an element ID in
  the HTML, rename it in the JS too, or the widget silently no-ops.
- **Bump `?v=N`** on any changed `.js`/`.css`, or browsers serve the stale file.
- **Don't beautify the email HTML** into modern CSS — tables + inline styles are
  required for Outlook/Gmail.
- **Email + DB only work on Vercel.** Verify the widget locally; verify the
  send/capture after deploy by submitting the live form.
- **No new env vars** are needed if the tool reuses Resend + the leads DB.
