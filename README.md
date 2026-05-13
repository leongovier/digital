# leongovier.com

Personal portfolio for Leon Govier — Product Designer & Builder. Two page types: a Home page and per-project Case Study detail pages. Built with Astro + MDX, deployed as a static site.

The visual design is locked in [CLAUDE.md](./CLAUDE.md) — design tokens, typography, accent rules, page structure, and behaviours. Treat it as the source of truth. The original HTML prototypes (`portfolio.html`, `project-northwood.html`) were used to seed the build; the rendered Astro pages now match them, and any new design decision should reference CLAUDE.md.

## Stack

- **Astro** (latest stable) — static output
- **MDX** — case study content
- **Tailwind CSS** — utility layer; design tokens are CSS custom properties in [src/styles/tokens.css](./src/styles/tokens.css), not hardcoded Tailwind values. `preflight` is disabled so the prototype's typography isn't clobbered.
- **Inter Tight + JetBrains Mono** via Google Fonts
- **Plausible** — analytics stub in `BaseLayout.astro` (commented out, ready to activate)

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output to ./dist
npm run preview      # preview the built site
```

Node 20+ is required (matches Netlify/Vercel build env).

## Project structure

```
src/
├── content/
│   ├── config.ts                      # work collection schema (Zod)
│   └── work/
│       ├── northwood-admin.mdx        # full case study
│       ├── quill-mobile.mdx           # stub
│       ├── field-and-co.mdx           # stub
│       └── ledgerline-marketing.mdx   # stub
├── layouts/
│   ├── BaseLayout.astro               # <head>, fonts, global CSS
│   └── CaseStudy.astro                # detail page chrome (progress bar, hero, prev/next)
├── pages/
│   ├── index.astro                    # Home
│   └── work/[slug].astro              # dynamic detail route
├── components/
│   ├── Nav.astro
│   ├── Footer.astro
│   ├── CaseCard.astro                 # work-grid card
│   ├── CaseArt.astro                  # CSS-drawn card art (laptop/mobile/grid/type)
│   ├── Block.astro                    # MDX section wrapper (narrow body + optional full slot)
│   ├── InsightGrid.astro              # 3-card insights row
│   ├── ArtifactGrid.astro             # 2-col sketches + flow diagram
│   ├── Gallery.astro                  # 1 wide + 2 half shots
│   └── OutcomesBlock.astro            # narrow ruled outcomes paragraph
├── scripts/
│   ├── home.ts                        # cursor glow, scroll reveal, anchors, scroll-spy
│   └── progress.ts                    # reading progress bar (detail pages)
└── styles/
    ├── tokens.css                     # CSS custom properties
    ├── global.css                     # body, nav, wrap, narrow, reveal, footer
    ├── home.css                       # home-only styles
    └── case-study.css                 # detail-only styles
```

## Adding a new case study

1. Create a new MDX file under `src/content/work/` — e.g. `halcyon.mdx`. The filename becomes the slug (`/work/halcyon`).
2. Frontmatter must include:

   | Field             | Type                                           | Required | Notes                                                              |
   | ----------------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------ |
   | `title`           | string                                         | yes      | Plain text. Used in `<title>` and the hero h1.                     |
   | `titleAccents`    | string[]                                       | no       | Phrases inside `title` to wrap in orange. e.g. `["stopped trusting"]`. |
   | `lede`            | string                                         | yes      | Hero sub-paragraph + meta description.                             |
   | `role`            | string                                         | yes      | Meta strip.                                                        |
   | `year`            | string                                         | yes      | Meta strip.                                                        |
   | `team`            | string                                         | yes      | Meta strip.                                                        |
   | `scope`           | string                                         | yes      | Meta strip.                                                        |
   | `tag`             | string                                         | yes      | Right-side tag on the home work card.                              |
   | `cardDescription` | string                                         | yes      | Subtitle under the card title on Home.                             |
   | `cardArt`         | `"laptop" \| "mobile" \| "grid" \| "type"`     | no       | Visual variant for the card. Defaults to `laptop`.                 |
   | `eyebrow`         | string                                         | no       | Hero eyebrow override. Defaults to `Case study — {title}`.         |
   | `order`           | number                                         | no       | Sort order on the home grid (lower first).                         |
   | `draft`           | boolean                                        | no       | If `true`, hidden from the home grid (still has its own URL).      |
   | `prevProject`     | `{ title, slug }`                              | no       | Renders the left footer cell. Hidden if omitted.                   |
   | `nextProject`     | `{ title, slug }`                              | no       | Renders the right footer cell. Hidden if omitted.                  |

3. Body. Import the MDX components and structure each section with `<Block>`:

   ```mdx
   import Block from '../../components/Block.astro';
   import InsightGrid from '../../components/InsightGrid.astro';

   <Block label="01 / Problem">
     <h2>One-sentence problem statement.</h2>
     <p>Body copy. Use **bold** for emphasis.</p>
   </Block>

   <Block label="02 / Research">
     <h2>What we learned.</h2>
     <p>Lede paragraph.</p>
     <InsightGrid slot="full" insights={[
       { num: "Insight 01", title: "...", body: "..." },
     ]} />
   </Block>
   ```

   Anything passed via `slot="full"` renders full-width below the narrow text. Use it for `<InsightGrid>`, `<ArtifactGrid>`, `<Gallery>`.

4. Wrap the closing block with `<OutcomesBlock>` for the qualitative outcomes paragraph (no big stat numbers — use accent `<strong>` for emphasis).

5. Restart the dev server and the new entry appears in the home work grid automatically.

## Deployment

Static output, deploys cleanly to either platform:

- **Netlify** — connected via [netlify.toml](./netlify.toml). Publish dir is `dist`.
- **Vercel** — connected via [vercel.json](./vercel.json). Framework preset is `astro`.

Pick one. Both configs are in the repo so you can switch without code changes.

## TODOs before going live

- Replace the seven press marks on the home page with real client SVG logos (`src/pages/index.astro`).
- Replace the CSS-drawn card art with real screenshots (or keep them — they're a defensible aesthetic choice). See `src/components/CaseArt.astro`.
- Replace the CSS-drawn shots inside the Northwood case study with real screenshots when available.
- Confirm `hello@leongovier.com` is the right address.
- Decide between **Netlify Forms** and **Formspree** for the contact form (currently mailto only).
- Activate the Plausible script in `src/layouts/BaseLayout.astro` once the domain is live.
