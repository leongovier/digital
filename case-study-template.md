# Case Study Template

Fill in every `[bracketed placeholder]`. The structure mirrors
[src/pages/work/template.astro](src/pages/work/template.astro) 1-to-1 —
once populated, this `.md` can be hand-translated into a new case-study page
by copying that file and swapping the content.

## How to use this with Claude

1. **Drop product screenshots** in `public/case-studies/<slug>/slider/` (named
   `01.webp`, `02.webp`, …) and one inline image per phase in
   `public/case-studies/<slug>/`.
2. **Feed Claude this template plus a brief** (notes, transcripts, links to
   the live product, a Linear ticket, whatever you've got).
3. **Ask for a populated copy** — keep section names, replace bracketed
   placeholders only.
4. **Hand the populated `.md` back** and ask Claude Code to apply it to a
   copy of `template.astro` (`src/pages/work/<slug>.astro`).

---

## Tone & constraints (KEEP IN MIND WHEN FILLING)

- Editorial, restrained, specific. Plain language.
- Each prose block: **80–120 words max**. Density hurts.
- Each prose block should contain **exactly one** `**bolded phrase**` (2–6
  words) — the section's thesis. It renders as dark text against the
  lighter body grey.
- "What I learned" lines are **one-line aphorisms**, not recaps. They should
  feel like the punchline.
- Numbers and specifics beat generalities ("7–14 days to 15 minutes" not
  "made it faster"). If you don't have a number, don't fake one.
- No AI clichés ("leveraging", "synergy", "delve", "in the realm of").
- The accent color is **orange** (`#FF6B1A`) — used sparingly for the rule
  on callouts, eyebrow labels in the meta panel, and the bullet on figures.
  Never invent a secondary brand color.

---

## 1. Meta sidebar (sticky left column)

| Field         | Value |
| ------------- | ----- |
| Project name  | `[e.g. CheckRR — short, the name as you want it shown]` |
| Project slug  | `[lowercase, no spaces, e.g. checkrr — used for folder paths and URLs]` |
| Live site URL | `[e.g. https://app.checkrr.co.uk — or "n/a" if unreleased]` |

### Metadata rows (orange uppercase label → value)

- **Summary** — `[1–2 sentence project descriptor. Captures who it's built for and the friction it removes. Read: the line that explains what this project IS at a glance. Example: "Most income-verification tools are built for underwriters. checkRR is built for the applicant uploading three months of payslips on a Tuesday lunch break — and the broker who has to chase them when they don't."]`
- **Timeline** — `[e.g. "4 weeks (solo build)" or "6 months, team of 3"]`
- **Tools** — `[comma-separated list — renders as chips. e.g. "Claude Design, Claude Code, Figma, React, Node.js, PostgreSQL"]`
- **Outcome** — `[the headline shipped result. e.g. "Production-ready SaaS platform, 3 pilot lenders, Q2 2026 launch"]`
- **Key metrics** — `[data points. e.g. "80% completion rate, 15 min average time, 99.9% time reduction"]`

### Prev / Next project

- **Prev project:** `[slug of the case study that comes before this one in the work order]`
- **Next project:** `[slug of the case study that comes after this one]`

---

## 2. Hero slider

Drop **3–8 product screenshots** in `public/case-studies/<slug>/slider/`.
Naming convention: `01.webp`, `02.webp`, `03.webp`, … (sort order matters
— the slider renders alphabetically). The page reads the folder at build
time so adding more later just works.

| Slide | Filename | Description (alt text) |
| ----- | -------- | ---------------------- |
| 1     | `01.webp` | `[what this screen shows]` |
| 2     | `02.webp` | `[…]` |
| 3     | `03.webp` | `[…]` |

Slider behaviour: 8s auto-advance, pause on hover/focus, prev/next chrome on
hover, dot pagination, lightbox on click. Respects `prefers-reduced-motion`.

---

## 3. Double Diamond — the four phases

The body of the page is a single `.tpl-phases` container holding 4 phase
pairs that sticky-stack at progressive top offsets as the reader scrolls.

Each phase follows the same shape:

```
01 ─────────── DISCOVER             ← phase head (sticky)
Understanding the problem space     ← phase title (h2)
┃ PROBLEM
┃ One-paragraph problem statement   ← left orange rule callout
[browser-chrome image]
Prose paragraph 1 (with one **bolded phrase**)
Prose paragraph 2
                          WHAT I LEARNED ┃
                  One-line aphorism here ┃ ← right orange rule callout
```

Use the **same phase names** (Discover / Define / Develop / Deliver) — the
template is locked to Double Diamond.

---

### Phase 01 — Discover

| Field | Content |
| ----- | ------- |
| Phase title | `[6–10 words, what this phase WAS about. e.g. "Understanding the problem space"]` |
| Problem callout | `[1–2 sentences. The painful reality at the start of the phase. Include one specific data point if available. e.g. "Income verification for mortgage applications takes 7–14 days, relies on email chains with blurry photos, requires manual data entry, and results in 40% customer abandonment."]` |
| Image path | `/case-studies/<slug>/[filename].png` |
| Image alt | `[describe what's shown, for accessibility + lightbox caption]` |
| Prose | `[80–120 words. The discovery story. Who you talked to, what you heard, what surprised you. Wrap ONE 2–6 word phrase in **bold** for keyword pull-out — pick the line that captures the section's thesis. e.g. **40% of customers abandon**.]` |
| What I learned | `[one sentence. The aphorism the phase taught. e.g. "The problem wasn't documents — it was friction, feedback loops, and fragmented workflows across three user groups with competing needs."]` |

---

### Phase 02 — Define

| Field | Content |
| ----- | ------- |
| Phase title | `[e.g. "Framing the solution space"]` |
| Problem callout | `[1–2 sentences. The constraint or scoping question this phase tackled.]` |
| Image path | `/case-studies/<slug>/[filename].png` |
| Image alt | `[…]` |
| Prose | `[80–120 words. The scoping decisions. What you said yes to, what you said no to, why. One **bolded phrase**.]` |
| What I learned | `[one-line aphorism]` |

---

### Phase 03 — Develop

| Field | Content |
| ----- | ------- |
| Phase title | `[e.g. "Building and iterating solutions"]` |
| Problem callout | `[1–2 sentences. The build challenge.]` |
| Image path | `/case-studies/<slug>/[filename].png` |
| Image alt | `[…]` |
| Prose | `[80–120 words. The build story. What you prototyped, what broke, who validated. One **bolded phrase** (good candidate: a loop or principle like "build, test with SMEs, refine").]` |
| What I learned | `[one-line aphorism]` |

---

### Phase 04 — Deliver

| Field | Content |
| ----- | ------- |
| Phase title | `[e.g. "Shipping and measuring impact"]` |
| Problem callout | `[1–2 sentences. The shipping / validation challenge.]` |
| Image path | `/case-studies/<slug>/[filename].png` |
| Image alt | `[…]` |
| Prose | `[80–120 words. What shipped, what the data said, what surprised you in production. One **bolded phrase**. May also use `<span class="accent">…</span>` around 2–3 short key metrics (e.g. "80%+ completion rates") to render them in orange.]` |
| What I learned | `[one-line aphorism]` |

---

## 4. Folder layout expected

```
public/case-studies/<slug>/
├── slider/
│   ├── 01.webp
│   ├── 02.webp
│   └── 03.webp        ← 3–8 product shots, browser/device mockups encouraged
├── discover-image.png ← one image per phase (optional but recommended)
├── define-image.png
├── develop-image.png
└── deliver-image.png
```

(File names are illustrative — anything goes as long as the paths match
what's in the populated `.md` and the rendered page.)

---

## 5. Things this template deliberately omits

- Executive summary section (it's now in the meta sidebar as the Summary row)
- Key learnings grid (4-category Technical / Product / Process / Impact)
- Framework reflection paragraph
- Centered page title at the top
- Floating PDF download icons
- Social share row (only the copy-link icon remains, next to the project title)

If a future project needs any of these back, add them — but the lean version
above is the locked default.
