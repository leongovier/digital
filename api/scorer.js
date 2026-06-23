const rateLimit = new Map();

const FROM = 'Leon Govier <hello@leongovier.digital>';
const OWNER = 'hello@leongovier.digital';
const REPLY_TO = 'hello@leongovier.com';

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

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  // Basic rate limiting — 5 requests per IP per minute
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const window = 60_000;
  const max = 5;
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > window) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateLimit.set(ip, entry);
  if (entry.count > max) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again shortly.' });
  }

  const {
    initiative_name, email, website,
    strategic_value, implementation_cost, net_score,
    verdict_name, next_steps, report_body,
  } = req.body || {};

  // Honeypot — silently accept
  if (website) {
    return res.status(200).json({ success: true, message: 'Thank you!' });
  }

  if (!initiative_name || !email || !report_body) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  // Lead notification body (for the site owner)
  const leadBody = [
    `New Value Matrix ROI Scorer submission.`,
    '',
    `Initiative:           ${initiative_name}`,
    `From:                 ${email}`,
    `Verdict:              ${verdict_name || '—'}`,
    `Strategic Value:      ${strategic_value || '—'} / 5`,
    `Implementation Cost:  ${implementation_cost || '—'} / 5`,
    `Net Priority Score:   ${net_score || '—'}`,
    `Next steps shared:    ${next_steps || '—'}`,
    '',
    '─────────────────────────────',
    'Full report sent to the user:',
    '',
    report_body,
  ].join('\n');

  try {
    const [userRes, leadRes] = await Promise.allSettled([
      // 1) The report, to the person who scored
      sendEmail({
        from: FROM,
        to: email,
        reply_to: REPLY_TO,
        subject: `Your Value Matrix score for ${initiative_name}`,
        text: report_body,
      }),
      // 2) The lead, to the site owner
      sendEmail({
        from: FROM,
        to: OWNER,
        reply_to: email,
        subject: `New scorer lead — ${initiative_name} (${verdict_name || 'scored'})`,
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
      // Don't fail the user-facing request just because the lead copy failed.
      console.error('Resend warning (lead notification did not send).');
    }

    return res.status(200).json({
      success: true,
      message: `Report sent to ${email}. Check your inbox — it should arrive within a minute.`,
    });
  } catch (err) {
    console.error('Scorer send error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong — please try again or contact hello@leongovier.com.',
    });
  }
}
