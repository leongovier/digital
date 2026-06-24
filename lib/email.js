// Shared branded (light-mode) email templates, reused across the form
// endpoints. Pure string building — no external deps, safe to import in
// Node for local preview.
const ACCENT = '#FF9900';
const FONT = "'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const REPLY_TO = 'hello@leongovier.com';
const SITE = 'https://leongovier.digital';

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function shell({ eyebrow, title, bodyHtml, footnote }) {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f1f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f4;">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #e8e8ec;border-radius:16px;overflow:hidden;">
    <tr><td style="height:4px;font-size:0;line-height:0;background:${ACCENT};">&nbsp;</td></tr>
    <tr><td style="padding:28px 32px 0;">
      <div style="font-family:${FONT};font-size:18px;font-weight:700;color:#1b1b20;">leongovier<span style="color:${ACCENT};">.digital</span></div>
    </td></tr>
    <tr><td style="padding:22px 32px 0;">
      <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};">${esc(eyebrow)}</div>
      <h1 style="font-family:${FONT};font-size:23px;font-weight:700;color:#1b1b20;margin:8px 0 0;line-height:1.25;">${esc(title)}</h1>
    </td></tr>
    ${bodyHtml}
    <tr><td style="padding:26px 32px 32px;">
      <div style="height:1px;background:#ececef;margin:0 0 18px;line-height:1px;font-size:0;">&nbsp;</div>
      <div style="font-family:${FONT};font-size:12px;color:#9a9aa2;line-height:1.7;">${footnote || ''}</div>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

function paragraph(html) {
  return `<tr><td style="padding:14px 32px 0;">
      <div style="font-family:${FONT};font-size:14px;color:#44444c;line-height:1.6;">${html}</div>
    </td></tr>`;
}

function detailTable(rows) {
  const trs = (rows || [])
    .filter((r) => r[1] != null && String(r[1]).trim() !== '')
    .map((r) => `
      <tr>
        <td style="font-family:${FONT};font-size:13px;color:#9a9aa2;padding:9px 0;border-bottom:1px solid #ececef;vertical-align:top;width:140px;">${esc(r[0])}</td>
        <td style="font-family:${FONT};font-size:13px;font-weight:500;color:#1b1b20;padding:9px 0 9px 16px;border-bottom:1px solid #ececef;">${esc(r[1])}</td>
      </tr>`).join('');
  return `<tr><td style="padding:18px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${trs}</table>
    </td></tr>`;
}

function messageBlock(label, body) {
  return `<tr><td style="padding:18px 32px 0;">
      <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9a9aa2;margin-bottom:8px;">${esc(label)}</div>
      <div style="font-family:${FONT};font-size:14px;color:#1b1b20;line-height:1.6;background:#f6f6f8;border:1px solid #ececef;border-radius:10px;padding:14px 16px;white-space:pre-wrap;">${esc(body)}</div>
    </td></tr>`;
}

function ctaBlock(href, label) {
  return `<tr><td style="padding:24px 32px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="background:${ACCENT};border-radius:30px;">
          <a href="${href}" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${esc(label)}</a>
        </td>
      </tr></table>
    </td></tr>`;
}

// Owner-facing lead notification — branded summary + a one-click reply.
export function ownerLeadEmail({ source, name, replyEmail, rows, message }) {
  const body =
    paragraph(`A new <strong>${esc(source)}</strong> lead just came in${name ? ` from <strong>${esc(name)}</strong>` : ''}.`) +
    detailTable(rows) +
    (message ? messageBlock('Message', message) : '') +
    (replyEmail ? ctaBlock(`mailto:${esc(replyEmail)}`, `Reply to ${name || 'lead'} →`) : '');
  return shell({
    eyebrow: source,
    title: name ? `New lead — ${name}` : 'New lead',
    bodyHtml: body,
    footnote: `Also captured to your leads board.<br><a href="${SITE}/leads.html" style="color:${ACCENT};text-decoration:none;">${SITE.replace('https://', '')}/leads.html</a>`,
  });
}

// Enquirer auto-reply for the contact form.
export function enquirerReplyEmail({ name }) {
  const ctaHref = `mailto:${REPLY_TO}?subject=${encodeURIComponent('Re: my enquiry')}`;
  const body =
    paragraph(`Hi ${esc(name || 'there')}, thanks for getting in touch — your message has landed with me directly.`) +
    paragraph(`I read everything personally and I'll come back to you <strong>within one working day</strong> with next steps. If anything's urgent in the meantime, just reply to this email.`) +
    ctaBlock(ctaHref, 'Reply to Leon →');
  return shell({
    eyebrow: 'Enquiry received',
    title: 'Thanks — message received',
    bodyHtml: body,
    footnote: `Leon Govier &middot; Lead Product Designer<br><a href="${SITE}" style="color:${ACCENT};text-decoration:none;">${SITE.replace('https://', '')}</a>`,
  });
}
