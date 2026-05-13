# Portfolio 26 — Project Instructions

This is **Leon Govier's personal portfolio**. A two-page editorial site — Home + per-project case study detail pages. Built with **Astro**; deploys via Vercel (`npm run build` → `dist/`).

**Source of truth:**
- Home: `src/pages/index.astro` + `src/styles/home.css` + `src/scripts/home.ts`
- Case study template: `src/layouts/CaseStudy.astro` + `src/styles/case-study.css`, rendered for each entry under `src/content/work/*.mdx` via `src/pages/work/[slug].astro`
- Shared shell: `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`
- Design tokens: `src/styles/tokens.css` + `src/styles/global.css`

**Scratch HTML at root** (`index.html`, `project-adaptivecrm.html`, `project-checkrr.html`) is a prototyping sandbox — fast-iteration designs that get ported back into the Astro components/MDX. It is NOT deployed. If you change visual direction in scratch HTML, mirror it into the Astro source before treating the change as real.

Always read the Astro source above before suggesting changes.

## Direction (locked)

- **Tone:** restrained, editorial, lots of whitespace. Confident without shouting. Product Designer & Builder positioning.
- **Structure:** two-page. Home → dedicated detail pages (one per project). NOT a single-page modal layout.
- **Audience:** hiring managers, founders, collaborators. Not a contractor lead-gen funnel.

## Design tokens (do not drift)

```css
/* Surfaces */
--bg:      #FFFFFF;   /* white, NOT dark */
--bg-2:    #F4F4F2;
--rule:    #E6E6E3;

/* Type */
--ink:     #3A3A3A;   /* soft dark grey, NOT pure black */
--ink-2:   #707070;
--ink-3:   #A0A0A0;

/* Accent — orange */
--accent:      #FF6B1A;
--accent-soft: #FF6B1A1A;

/* Layout */
--max:    1240px;
--narrow:  760px;

/* Breakpoints (use these literal values in @media — CSS vars don't work in queries) */
--bp-sm:  520px;   /* phones */
--bp-md:  720px;   /* large phones / portrait tablets */
--bp-lg: 1024px;   /* landscape tablets / small laptops */
```

## Responsive scale

Three breakpoints, used desktop-first via `max-width`:

- **`@media (max-width: 1023px)`** — landscape tablets / small laptops. Relax dense desktop grids (5-col → 3-col, 7-col press → 4-col, etc).
- **`@media (max-width: 719px)`** — large phones / portrait tablets. Multi-col → 2-col. Section padding tightens.
- **`@media (max-width: 519px)`** — phones. Single-column where it still reads well. Wrap padding 20px.

Page wrap padding: 48px (desktop) → 32px (lg) → 24px (md) → 20px (sm).
Don't introduce ad-hoc breakpoints. If a section needs different behaviour, add it inside the existing scale.

## Typography

- **Inter Tight** (300/400/500/600/700) — body + display. Söhne stand-in.
- **JetBrains Mono** (400/500) — labels, eyebrows, nav, metadata.
- Body letter-spacing: `-0.01em` global.
- Display headlines: `-0.025em` to `-0.04em`.
- `text-wrap: balance` on hero h1 + display h2s.
- Headlines weight 300–400 (light/regular). Body 400. Mono labels uppercase with 0.08em tracking.

Do not use Inter (use Inter Tight). Do not introduce a third typeface without asking.

## Accent rules

- Orange (`#FF6B1A`) is the only accent. No secondary colors.
- Use it for: highlighted words in headlines, active nav state + underline, eyebrow numerals, hover states, CTA fill, the reading progress bar, focus rings.
- Don't use it for body copy, large surfaces, or as a background gradient.
- Underline on hover/active is animated (`scaleX` from left, 350ms `cubic-bezier(.2,.8,.2,1)`).

## Page structure

### Home (`src/pages/index.astro`)
1. Top nav (logo left, mono links right with animated underline + scroll-spy)
2. Hero — display h1 with two orange-highlighted words, lede, accent rule + socials row
3. Press strip (7 client marks, currently placeholders)
4. Selected work — grid of case study cards. Hover: frame lifts, art scales, arrow translates + turns accent. Each card links to its detail page at `/work/<slug>`.
5. Process — 4-step grid with mono numerals
6. Testimonials — 2 cards with mono initial avatars
7. CTA — large display "Got something interesting to build?" with primary pill (mailto) + ghost button
8. Footer — mono, with accent date stamp

### Case study detail (`src/layouts/CaseStudy.astro` + `src/content/work/<slug>.mdx`)
Editorial long-scroll. Reusable template — all case study MDX entries follow this structure with swapped content. Current slugs: `adaptivecrm`, `admiral-money`, `aqa`, `checkrr`, `coincover`, `cubik-ai`, `cwt`, `jamf`, `mfs`, `pepper-money`.
1. Reading progress bar (orange, 2px, fixed top)
2. Top nav + "← All work" back link in narrow track
3. Hero — eyebrow with accent dot, display h1 (orange-highlighted words), lede, 4-col meta strip (role/year/team/scope), full-bleed hero image with device mock
4. Problem (narrow body)
5. Research — narrow intro + full-width 3-card insight grid
6. Process — narrow intro + full-width 2-col artifacts (sketches + flow diagram)
7. Solution — narrow intro + full-width gallery (1 wide + 2 half shots)
8. Outcomes — narrow track, qualitative tone, **no big stat numbers** (one subtle paragraph with accent highlights)
9. Prev/Next project nav (full-width, 2-col)
10. Footer

## Behaviors

- **Scroll reveals**: `.reveal` class fades + rises 24px on intersect. **Anything within 92% viewport on load reveals immediately** to avoid hero blank-flash.
- **Cursor glow**: 480px radial-gradient orange-soft div follows cursor with `mix-blend-mode: multiply`. Behind a `prefers-reduced-motion` guard if added.
- **Smooth anchors**: `scrollTo({top: target.offsetTop - 24, behavior: 'smooth'})`.
- **Scroll-spy**: home nav active state tracks the section whose `offsetTop` is most recently passed (with 120px buffer).
- **Reading progress**: detail page only, linear width animation 80ms based on scroll ratio.

## When making changes

- **Read `src/pages/index.astro` and `src/layouts/CaseStudy.astro` first.** They are the spec.
- **New case studies** = add an MDX file to `src/content/work/` following the schema in `src/content/config.ts`. Don't reinvent the layout.
- **Don't** introduce dark mode, a second accent, Inter (regular), pure black text, or modal-based case studies. If asked for these, confirm explicitly first — they would change the direction of the project.
- **Use the existing token names** (`--ink`, `--accent`, etc.). Don't hardcode new hex values.
- **Spacing scale**: 56 / 64 / 72 / 88 / 96 / 120 px for vertical sections. Grid gaps: 16 / 24 / 36 / 40 px.
- **Radius**: 4px cards, 6px hero image, 999px buttons/pills.
- **Easing**: `cubic-bezier(.2, .8, .2, 1)` for hover transforms; `cubic-bezier(.2, .7, .2, 1)` for reveals.

## Placeholder content to swap

- All seven press marks on the home page (replace with real client SVG logos)
- All four card visuals on home (replace with real screenshots, ideally inside browser/device frames matching the existing chassis style)
- Every "shot" referenced by case study MDX files (real screenshots — live under `public/case-studies/<slug>/`)
- Testimonial quotes/names and case study copy are draft — confirm before treating as final
- Email `hello@leongovier.com` — confirm correct address

## Identity

- Name: Leon Govier
- Logo wordmark: `Leon Govier` (mono)
- Role: Product Designer & Builder
