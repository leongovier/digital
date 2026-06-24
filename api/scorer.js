import { insertLead } from '../lib/store.js';
import { ownerLeadEmail } from '../lib/email.js';

const rateLimit = new Map();

const FROM = 'Leon Govier <hello@leongovier.digital>';
const OWNER = 'hello@leongovier.digital';
const REPLY_TO = 'hello@leongovier.com';
const SITE_URL = 'https://leongovier.digital/value-matrix.html';
const ACCENT = '#FF9900';

const VERDICT_COLORS = {
  build: '#1D9E75',
  plan: '#378ADD',
  experiment: '#EF9F27',
  avoid: '#E24B4A',
};

const DIMENSIONS = [
  { key: 'revenue_impact', label: 'Revenue impact', group: 'value' },
  { key: 'fca_risk_reduction', label: 'FCA regulatory risk reduction', group: 'value' },
  { key: 'consumer_outcome', label: 'Consumer outcome improvement', group: 'value' },
  { key: 'competitive_differentiation', label: 'Competitive differentiation', group: 'value' },
  { key: 'operational_resilience', label: 'Operational resilience', group: 'value' },
  { key: 'data_readiness', label: 'Data readiness', group: 'cost' },
  { key: 'data_compliance_overhead', label: 'Data compliance overhead', group: 'cost' },
  { key: 'model_governance_burden', label: 'Model risk & governance burden', group: 'cost' },
  { key: 'integration_complexity', label: 'Integration complexity', group: 'cost' },
  { key: 'smcr_overhead', label: 'SM&CR overhead', group: 'cost' },
];

const VALUE_COLOR = '#1D9E75';
const COST_COLOR = '#E24B4A';
const FONT = "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// A light-mode, on-brand HTML report email.
export function buildReportHtml(d) {
  const accent = VERDICT_COLORS[d.verdict_key] || ACCENT;
  const netNum = parseFloat(d.net_score);
  const netColor = netNum > 0 ? VALUE_COLOR : (netNum < 0 ? COST_COLOR : '#3a3a42');
  const ctaHref = `mailto:${REPLY_TO}?subject=${encodeURIComponent('Re: my Value Matrix score for ' + d.initiative_name)}`;

  const scoreCard = (label, value, color) => `
    <td width="33.33%" valign="top" style="padding:0 5px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;border:1px solid #ececef;border-radius:10px;">
        <tr><td align="center" style="padding:16px 8px;">
          <div style="font-family:${FONT};font-size:28px;font-weight:700;line-height:1;color:${color};">${esc(value)}</div>
          <div style="font-family:${FONT};font-size:11px;color:#6c6c76;margin-top:8px;line-height:1.3;">${esc(label)}</div>
        </td></tr>
      </table>
    </td>`;

  const dimRow = (dim) => {
    const v = Number(d.scores[dim.key]) || 0;
    const pct = Math.max(0, Math.min(100, (v / 5) * 100));
    const bar = dim.group === 'value' ? VALUE_COLOR : COST_COLOR;
    return `
      <tr>
        <td style="font-family:${FONT};font-size:13px;color:#3a3a42;padding:8px 0;">${esc(dim.label)}</td>
        <td width="110" style="padding:8px 0 8px 10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ececef;border-radius:4px;">
            <tr><td style="font-size:0;line-height:0;height:6px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:${pct}%;min-width:6px;">
                <tr><td style="background:${bar};border-radius:4px;font-size:0;line-height:0;height:6px;">&nbsp;</td></tr>
              </table>
            </td></tr>
          </table>
        </td>
        <td width="44" style="font-family:${FONT};font-size:13px;font-weight:700;color:${bar};text-align:right;white-space:nowrap;padding:8px 0 8px 10px;">${v} / 5</td>
      </tr>`;
  };

  const dimGroup = (title, group) => `
    <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${group === 'value' ? VALUE_COLOR : COST_COLOR};margin:18px 0 4px;">${esc(title)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${DIMENSIONS.filter((x) => x.group === group).map(dimRow).join('')}</table>`;

  const steps = (Array.isArray(d.next_steps_list) ? d.next_steps_list : []);
  const stepsHtml = steps.map((s, i) => `
    <tr>
      <td valign="top" width="28" style="padding:6px 0;">
        <div style="width:22px;height:22px;background:${ACCENT};border-radius:50%;color:#ffffff;font-family:${FONT};font-size:12px;font-weight:700;text-align:center;line-height:22px;">${i + 1}</div>
      </td>
      <td style="font-family:${FONT};font-size:14px;color:#3a3a42;line-height:1.55;padding:6px 0 6px 10px;">${esc(s)}</td>
    </tr>`).join('');

  const sectionLabel = (t) => `<div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9a9aa2;margin:0 0 12px;">${esc(t)}</div>`;
  const hr = `<div style="height:1px;background:#ececef;margin:28px 0;line-height:1px;font-size:0;">&nbsp;</div>`;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Your Value Matrix score</title>
</head>
<body style="margin:0;padding:0;background:#f1f1f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f4;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e8e8ec;border-radius:16px;overflow:hidden;">

    <!-- accent strip -->
    <tr><td style="height:4px;font-size:0;line-height:0;background:${ACCENT};">&nbsp;</td></tr>

    <!-- header -->
    <tr><td style="padding:28px 32px 0;">
      <div style="font-family:${FONT};font-size:18px;font-weight:700;color:#1b1b20;">leongovier<span style="color:${ACCENT};">.digital</span></div>
    </td></tr>

    <!-- title -->
    <tr><td style="padding:22px 32px 0;">
      <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};">Value Matrix ROI Scorer</div>
      <h1 style="font-family:${FONT};font-size:24px;font-weight:700;color:#1b1b20;margin:8px 0 0;line-height:1.25;">Your score for ${esc(d.initiative_name)}</h1>
    </td></tr>

    <!-- scores -->
    <tr><td style="padding:24px 27px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        ${scoreCard('Strategic Value', d.strategic_value + ' / 5', VALUE_COLOR)}
        ${scoreCard('Implementation Cost', d.implementation_cost + ' / 5', COST_COLOR)}
        ${scoreCard('Net Priority Score', d.net_score, netColor)}
      </tr></table>
    </td></tr>

    <!-- verdict -->
    <tr><td style="padding:24px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;border:1px solid ${accent};border-radius:8px;">
        <tr><td style="padding:18px 20px;">
          <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${accent};">Verdict</div>
          <div style="font-family:${FONT};font-size:18px;font-weight:700;color:${accent};margin:5px 0 8px;">${esc(d.verdict_name)}</div>
          <div style="font-family:${FONT};font-size:14px;color:#44444c;line-height:1.6;">${esc(d.verdict_copy)}</div>
        </td></tr>
      </table>
    </td></tr>

    <!-- breakdown -->
    <tr><td style="padding:28px 32px 0;">
      ${sectionLabel('Dimension breakdown')}
      ${dimGroup('Strategic Value', 'value')}
      ${dimGroup('Implementation Cost', 'cost')}
    </td></tr>

    <!-- next steps -->
    <tr><td style="padding:8px 32px 0;">
      ${hr}
      ${sectionLabel('What to do next')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepsHtml}</table>
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:28px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ec;border:1px solid #ffe2b8;border-radius:12px;">
        <tr><td align="center" style="padding:28px 24px;">
          <div style="font-family:${FONT};font-size:19px;font-weight:700;color:#1b1b20;">Thinking about building this?</div>
          <div style="font-family:${FONT};font-size:14px;color:#55555c;line-height:1.6;margin:8px 0 20px;">I help UK financial-services teams scope and ship AI initiatives — from a one-week discovery spike to a live, governed build. Let's talk it through.</div>
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
        Generated by the Value Matrix ROI Scorer.<br>
        <a href="${SITE_URL}" style="color:${ACCENT};text-decoration:none;">leongovier.digital/value-matrix.html</a><br>
        &copy; LG Digital Ltd
      </div>
    </td></tr>

  </table>
