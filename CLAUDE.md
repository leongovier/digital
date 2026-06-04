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
- **Deploy:** push to the `main` branch — Vercel is connected to git auto-deploy and ships production automatically. Repo: `github.com/leongovier/digital`.
- **Domain:** `leongovier.digital`
- Do **not** run `vercel --prod` from the CLI — the project deploys via git push, and the CLI hits a different team/path and errors out.
- Large image payloads can time out the push (HTTP 408). If so, bump `git config http.postBuffer 524288000` and retry.

## Editing

- All page content is in `index.html`
- All styles in `css/styles.css`
- All behaviour in `js/main.js`
- Icon font classes are in `css/jkiticon.css`

## Identity

- Name: Leon Govier · Role: Lead Product Designer
- Email: `hello@leongovier.com`
- Domain: `leongovier.digital`
