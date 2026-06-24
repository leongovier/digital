import { insertLead } from '../lib/store.js';
import { ownerLeadEmail, enquirerReplyEmail } from '../lib/email.js';

function sendEmail(payload) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

const rateLimit = new Map();

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

  const { contact_name, contact_email, contact_number, contact_url, location, project_type, start_date, budget, referral_source, information, website } = req.body;

  // Honeypot
  if (website) {
    return res.status(200).json({ success: true, message: 'Thank you!' });
  }

  if (!contact_name || !contact_email || !project_type || !information) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact_email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }
  // Capture into the leads pipeline (best-effort — never blocks the email).
  try {
    await insertLead({
      source: 'contact',
      name: contact_name,
      email: contact_email,
      business: contact_url || location || null,
      summary: [project_type, budget].filter(Boolean).join(' · ') || 'Contact enquiry',
      payload: { phone: contact_number, url: contact_url, location, project_type, start_date, budget, referral_source, message: information },
    });
  } catch (e) { console.error('lead capture failed:', e); }

  const body = [
    `Name:         ${contact_name}`,
    `Email:        ${contact_email}`,
    `Phone:        ${contact_number || '—'}`,
    `LinkedIn/URL: ${contact_url || '—'}`,
    `Location:     ${location || '—'}`,
    `Project type: ${project_type}`,
    `Start date:   ${start_date || '—'}`,
    `Budget:       ${budget || '—'}`,
    `How found:    ${referral_source || '—'}`,
    '',
    'Message:',
    information,
  ].join('\n');

  const ownerHtml = ownerLeadEmail({
    source: 'Contact enquiry',
    name: contact_name,
    replyEmail: contact_email,
    rows: [
      ['Email', contact_email],
      ['Phone', contact_number],
      ['LinkedIn / URL', contact_url],
      ['Location', location],
      ['Project type', project_type],
      ['Start date', start_date],
      ['Budget', budget],
      ['How found', referral_source],
    ],
    message: information,
  });

  try {
    const [ownerRes, replyRes] = await Promise.allSettled([
      sendEmail({
        from: 'Leon Govier <hello@leongovier.digital>',
        to: 'hello@leongovier.digital',
        reply_to: contact_email,
        subject: `New enquiry — ${contact_name} (${project_type})`,
        html: ownerHtml,
        text: body,
      }),
      sendEmail({
        from: 'Leon Govier <hello@leongovier.digital>',
        to: contact_email,
        reply_to: 'hello@leongovier.com',
        subject: 'Thanks — message received',
        html: enquirerReplyEmail({ name: contact_name }),
        text: `Hi ${contact_name}, thanks for getting in touch — your message has landed with me directly. I'll come back to you within one working day. — Leon Govier, leongovier.digital`,
      }),
    ]);

    const ownerOk = ownerRes.status === 'fulfilled' && ownerRes.value.ok;
    if (!ownerOk) {
      if (ownerRes.status === 'fulfilled') {
        const err = await ownerRes.value.json().catch(() => ({}));
        console.error('Resend error (owner):', err);
      } else {
        console.error('Fetch error (owner):', ownerRes.reason);
      }
      return res.status(500).json({ success: false, message: 'Something went wrong. Please email me directly at hello@leongovier.com.' });
    }
    if (replyRes.status !== 'fulfilled' || !replyRes.value.ok) {
      console.error('Resend warning (auto-reply did not send).');
    }
    return res.status(200).json({ success: true, message: `Thank you, ${contact_name}. I'll be in touch shortly.` });
  } catch (err) {
    console.error('Send error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please email me directly at hello@leongovier.com.' });
  }
}
