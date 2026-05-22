# Portfolio v2 — Project Instructions

**Leon Govier's personal portfolio.** A single-page home plus per-project
case-study detail pages. Built with **Astro**, output `static`.

## Build & deploy

- `npm run dev` — local dev server (port 4321)
- `npm run build` — static build → `dist/`
- `npm run typecheck` — `astro check`
- **Deploy:** Vercel is **not** connected to git auto-deploy. Pushing to
  GitHub saves the work but does **not** deploy. Ship with `vercel --prod`
  (production domain: `https://portfolio.leongovier.com`).

## Architecture

Two distinct surfaces, each self-contained:

**Home** — `src/pages/index.astro`
- A **standalone Astro page** — its own `<!doctype>`/`<head>`, does **not**
  use `BaseLayout`. All content lives in typed arrays in the frontmatter.
- Styles: `src/styles/home.css` · Behaviour: `src/scripts/home.ts`

**Case-study detail pages** — `src/pages/work/<slug>.astro` (9 pages)
- Slugs: `adaptive-crm`, `astra`, `checkrr`, `coincover`, `cubik-ai`,
  `cubik-crm`, `cwt`, `jamf-etp`, `polaris-calculator-suite`.
- Each is a standalone `.astro` page using `BaseLayout`. They are one
  template — shared `tpl-` classes.
- **Shared styles: `src/styles/work-detail.css`** — every detail page imports
  it. Edit detail-page CSS here once, not in nine files. (`cubik-ai.astro`
  keeps a tiny inline `<style>` override for contained figures.)
- Layout/tokens: `src/layouts/BaseLayout.astro`, `src/styles/global.css`,
  `src/styles/tokens.css`. Lightbox: `src/scripts/lightbox.ts` + `lightbox.css`.

**Shared components** — `src/components/`
- `Nav.astro` — the glass-pill nav (detail pages; the home page has its own
  inline nav with the same markup).
- `Footer.astro`
- `Brand.astro` — the `lpg.` wordmark with the typewriter hover swap. Used by
  both navs.

> Two token layers exist: `home.css :root` (`--ember`, `--fg`, …) drives the
> home page; `tokens.css :root` (`--accent`, `--text-primary`, …) drives the
> detail pages. **The values are the v2 palette in both** — only the names
> differ. Don't unify them casually.

## Direction

- **Tone:** restrained, editorial, generous whitespace. Product Designer &
  Builder positioning. Audience: hiring managers, founders, collaborators.
- **Structure:** single-page home → dedicated detail page per project.
- **Surface:** all-white canvas. Glass-morphism cards. A fixed layer of
  animated pastel "squircle" shapes drifts behind the home page.

## Design tokens (v2 — `src/styles/home.css :root`)

```css
/* Surfaces */
--bone:   #ffffff;   --bone-2: #f6f6f6;
--ink:    #0a0a0a;   --ink-2:  #141414;

/* Text */
--fg:      #1a1d26;  --fg-soft: #4b525e;  --fg-mute: #828892;
--hairline: rgba(14,18,25,0.08);  --hairline-strong: rgba(14,18,25,0.16);

/* Accent — ember orange (the ONLY accent) */
--ember:      #f5a623;
--ember-soft: #ffb84f;

/* Pastels — used only by the background shape layer */
--mint: #b6ecd5;  --p-sky: #c8ecfb;  --lilac: #e2d3fb;  --peach: #fbd9cf;

/* Glass */
--glass-bg: rgba(255,255,255,0.55);  --glass-bd: rgba(255,255,255,0.7);

/* Layout */
--maxw: 1240px;  --rad-lg: 22px;  --rad-md: 14px;  --rad-sm: 10px;
```

`tokens.css` mirrors these for the detail pages under the older names
(`--accent` = `#f5a623`, `--text-primary` = `#1a1d26`, etc.).

## Typography

- **Quicksand** — all headings (`h1`–`h3`) and the brand wordmark.
- **Inter Tight** — body copy, and the "mono-label" slots (eyebrows, tags,
  step numbers, footer) — differentiated by uppercase + letter-spacing, not by
  a monospace face. There is **no** monospace font (JetBrains Mono was removed).
- Headings weight 700; body 400. Section descriptions: 15px / 22px line-height.
- Section eyebrows: orange dot prefix + sentence case + ember colour, 14px.

Don't introduce a third typeface or a monospace font without asking.

## Accent rules

- Ember orange `#f5a623` is the only accent (pastels are decoration-layer only).
- Use it for: highlighted words in headings, eyebrows, active states, hover
  states, CTA fill, focus rings, the brand dot.
- Hover on nav links: an ember-20% pill slides in from the left.

## Home page structure (`src/pages/index.astro`)

1. Fixed background shape layer (6 animated squircles)
2. Nav — glass pill, `lpg.` brand, anchor links + Contact CTA
3. Hero — h1 with two ember-highlighted words, lede, social row
4. Case studies — `#case-studies`, 6-col grid; checkRR is the wide feature card
5. Process — `#process`, 4 steps with SVG gauges
6. Tools — `#tools`, 6 category cards of chips
7. Timeline — `#timeline`, interactive horizontal track (click a stop)
8. Gallery — `#gallery`, CSS-columns masonry
9. Feedback — `#feedback`, testimonial carousel (12 cards)
10. CTA — `#contact` · 11. Footer

Each section: orange-dot eyebrow + Quicksand h2 + a full-width 15px description.

## Behaviours (`src/scripts/home.ts`)

- **Shape layer:** rAF scroll engine — squircles drift/rotate/scale via CSS
  custom props. Staggered entry. Skipped under `prefers-reduced-motion`.
- **Nav scroll-spy:** active link tracks the section in view.
- **Feedback carousel:** prev/next pages the rail.
- **Timeline:** clicking a stop activates it (orange node + glow, label flips
  above the line).
- **Brand typewriter** (`Brand.astro`): `lpg.` ⇄ `leon.govier` on hover/focus.
- All motion respects `prefers-reduced-motion: reduce`.

## When making changes

- **Read `src/pages/index.astro` + `src/styles/home.css` first** for the home
  page; **`src/styles/work-detail.css`** for anything across the detail pages.
- Detail-page CSS is shared — change `work-detail.css` once, never edit the
  nine pages individually.
- Use existing token names; don't hardcode new hex values.
- **Don't** introduce dark mode, a second accent, a monospace face, or
  modal-based case studies without confirming first.
- Radius: 22px cards, 14px image slots, 999px pills. Easing:
  `cubic-bezier(.2,.8,.2,1)`.

## Identity

- Name: Leon Govier · Role: Product Designer & Builder
- Brand wordmark: `lpg.` (the `.` is a small round ember dot, not a glyph) —
  typewriter-swaps to `leon.govier` on hover.
- Email: `hello@leongovier.com`
