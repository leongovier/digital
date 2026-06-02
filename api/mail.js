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

  const { contact_name, contact_email, contact_number, location, project_type, start_date, budget, referral_source, information, website } = req.body;

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

  const body = [
    `Name:         ${contact_name}`,
    `Email:        ${contact_email}`,
    `Phone:        ${contact_number || '—'}`,
    `Location:     ${location || '—'}`,
    `Project type: ${project_type}`,
    `Start date:   ${start_date || '—'}`,
    `Budget:       ${budget || '—'}`,
    `How found:    ${referral_source || '—'}`,
    '',
    'Message:',
    information,
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Leon Govier <hello@leongovier.com>',
        to: 'hello@leongovier.com',
        reply_to: contact_email,
        subject: `New enquiry — ${contact_name} (${project_type})`,
        text: body,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: `Thank you, ${contact_name}. I'll be in touch shortly.` });
    } else {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ success: false, message: 'Something went wrong. Please email me directly at hello@leongovier.com.' });
    }
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please email me directly at hello@leongovier.com.' });
  }
}