</td></tr>
</table>
</body></html>`;
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

  const body = req.body || {};
  const {
    initiative_name, email, website,
    strategic_value, implementation_cost, net_score,
    verdict_name, verdict_key, verdict_copy, next_steps, next_steps_list, report_body,
  } = body;

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
  // Capture into the leads pipeline (best-effort — never blocks the email).
  try {
    await insertLead({
      source: 'value-matrix',
      name: initiative_name || 'Value Matrix lead',
      email,
      business: null,
      summary: [verdict_name, (net_score != null && net_score !== '' ? 'Net ' + net_score : null)].filter(Boolean).join(' · ') || 'Value matrix score',
      payload: { initiative: initiative_name, strategic_value, implementation_cost, net_score, verdict: verdict_name },
    });
  } catch (e) { console.error('lead capture failed:', e); }

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

  // Assemble the per-dimension scores for the HTML report
  const scores = {};
  for (const dim of DIMENSIONS) scores[dim.key] = body[dim.key];

  const reportHtml = buildReportHtml({
    initiative_name,
    strategic_value,
    implementation_cost,
    net_score,
    verdict_name,
    verdict_key,
    // Fallback: strip the "Name — " prefix if verdict_copy wasn't sent
    verdict_copy: verdict_copy || String(body.verdict || '').replace(/^[^—]*—\s*/, ''),
    next_steps_list: Array.isArray(next_steps_list)
      ? next_steps_list
      : String(next_steps || '').split(/\s*\(\d+\)\s*/).filter(Boolean),
    scores,
  });

  const ownerHtml = ownerLeadEmail({
    source: 'Value Matrix', name: initiative_name, replyEmail: email,
    rows: [
      ['Email', email], ['Initiative', initiative_name], ['Verdict', verdict_name],
      ['Strategic value', strategic_value != null ? strategic_value + ' / 5' : null],
      ['Implementation cost', implementation_cost != null ? implementation_cost + ' / 5' : null],
      ['Net score', net_score],
    ],
  });

  try {
    const [userRes, leadRes] = await Promise.allSettled([
      // 1) The report, to the person who scored
      sendEmail({
        from: FROM,
        to: email,
        reply_to: REPLY_TO,
        subject: `Your Value Matrix score for ${initiative_name}`,
        html: reportHtml,
        text: report_body,
      }),
      // 2) The lead, to the site owner
      sendEmail({
        from: FROM,
        to: OWNER,
        reply_to: email,
        subject: `New scorer lead — ${initiative_name} (${verdict_name || 'scored'})`,
        html: ownerHtml,
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
