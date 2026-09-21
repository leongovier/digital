/* ============================================================
   Form guard — the browser half of the spam defence.

   Adds three things to every form on the page:
     • a second honeypot field (bots fill everything they find)
     • _dt  — milliseconds between the page loading and the submit
     • _hv  — count of genuine keyboard/pointer events the visitor made

   None of it is visible, none of it blocks a real person, and none of
   it is trusted on its own — lib/antispam.js scores these alongside the
   request headers and the content itself.

   Optional: add <meta name="turnstile-sitekey" content="0x..."> to a
   page and this will also render an invisible Cloudflare Turnstile
   widget into each form. See README.

   Loaded on every page that carries a form, before js/main.js.
   ============================================================ */
(function () {
  'use strict';

  var loadedAt = Date.now();
  var interactions = 0;

  // Only count events the browser itself generated. A script setting
  // .value on an input produces nothing here.
  ['keydown', 'pointerdown', 'mousedown', 'touchstart', 'input'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (e && e.isTrusted) interactions++;
    }, true);
  });

  function elapsed() { return Date.now() - loadedAt; }

  function hiddenInput(form, name, value) {
    var existing = form.querySelector('input[name="' + name + '"]');
    if (existing) { existing.value = value; return existing; }
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
    return input;
  }

  // Off-screen rather than display:none — some bots skip hidden fields but
  // happily fill a positioned one.
  function addHoneypot(form) {
    if (form.querySelector('input[name="company_url"]')) return;
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';
    var input = document.createElement('input');
    input.type = 'text';
    input.name = 'company_url';
    input.tabIndex = -1;
    input.autocomplete = 'off';
    input.setAttribute('aria-hidden', 'true');
    wrap.appendChild(input);
    form.appendChild(wrap);
  }

  function prepare(form) {
    if (!form || form.__formGuarded) return;
    form.__formGuarded = true;
    addHoneypot(form);
    hiddenInput(form, '_dt', String(elapsed()));
    hiddenInput(form, '_hv', String(interactions));
    if (turnstileSiteKey()) renderTurnstile(form);
  }

  function stamp(form) {
    if (!form) return;
    hiddenInput(form, '_dt', String(elapsed()));
    hiddenInput(form, '_hv', String(interactions));
  }

  // The contact forms serialise with FormData, so the hidden inputs need to
  // hold current values by the time the page's own submit handler runs.
  // Capture phase gets us in first.
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.tagName === 'FORM') stamp(e.target);
  }, true);

  /* --- Turnstile (optional, off unless a site key is present) ----------- */

  function turnstileSiteKey() {
    var meta = document.querySelector('meta[name="turnstile-sitekey"]');
    return meta ? meta.getAttribute('content') : null;
  }

  var turnstileRequested = false;
  function loadTurnstile() {
    if (turnstileRequested) return;
    turnstileRequested = true;
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  function renderTurnstile(form) {
    loadTurnstile();
    if (form.querySelector('.cf-turnstile')) return;
    var holder = document.createElement('div');
    holder.className = 'cf-turnstile';
    holder.setAttribute('data-sitekey', turnstileSiteKey());
    holder.setAttribute('data-size', 'flexible');
    holder.setAttribute('data-appearance', 'interaction-only');
    form.appendChild(holder);
  }

  /* --- API for the tool pages ------------------------------------------ */

  // The tool pages build their own JSON payload rather than using FormData,
  // so they call this and spread the result in.
  function fields(form) {
    var scope = form || document;
    var honeypot = scope.querySelector('input[name="company_url"]');
    var token = scope.querySelector('[name="cf-turnstile-response"]');
    var out = {
      _dt: elapsed(),
      _hv: interactions,
      company_url: honeypot ? honeypot.value : '',
    };
    if (token && token.value) out['cf-turnstile-response'] = token.value;
    return out;
  }

  window.formGuard = { fields: fields, prepare: prepare };
  // Convenience alias used inline by the tool scripts.
  window.formGuardFields = fields;

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('form'), prepare);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
