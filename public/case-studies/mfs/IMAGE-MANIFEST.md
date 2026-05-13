# MFS case study — image manifest

9 images, 1480×926 WebP at quality 82. Total 1.15 MB (down from 3.2 MB original PNGs — 64% reduction).

All images are MacBook Pro mockups containing screenshots of the work. Alt text is written to be useful for screen readers AND informative if the image fails to load — saying what the image *shows* and *proves*, not what it visually *is*.

---

## File 1 — Hero

**File:** `mfs-01-hero__cubik-commercial-applicants.webp`
**Size:** 99 KB
**Case study slot:** Hero image at top
**Alt text:**
> Cubik Commercial loan application screen inside MFS Polaris, showing applicant details, a four-stage Decision in Principle progress bar, and an Associated Tasks panel listing searches, fees, and approvals.

---

## File 2 — Discovery

**File:** `mfs-02-discovery__lucid-journey-library.webp`
**Size:** 153 KB
**Case study slot:** Methodology — bullet 1, "Service-led design"
**Alt text:**
> Lucid documents library showing the MFSUK folder of journey maps and process diagrams used to align product, credit, and operations before any UI work began.

---

## File 3 — Astra components

**File:** `mfs-03-astra__stage-progression-component.webp`
**Size:** 181 KB
**Case study slot:** Methodology — bullet 2, "Foundation: Astra design system"
**Alt text:**
> Astra design system in Figma — stage progression component variants showing different application states from Quote generation through Quote accepted.

---

## File 4 — Astra components 2

**File:** `mfs-04-astra__quotes-table-token-inspector.webp`
**Size:** 140 KB
**Case study slot:** Pull-quote section, "Astra was designed to be portable. Polaris proved it was."
**Alt text:**
> Astra quote-table component variants in Figma with the design-token inspector visible, showing how rate, fee, and term data is structured as reusable tokens.

---

## File 5 — Pivot, before

**File:** `mfs-05-pivot-before__legacy-calculator.webp`
**Size:** 142 KB
**Case study slot:** Methodology — bullet 3, "Pivot: Polaris architecture" — paired with file 6 as before/after
**Alt text:**
> The legacy Calcule8 calculator MFS used before the Polaris pivot — showing the dated UI and Salesforce-native limitations that triggered the architectural change.

---

## File 6 — Pivot, after

**File:** `mfs-06-pivot-after__polaris-btl-calculator.webp`
**Size:** 123 KB
**Case study slot:** Methodology — bullet 3, "Pivot: Polaris architecture" — paired with file 5 as before/after
**Alt text:**
> The new Polaris Buy to Let calculator inside Salesforce, replacing the legacy tool with a decoupled React-based platform that handles full Specialist and Core range pricing logic.

---

## File 7 — Polaris tier matrix

**File:** `mfs-07-polaris__buy-to-let-tier-matrix.webp`
**Size:** 124 KB
**Case study slot:** What shipped — first bullet, "Polaris calculator suite"
**Alt text:**
> Polaris Buy to Let product matrix showing the three lending tiers with fee ranges, fixed and tracker rates, and revert-rate logic across the full product spread.

---

## File 8 — Token propagation

**File:** `mfs-08-token-propagation__cubik-form-mcp-inspector.webp`
**Size:** 113 KB
**Case study slot:** Methodology — bullet 4, "System extension, not replacement"
**Alt text:**
> A Cubik Commercial application form in Figma with the inspector showing Astra design tokens — the token foundation propagating directly into Polaris React components.

---

## File 9 — Integrated experience

**File:** `mfs-09-integrated__cubik-commercial-searches.webp`
**Size:** 81 KB
**Case study slot:** What shipped — third bullet, "Salesforce integration (Phase 2)"
**Alt text:**
> The Cubik Commercial application inside Salesforce, with the Searches tab showing live status results from Creditsafe, Companies House, Comply Advantage, and Land Registry — the integrated broker and advisor experience preserved despite Polaris running outside Salesforce.

---

## Suggested upload path on the live site

If using WordPress media library:
- Upload all 9 to a single `mfs-2025` folder/album
- Set the WebP filenames as the WordPress slugs (they're already URL-safe)
- Paste the alt text from above into each image's Alt Text field at upload time
- Set the title to a human-readable version (e.g. "MFS — Hero: Cubik Commercial application")

If serving via static path:
- Drop them in `/images/case-studies/mfs/`
- Reference as `<img src="/images/case-studies/mfs/mfs-01-hero__cubik-commercial-applicants.webp" alt="...">`

---

## Performance notes

- All 9 images sum to ~1.15 MB. That's well under the 1 MB budget for a single hero gallery, even with this many images.
- Lazy-load everything below the fold (`loading="lazy"` on the `<img>` tag). The hero image (file 1) should load eagerly.
- Set explicit `width="1480" height="926"` on every `<img>` to prevent layout shift.
- WebP is supported in 97%+ of browsers as of 2026. No fallback needed unless you specifically need IE11 / very old Safari support — which a senior product designer's portfolio doesn't.
