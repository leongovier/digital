---
name: scaffold-assessment-tool
description: >-
  Scaffold a new interactive self-assessment / scorecard / readiness tool for
  the leongovier.digital site — the kind where a visitor rates themselves across
  several dimensions, sees a live score and a prioritised plan, then gets a
  branded personalised report emailed to them (plus a lead alert and a row in the
  leads DB). Use this whenever the user wants to add a tool in the style of the
  Build Cost Calculator, Value Matrix, Eval Framework, or Forward Deployment Map,
  or mentions building a scorecard, maturity model, gap analysis, readiness
  assessment, quiz-to-email, ROI/quote calculator, or any lead-capture tool on
  this site. Trigger even if they only describe the idea ("I want a tool that
  scores X and emails the result") without naming the pattern.
---

# Scaffold an assessment-to-email tool

This site has a recurring tool pattern: an **interactive self-assessment that
emails a personalised report**. There are already four of them — Build Cost
Calculator, Value Matrix, Eval Framework, and Forward Deployment Map. They all
share the same architecture. This skill helps you add another one consistently,
without reinventing the wiring each time.

The canonical reference implementation is the **Forward Deployment Map**:

- [`fde-map.html`](../../../fde-map.html) — page shell + scoped `<style>` + empty containers
- [`js/fde-map.js`](../../../js/fde-map.js) — the whole interactive widget (vanilla JS, no deps)
- [`api/fde-map.js`](../../../api/fde-map.js) — one serverless function: validate → capture lead → send 2 emails

Treat those three files as the template. **Read them first** — you copy them and
adapt, rather than writing from scratch. The shared plumbing lives in
[`lib/store.js`](../../../lib/store.js) (Neon lead capture) and
[`lib/email.js`](../../../lib/email.js) (branded owner-alert email). Don't
duplicate those — import them.

For a deeper explanation of *why* each piece exists, read
[`references/blueprint.md`](references/blueprint.md). Read it if the user wants
to deviate from the pattern or you're unsure how a piece works.

## The core idea

**Almost everything is generic plumbing you copy verbatim. The only
domain-specific part is one config array** (`DIMS` in the JS) that describes the
dimensions being assessed. Get that array right and the widget, the scoring, the
coaching, the plan, and the email report all fall out of it. Spend your effort
there; copy the rest.

All scoring happens **client-side** for instant feedback. The serverless
function only runs when the user submits their email to receive the report — that
email gate is the lead-capture mechanism. The Resend API key never touches the
browser.

## Step 1 — Gather the spec

Before writing anything, settle these with the user. Propose sensible defaults
from the reference tool rather than asking open-endedly.

1. **Slug + name.** A URL slug (e.g. `team-readiness`) → produces
   `team-readiness.html`, `js/team-readiness.js`, `api/team-readiness.js`, all
   posting to `/api/team-readiness`. And a display name (e.g. "AI Team Readiness
   Scorer"). Keep the slug short and filesystem-safe.
2. **The dimensions** — the heart of it. 4–6 is the sweet spot (the reference
   uses 5). For each dimension collect: a short `name`, a one-line probing
   `question`, a `what`-it-means paragraph, the single most useful `fix` action,
   a `proven` paragraph describing what a perfect score looks like, and an
   `arts` list (3–5 concrete pieces of evidence, ordered weakest→strongest).
   The `arts` list powers the shrinking coaching checklist, so order matters.
   If the user only has rough ideas, draft the array and have them react — it's
   faster to edit than to specify cold.
3. **The rating scale.** Default to the 5-point `None / Weak / Partial / Strong /
   Watertight` (scores 0–4). Only change the labels if the domain demands it;
   keep it 5 points so the scoring maths and colours carry over unchanged.
4. **Verdict bands + copy.** Three bands keyed off the percentage score
   (default ≥80 / ≥50 / else). Rewrite the three verdict blurbs for the domain.
5. **Lead capture?** Default yes — it's one `insertLead({ source: '<slug>', … })`
   call. The leads board ([`leads.html`](../../../leads.html)) shows a source
   chip; add the slug→label mapping in [`js/leads.js`](../../../js/leads.js)
   (`SOURCE_LABEL`). Skip only if the user explicitly wants email-only.
6. **Nav placement.** Should it join the **Tools** mega-menu (a new column across
   all 10 page files) and/or get a `<li>` somewhere? Confirm — adding a column is
   a real edit repeated across every page. See "Wiring into the site" below.

## Step 2 — Copy and adapt the three files

Copy the reference files to the new slug, then work through them:

- **`<slug>.html`** — duplicate `fde-map.html`. Update `<title>`, meta/OG/Twitter,
  `<link rel="canonical">`, the hero copy, and the page-specific `<style>` block.
  Keep the `bc-`/widget class names and element **IDs** unless you also rename
  them in the JS — the JS binds to them by ID. Bump the `?v=N` query on the JS
  `<script>` so the new file isn't cache-shadowed.
- **`js/<slug>.js`** — duplicate `js/fde-map.js`. Replace the `DIMS` array with
  the spec from Step 1. Adjust the verdict bands/copy in `update()`. Point the
  `fetch()` at `/api/<slug>`. Everything else (accordion build, scoring,
  coaching, plan, plain-text report builder, honeypot) is generic — leave it.
- **`api/<slug>.js`** — duplicate `api/fde-map.js`. It already imports
  `insertLead` and `ownerLeadEmail`. Update: the `source` slug in `insertLead`,
  the subject lines, the `buildReportHtml` copy (headings, CTA blurb, footer),
  and the field names destructured from `req.body` to match what the JS sends.
  Keep the rate-limit, honeypot, validation, and `Promise.allSettled` dual-send
  exactly as they are.

## Step 3 — Wiring into the site

- **Nav / Tools mega-menu.** Each page file has a Tools dropdown built from
  `nav-mega-col` blocks. To list the new tool, add a matching column to the
  dropdown in **all 10 page files** (`*.html`). Use a script that matches the
  existing column markup so every page stays identical — see how prior renames
  were done (one Python pass over the glob, asserting the anchor count per file).
- **Leads board label.** If capturing leads, add `'<slug>': '<Short Label>'` to
  `SOURCE_LABEL` in [`js/leads.js`](../../../js/leads.js) and bump its `?v=N`.
- **Cache-busting.** Any changed `.js`/`.css` referenced with `?v=N` must have
  N bumped, or browsers serve the stale file. HTML is fetched fresh, so its own
  filename needs no version.

## Step 4 — Env, verify, deploy

- **Env vars (already set on Vercel, reused — don't recreate):**
  `RESEND_API_KEY` (Resend, needs a verified sending domain),
  `DATABASE_URL` / `POSTGRES_URL` (Neon), `LEADS_USER` / `LEADS_PIN`.
  A brand-new tool needs **no new env vars** if it reuses Resend + the leads DB.
- **Verify locally before deploy.** The widget (cards, scoring, plan, validation)
  runs fully on `npx serve .` / the preview server — test it there. The email
  send and lead capture only work on Vercel (Resend + Neon aren't reachable
  locally), so verify those after deploy by submitting the live form. Don't
  claim the email path works from a local check.
- **Deploy is `git push origin main`** — Vercel auto-deploys. Never run
  `vercel --prod`. Do not stage untracked `images/anything-medical/*` files.

## Conventions that matter

- **No build step, no framework.** Plain static HTML/CSS/JS + Vercel serverless
  functions. Keep it that way — don't introduce bundlers or npm UI deps.
- **Email HTML is table-based with inline styles, locked to light mode.** That
  ugliness is required for Outlook/Gmail. Don't "modernise" `buildReportHtml`
  into flexbox/grid — it will break in real inboxes.
- **`esc()` everything user-supplied** in both the JS and the API before it lands
  in HTML. The helper already exists in both files.
- **Honeypot + in-memory rate-limit is the whole spam defence** — lightweight by
  design. If a tool gets heavy traffic, mention a stronger check; don't silently
  rely on these alone.
- **Brand tokens** live in `css/styles.css :root` (`--color-accent: #FF9900`,
  Poppins/Montserrat). Semantic colours used in the widgets: green `#1d9e75`,
  blue `#378add`, amber `#ef9f27`, red `#e24b4a`. Reuse them; don't invent new
  hex values per tool.

## A good result

When you're done the user can open `<slug>.html` locally, rate the dimensions,
watch the score/plan update live, and submit the form; after deploy, submitting
emails a branded report and the lead shows on the board with its source chip —
matching the look and behaviour of the existing four tools without any new
infrastructure.
