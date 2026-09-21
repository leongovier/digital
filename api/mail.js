import { insertLead } from '../lib/store.js';
import { ownerLeadEmail, enquirerReplyEmail } from '../lib/email.js';
import { applyCors, rateLimited, inspect, shouldBlock, reviewMarker } from '../lib/antispam.js';

function sendEmail(payload) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}


export default async function handler(req, res) {
  // CORS — only our own origins, not the old blanket '*'
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  // Rate limiting — 5 requests per IP per minute (shared bucket)
  if (rateLimited(req)) {
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again shortly.' });
  }

  const submission = req.body || {};
  const { contact_name, contact_email, contact_number, contact_url, location, project_type, start_date, budget, referral_source, information } = submission;

  // Spam guard — honeypots, origin, submit timing, and the content itself.
  // A blocked submission gets the ordinary success response so the sender
  // learns nothing about what tripped it.
  const guard = await inspect({
    req,
    source: 'contact',
    body: submission,
    fields: { name: contact_name, email: contact_email, business: contact_url || location, message: information },
  });
  if (shouldBlock(guard, 'contact', { name: contact_name, email: contact_email })) {
    return res.status(200).json({ success: true, message: `Thank you, ${contact_name || 'there'}. I'll be in touch shortly.` });
  }
  const mark = reviewMarker(guard);

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
      summary: mark + ([project_type, budget].filter(Boolean).join(' · ') || 'Contact enquiry'),
      payload: { phone: contact_number, url: contact_url, location, project_type, start_date, budget, referral_source, message: information, spam_score: guard.flagged ? guard.score : undefined },
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
        subject: `${mark}New enquiry — ${contact_name} (${project_type})`,
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
