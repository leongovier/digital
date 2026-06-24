import { insertLead } from '../lib/store.js';

const rateLimit = new Map();

const FROM = 'Leon Govier <hello@leongovier.digital>';
const OWNER = 'hello@leongovier.digital';
const REPLY_TO = 'hello@leongovier.com';
const SITE_URL = 'https://leongovier.digital/fde-map.html';
const ACCENT = '#FF9900';
const FONT = "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Rating → bar colour (None, Weak, Partial, Strong, Watertight)
const RATING_COLORS = ['#9a9aa2', '#e24b4a', '#ef9f27', '#378add', '#1d9e75'];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

async function sendEmail(payload) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

// Light-mode, on-brand HTML report email.
function buildReportHtml({ initiative_name, name, case_strength, weakest, scores, report_body }) {
  const pctNum = parseInt(String(case_strength), 10) || 0;
  const accent = pctNum >= 80 ? '#1d9e75' : (pctNum >= 50 ? '#ef9f27' : '#e24b4a');
  const ctaHref = `mailto:${REPLY_TO}?subject=${encodeURIComponent('Re: my AI business case gap map for ' + initiative_name)}`;

  const dimRows = (Array.isArray(scores) ? scores : []).map((d) => {
    const sc = Number(d.score) || 0;
    const pct = Math.max(0, Math.min(100, (sc / 4) * 100));
    const bar = RATING_COLORS[sc] || RATING_COLORS[0];
    return `
      <tr>
        <td style="font-family:${FONT};font-size:13px;color:#3a3a42;padding:8px 0;">${esc(d.name)}</td>
        <td width="120" style="padding:8px 0 8px 10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ececef;border-radius:4px;">
            <tr><td style="font-size:0;line-height:0;height:6px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:${pct}%;min-width:6px;">
                <tr><td style="background:${bar};border-radius:4px;font-size:0;line-height:0;height:6px;">&nbsp;</td></tr>
              </table>
            </td></tr>
          </table>
        </td>
        <td width="78" style="font-family:${FONT};font-size:12px;font-weight:700;color:${bar};text-align:right;white-space:nowrap;padding:8px 0 8px 10px;">${esc(d.rating)}</td>
      </tr>`;
  }).join('');

  const hr = `<div style="height:1px;background:#ececef;margin:28px 0;line-height:1px;font-size:0;">&nbsp;</div>`;
  const sectionLabel = (t) => `<div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9a9aa2;margin:0 0 12px;">${esc(t)}</div>`;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Your AI business case gap map</title>
</head>
<body style="margin:0;padding:0;background:#f1f1f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f4;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e8e8ec;border-radius:16px;overflow:hidden;">

    <tr><td style="height:4px;font-size:0;line-height:0;background:${ACCENT};">&nbsp;</td></tr>

    <tr><td style="padding:28px 32px 0;">
      <div style="font-family:${FONT};font-size:18px;font-weight:700;color:#1b1b20;">leongovier<span style="color:${ACCENT};">.digital</span></div>
    </td></tr>

    <tr><td style="padding:22px 32px 0;">
      <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};">AI Business Case Gap Map</div>
      <h1 style="font-family:${FONT};font-size:24px;font-weight:700;color:#1b1b20;margin:8px 0 0;line-height:1.25;">Your gap analysis for ${esc(initiative_name)}</h1>
    </td></tr>

    <!-- strength + weakest -->
    <tr><td style="padding:24px 27px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="50%" valign="top" style="padding:0 5px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;border:1px solid ${accent};border-radius:10px;">
            <tr><td align="center" style="padding:16px 8px;">
              <div style="font-family:${FONT};font-size:28px;font-weight:700;line-height:1;color:${accent};">${esc(case_strength)}</div>
              <div style="font-family:${FONT};font-size:11px;color:#6c6c76;margin-top:8px;">Case strength</div>
            </td></tr>
          </table>
        </td>
        <td width="50%" valign="top" style="padding:0 5px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;border:1px solid #ececef;border-radius:10px;">
            <tr><td align="center" style="padding:16px 8px;">
              <div style="font-family:${FONT};font-size:16px;font-weight:700;line-height:1.3;color:#1b1b20;">${esc(weakest)}</div>
              <div style="font-family:${FONT};font-size:11px;color:#6c6c76;margin-top:8px;">Weakest dimension — fix first</div>
            </td></tr>
          </table>
        </td>
      </tr></table>
    </td></tr>

    <!-- dimension breakdown -->
    <tr><td style="padding:28px 32px 0;">
      ${sectionLabel('Dimension scores')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${dimRows}</table>
    </td></tr>

    <!-- full plain-text plan -->
    <tr><td style="padding:8px 32px 0;">
      ${hr}
      ${sectionLabel('Your prioritised build plan')}
      <pre style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:12px;line-height:1.55;color:#33333a;background:#f6f6f8;border:1px solid #ececef;border-radius:10px;padding:18px;white-space:pre-wrap;word-break:break-word;margin:0;">${esc(report_body)}</pre>
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:28px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ec;border:1px solid #ffe2b8;border-radius:12px;">
        <tr><td align="center" style="padding:28px 24px;">
          <div style="font-family:${FONT};font-size:19px;font-weight:700;color:#1b1b20;">Want help closing the gaps?</div>
          <div style="font-family:${FONT};font-size:14px;color:#55555c;line-height:1.6;margin:8px 0 20px;">I help UK financial-services teams turn a shaky AI business case into one that survives board, risk, and compliance scrutiny — from problem framing to a governed pilot. Let's talk it through.</div>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <td style="background:${ACCENT};border-radius:30px;">
              <a href="${ctaHref}" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Get in touch &rarr;</a>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>

    <!-- footer -->
    <tr><td style="padding:28px 32px 32px;">
      ${hr}
      <div style="font-family:${FONT};font-size:12px;color:#9a9aa2;line-height:1.7;">
        Generated by the AI Business Case Gap Map.<br>
        <a href="${SITE_URL}" style="color:${ACCENT};text-decoration:none;">leongovier.digital/fde-map.html</a><br>
        &copy; LG Digital Ltd
      </div>
    </td></tr>

  </table>
</td></tr>
</table>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  // Rate limiting — 5 requests per IP per minute
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > 60_000) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateLimit.set(ip, entry);
  if (entry.count > 5) {
    return res.status(429).json({ success: false, message: 'Too many requests — please try again in a few minutes.' });
  }

  const body = req.body || {};
  const {
    name, email, website, initiative_name,
    case_strength, weakest, gap_1, gap_2, scores, report_body,
  } = body;

  // Honeypot — silently accept
  if (website) return res.status(200).json({ success: true, message: 'Thank you!' });

  if (!name || !email || !report_body) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }
  // Capture into the leads pipeline (best-effort — never blocks the email).
  try {
    await insertLead({
      source: 'fde-map',
      name: name || initiative_name || 'Gap Map lead',
      email,
      business: initiative_name || null,
      summary: case_strength ? 'Case strength: ' + case_strength : 'Gap map',
      payload: { initiative: initiative_name, case_strength, weakest, gap_1, gap_2 },
    });
  } catch (e) { console.error('lead capture failed:', e); }

  const reportHtml = buildReportHtml({ initiative_name, name, case_strength, weakest, scores, report_body });

  const leadBody = [
    'New AI Business Case Gap Map submission.',
    '',
    `Initiative:     ${initiative_name || '—'}`,
    `From:           ${name} (${email})`,
    `Case strength:  ${case_strength || '—'}`,
    `Two biggest gaps: ${gap_1 || '—'}, ${gap_2 || '—'}`,
    '',
    '─────────────────────────────',
    'Full gap analysis sent to the user:',
    '',
    report_body,
  ].join('\n');

  try {
    const [userRes, leadRes] = await Promise.allSettled([
      sendEmail({
        from: FROM,
        to: email,
        reply_to: REPLY_TO,
        subject: `Your AI business case gap map${initiative_name ? ' for ' + initiative_name : ''}`,
        html: reportHtml,
        text: report_body,
      }),
      sendEmail({
        from: FROM,
        to: OWNER,
        reply_to: email,
        subject: `New gap map lead — ${initiative_name || 'AI business case'} (${case_strength || 'scored'})`,
        text: leadBody,
      }),
    ]);

    const userOk = userRes.status === 'fulfilled' && userRes.value.ok;
    if (!userOk) {
      if (userRes.status === 'fulfilled') {
        const err = await userRes.value.json().catch(() => ({}));
        console.error('Resend error (user report):', err);
      } else {
        console.error('Fetch error (user report):', userRes.reason);
      }
      return res.status(500).json({
        success: false,
        message: 'Something went wrong — please try again or contact hello@leongovier.com.',
      });
    }
    if (leadRes.status !== 'fulfilled' || !leadRes.value.ok) {
      console.error('Resend warning (gap map lead notification did not send).');
    }

    return res.status(200).json({
      success: true,
      message: `Gap analysis sent to ${email}. Check your inbox.`,
    });
  } catch (err) {
    console.error('Gap map send error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong — please try again or contact hello@leongovier.com.',
    });
  }
}
