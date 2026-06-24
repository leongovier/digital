const rateLimit = new Map();

const FROM = 'Leon Govier <hello@leongovier.digital>';
const OWNER = 'hello@leongovier.digital';
const REPLY_TO = 'hello@leongovier.com';
const SITE_URL = 'https://leongovier.digital/build-cost.html';
const ACCENT = '#FF9900';
const FONT = "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

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

// Itemised rows → email table HTML
function itemRows(items) {
  return (Array.isArray(items) ? items : []).map((it) => `
    <tr>
      <td style="font-family:${FONT};font-size:13px;color:#3a3a42;padding:9px 0;border-bottom:1px solid #ececef;">${esc(it.label)}</td>
      <td style="font-family:${FONT};font-size:13px;font-weight:600;color:#1b1b20;text-align:right;white-space:nowrap;padding:9px 0;border-bottom:1px solid #ececef;">${esc(it.amount)}</td>
    </tr>`).join('');
}

// Light-mode, on-brand estimate email for the user.
function buildEstimateHtml({ name, total, items }) {
  const ctaHref = `mailto:${REPLY_TO}?subject=${encodeURIComponent('Re: my build cost estimate')}`;
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>Your build estimate</title></head>
<body style="margin:0;padding:0;background:#f1f1f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f4;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e8e8ec;border-radius:16px;overflow:hidden;">
    <tr><td style="height:4px;font-size:0;line-height:0;background:${ACCENT};">&nbsp;</td></tr>
    <tr><td style="padding:28px 32px 0;">
      <div style="font-family:${FONT};font-size:18px;font-weight:700;color:#1b1b20;">leongovier<span style="color:${ACCENT};">.digital</span></div>
    </td></tr>
    <tr><td style="padding:22px 32px 0;">
      <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};">Build Cost Calculator</div>
      <h1 style="font-family:${FONT};font-size:23px;font-weight:700;color:#1b1b20;margin:8px 0 0;line-height:1.25;">Your estimate</h1>
    </td></tr>
    <tr><td style="padding:14px 32px 0;">
      <div style="font-family:${FONT};font-size:14px;color:#44444c;line-height:1.6;">Hi ${esc(name)}, thanks for using the build cost calculator. Here's a summary of what you asked about.</div>
    </td></tr>
    <tr><td style="padding:18px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows(items)}</table>
    </td></tr>
    <tr><td style="padding:18px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;border:1px solid ${ACCENT};border-radius:10px;">
        <tr><td style="padding:18px 20px;">
          <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6c6c76;">Estimated total</div>
          <div style="font-family:${FONT};font-size:30px;font-weight:700;color:${ACCENT};margin-top:4px;">${esc(total)}</div>
          <div style="font-family:${FONT};font-size:11px;color:#9a9aa2;margin-top:8px;line-height:1.5;">A guide estimate, ex. VAT. The final fixed-price quote may vary once we've talked through your exact requirements.</div>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ec;border:1px solid #ffe2b8;border-radius:12px;">
        <tr><td align="center" style="padding:26px 24px;">
          <div style="font-family:${FONT};font-size:18px;font-weight:700;color:#1b1b20;">I'll be in touch within one working day</div>
          <div style="font-family:${FONT};font-size:14px;color:#55555c;line-height:1.6;margin:8px 0 20px;">with a detailed, fixed-price quote scoped to your exact requirements. No obligation.</div>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
            <td style="background:${ACCENT};border-radius:30px;">
              <a href="${ctaHref}" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Reply to Leon &rarr;</a>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:26px 32px 32px;">
      <div style="height:1px;background:#ececef;margin:0 0 18px;line-height:1px;font-size:0;">&nbsp;</div>
      <div style="font-family:${FONT};font-size:12px;color:#9a9aa2;line-height:1.7;">
        Generated by the Build Cost Calculator.<br>
        <a href="${SITE_URL}" style="color:${ACCENT};text-decoration:none;">leongovier.digital/build-cost.html</a><br>
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
    name, email, business, notes, website,
    build_type, scale, features, brand, timeline, total, items,
  } = body;

  // Honeypot — silently accept
  if (website) return res.status(200).json({ success: true, message: 'Thank you!' });

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const featureList = Array.isArray(features) && features.length ? features.join(', ') : 'None selected';
  const estimateHtml = buildEstimateHtml({ name, total, items });

  const leadBody = [
    'New build cost estimate request.',
    '',
    `Name:        ${name}`,
    `Email:       ${email}`,
    `Business:    ${business || 'Not provided'}`,
    `Notes:       ${notes || 'None'}`,
    '',
    '─────────────────────────────',
    `Build type:  ${build_type || '—'}`,
    `Scale:       ${scale || '—'}`,
    `Features:    ${featureList}`,
    `Brand:       ${brand || '—'}`,
    `Timeline:    ${timeline || '—'}`,
    `Estimate:    ${total || '—'}`,
  ].join('\n');

  try {
    const [userRes, leadRes] = await Promise.allSettled([
      sendEmail({
        from: FROM,
        to: email,
        reply_to: REPLY_TO,
        subject: 'Your build estimate from leongovier.digital',
        html: estimateHtml,
        text: leadBody,
      }),
      sendEmail({
        from: FROM,
        to: OWNER,
        reply_to: email,
        subject: `New build cost estimate — ${name} (${total || 'estimate'})`,
        text: leadBody,
      }),
    ]);

    const userOk = userRes.status === 'fulfilled' && userRes.value.ok;
    if (!userOk) {
      if (userRes.status === 'fulfilled') {
        const err = await userRes.value.json().catch(() => ({}));
        console.error('Resend error (user estimate):', err);
      } else {
        console.error('Fetch error (user estimate):', userRes.reason);
      }
      return res.status(500).json({ success: false, message: 'Something went wrong — please try again.' });
    }
    if (leadRes.status !== 'fulfilled' || !leadRes.value.ok) {
      console.error('Resend warning (build cost lead notification did not send).');
    }

    return res.status(200).json({ success: true, message: `Done. I'll follow up at ${email} within one working day.` });
  } catch (err) {
    console.error('Build cost send error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong — please try again.' });
  }
}
