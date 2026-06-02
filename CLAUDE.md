# leongovier.digital — Project Instructions

**Leon Govier's main site.** Plain static HTML/CSS/JS — no build step, no framework.

## Structure

```
landing/
  index.html          — single-page site (all content lives here)
  css/
    styles.css        — all styles
    jkiticon.css      — custom icon font
  fonts/jkiticon/     — icon font files
  images/             — site images & favicons
  js/
    main.js           — all JS behaviour
  public/             — case study images & assets
  api/
    mail.js           — Vercel serverless function for contact form
  vercel.json         — Vercel config (no build, output = .)
```

## Deploy

No build step. Files are served directly.

- **Local preview:** open `index.html` in a browser, or use `npx serve .`
- **Deploy:** `vercel --prod` from the `landing/` directory
- **Domain:** `leongovier.digital`
- Vercel is **not** connected to git auto-deploy. Push to GitHub saves work but does **not** deploy. Always run `vercel --prod` manually to ship.

## Editing

- All page content is in `index.html`
- All styles in `css/styles.css`
- All behaviour in `js/main.js`
- Icon font classes are in `css/jkiticon.css`

## Identity

- Name: Leon Govier · Role: Lead Product Designer
- Email: `hello@leongovier.com`
- Domain: `leongovier.digital`
