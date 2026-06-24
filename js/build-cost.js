/* ============================================================
   Build Cost Calculator
   Six-step configurator that builds a live estimate in JS state
   and submits the spec + lead via Resend (/api/build-cost).
   Step 1 is multi-select: pick one or more build types. Step 2
   asks a scale per selected type and the bases add up; Step 3
   merges the feature lists. Prices are never shown until Step 6.
   ============================================================ */

const BCC_CONTACT_EMAIL = 'hello@leongovier.com';

/* ── Inline outline icons (Tabler style) ─────────────────────── */
const ICON_PATHS = {
  world: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6"/><path d="M9 12h0M12 12h0M15 12h0M9 16h0M12 16h0M15 16h0"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  brain: '<path d="M12 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3"/><path d="M12 5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3"/><path d="M9 9H7.5a2 2 0 0 0 0 4M15 9h1.5a2 2 0 0 1 0 4"/>',
  'layers-intersect': '<rect x="4" y="4" width="11" height="11" rx="2"/><rect x="9" y="9" width="11" height="11" rx="2"/>',
  'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.4.9-1.4 1.7"/><path d="M12 17h0"/>',
  'file-text': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
  files: '<path d="M9 3h7l3 3v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M16 3v4h3"/><path d="M5 7v12a2 2 0 0 0 2 2h8"/>',
  stack: '<path d="M12 4 3 9l9 5 9-5z"/><path d="M3 14l9 5 9-5"/>',
  'file-invoice': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 9h2M9 13h6M9 16h6"/>',
  'layout-dashboard': '<rect x="4" y="4" width="7" height="9" rx="1"/><rect x="13" y="4" width="7" height="5" rx="1"/><rect x="13" y="11" width="7" height="9" rx="1"/><rect x="4" y="15" width="7" height="5" rx="1"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h0M8 16.5h0"/>',
  building: '<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M15 9h3a1 1 0 0 1 1 1v11"/><path d="M3 21h18"/><path d="M9 7h0M12 7h0M9 11h0M12 11h0M9 15h0M12 15h0"/>',
  'message-chatbot': '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2z"/><path d="M9.5 10h0M14.5 10h0"/>',
  forms: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5"/>',
  'circuit-cell': '<rect x="4" y="8" width="13" height="8" rx="1"/><path d="M17 11h3v2h-3"/><path d="M8 8V6M12 8V6"/>',
  'layout-grid': '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  'building-bank': '<path d="M3 21h18"/><path d="M5 21v-9M19 21v-9M9.5 21v-9M14.5 21v-9"/><path d="M4 9l8-5 8 5z"/>',
  plant: '<path d="M12 21v-8"/><path d="M12 13c0-3 2-5 5.5-5C17.5 11.5 15 13 12 13z"/><path d="M12 16c0-3-2.5-4.5-5.5-4.5C6.5 14.5 9 16 12 16z"/>',
  'plant-2': '<path d="M12 21V8"/><path d="M12 12c-1-3-4-4-6.5-4C5.5 11 8.5 13 12 12z"/><path d="M12 10c1-2.5 3.5-3.5 6-3.5C18 9 15.5 11 12 10z"/>',
  trees: '<path d="M9 13 6 17h6z"/><path d="M9 9 6.5 13h5z"/><path d="M9 17v4"/><path d="M16 16l-2-4-2 4z"/><path d="M14 21v-5"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.6-.5-1 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"/><path d="M7.5 12h0M10 8h0M14.5 8.5h0"/>',
  brush: '<path d="M4 20s.8-3 3.5-3 2.7-2 2.7-2"/><path d="M16.5 3.5 20.5 7.5 13 15l-4-4z"/>',
  sparkles: '<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/><path d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4.5L4 9"/><path d="M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 15"/><path d="M20 19v-4h-4"/>',
  bolt: '<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.5 2"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9.5h16M8 3v4M16 3v4"/>',
};
function icon(id, cls) {
  const p = ICON_PATHS[id] || ICON_PATHS['help-circle'];
  return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
}
const CHECK_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';

/* ── Data ────────────────────────────────────────────────────── */
const TYPES = [
  { id: 'website', name: 'Website', desc: 'A new business website', icon: 'world' },
  { id: 'tool', name: 'Calculator or tool', desc: 'Quote engine, AI tool, configurator', icon: 'calculator' },
  { id: 'system', name: 'Bespoke system', desc: 'CRM, CMS, or custom platform', icon: 'database' },
  { id: 'ai', name: 'AI integration', desc: 'Add AI to an existing product', icon: 'brain' },
  { id: 'combo', name: 'Website + system', desc: 'Full platform from scratch', icon: 'layers-intersect' },
  { id: 'unsure', name: 'Not sure yet', desc: 'Help me figure out what I need', icon: 'help-circle' },
];

const STEP2_META = {
  website: { title: 'How big does the website need to be?', sub: 'More pages = more content, more design, more build time.' },
  tool: { title: 'What kind of tool are you building?', sub: 'More complexity = more logic, more integrations, more time.' },
  system: { title: 'What scale of system do you need?', sub: 'Complexity drives cost more than size here.' },
  ai: { title: 'What type of AI integration?', sub: 'Deeper integration = more training, more testing, more time.' },
  combo: { title: 'What scale is this platform?', sub: "We'll scope the detail together after this." },
  unsure: { title: 'Roughly how much are you looking to invest?', sub: 'No commitment — this just calibrates the estimate.' },
};

const SCALE_SETS = {
  website: [
    { id: 'small', name: 'Small — 4–6 pages', desc: 'Brochure or landing page site', icon: 'file-text', price: 2999 },
    { id: 'medium', name: 'Medium — 7–12 pages', desc: 'Growing business with more content', icon: 'files', price: 3999 },
    { id: 'large', name: 'Large — 13+ pages', desc: 'Complex site with lots of content', icon: 'stack', price: 5500 },
  ],
  tool: [
    { id: 'calculator', name: 'Simple calculator', desc: 'Single-step, one output', icon: 'calculator', price: 2000 },
    { id: 'quote', name: 'Quote engine', desc: 'Multi-step with conditional logic', icon: 'file-invoice', price: 4000 },
    { id: 'ai-tool', name: 'AI-powered tool', desc: 'Conversational or intelligent outputs', icon: 'brain', price: 4500 },
  ],
  system: [
    { id: 'starter', name: 'Starter system', desc: 'Basic CRM or content management', icon: 'layout-dashboard', price: 5000 },
    { id: 'professional', name: 'Professional system', desc: 'Full CRM with custom modules', icon: 'server', price: 10000 },
    { id: 'enterprise', name: 'Enterprise platform', desc: 'Fully bespoke, replace all off-the-shelf tools', icon: 'building', price: 20000 },
  ],
  ai: [
    { id: 'chatbot', name: 'Chatbot or assistant', desc: 'Conversational AI on your site', icon: 'message-chatbot', price: 2000 },
    { id: 'smart-forms', name: 'Smart forms & inputs', desc: 'AI-assisted suggestions and routing', icon: 'forms', price: 1500 },
    { id: 'full-ai', name: 'Full AI layer', desc: 'AI woven into your existing product', icon: 'circuit-cell', price: 3000 },
  ],
  combo: [
    { id: 'starter', name: 'Starter — web + system', desc: '5-page site with simple CRM', icon: 'layout-grid', price: 5000 },
    { id: 'professional', name: 'Professional — web + system', desc: '10+ pages, full CRM & bespoke module', icon: 'server', price: 10000 },
    { id: 'enterprise', name: 'Enterprise — full platform', desc: 'Unlimited pages, fully bespoke system', icon: 'building-bank', price: 20000 },
  ],
  unsure: [
    { id: 'small', name: 'Something small', desc: 'Under £5k — quick win', icon: 'plant', price: 2500 },
    { id: 'medium', name: 'Medium project', desc: '£5k–£15k — proper build', icon: 'plant-2', price: 8000 },
    { id: 'large', name: 'Large project', desc: '£15k+ — significant investment', icon: 'trees', price: 15000 },
  ],
};

const FEATURE_SETS = {
  website: [['Lead capture forms', 400], ['Blog / news section', 600], ['eCommerce / shop', 2500], ['SEO package', 1500], ['Booking / scheduling', 800], ['Members area', 1200], ['Analytics dashboard', 600], ['Multi-language', 1200]],
  tool: [['CRM integration', 800], ['PDF output', 600], ['Email automation', 700], ['Advanced analytics', 600], ['Multi-language', 1200], ['API / webhooks', 900], ['White label', 1000], ['Payment integration', 1000]],
  system: [['AI layer', 2000], ['eCommerce / payments', 2500], ['API integrations', 900], ['Advanced reporting', 700], ['Multi-user accounts', 800], ['Mobile app', 4000], ['Email automation', 700], ['Custom dashboards', 800]],
  ai: [['Lead capture', 400], ['CRM integration', 800], ['Training on your content', 600], ['Multilingual support', 1200], ['Analytics dashboard', 600], ['Email routing', 400], ['Custom personality', 400], ['Live handoff to human', 500]],
  combo: [['AI layer', 2000], ['eCommerce / payments', 2500], ['SEO package', 1500], ['API integrations', 900], ['Email automation', 700], ['Advanced reporting', 700], ['Multi-language', 1200], ['Mobile app', 4000]],
  unsure: [['Lead capture', 400], ['eCommerce', 2500], ['AI features', 2000], ['CRM integration', 800], ['SEO', 1500], ['Analytics', 500], ['Email automation', 700], ['Custom design', 800]],
};

const BRANDS = [
  { id: 'full', name: 'Yes — full brand', desc: 'Logo, colours, typography ready to go', icon: 'palette', price: 0 },
  { id: 'partial', name: 'Partial — some assets', desc: 'Some assets but not everything', icon: 'brush', price: 750 },
  { id: 'none', name: 'No brand yet', desc: 'Need identity created as part of this', icon: 'sparkles', price: 1500 },
  { id: 'refresh', name: 'Needs refreshing', desc: 'Existing brand that needs updating', icon: 'refresh', price: 1000 },
];

const TIMELINES = [
  { id: 'asap', name: 'ASAP', desc: 'Rush — as soon as possible', icon: 'bolt', mult: 1.2 },
  { id: '1-2months', name: '1–2 months', desc: 'Standard pace', icon: 'clock', mult: 1.0 },
  { id: '3plus', name: '3+ months', desc: 'Planned — no rush', icon: 'calendar', mult: 1.0 },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
function fmt(n) { return '£' + Number(n).toLocaleString('en-GB'); }

(function () {
  const panel = document.getElementById('bccPanel');
  const progress = document.getElementById('bccProgress');
  const summary = document.getElementById('bccSummary');
  if (!panel) return;

  const state = {
    step: 1,
    types: new Set(),   // selected build-type ids (multi-select)
    scales: {},         // { typeId: scaleId } — one scale per selected type
    features: new Set(),// selected feature names (merged across types)
    brand: null,
    timeline: null,
  };

  /* ── Selection helpers ────────────────────────────────────── */
  function selectedTypes() { return TYPES.filter((t) => state.types.has(t.id)); }
  function scaleOptFor(typeId) { return (SCALE_SETS[typeId] || []).find((o) => o.id === state.scales[typeId]); }
  function allScalesChosen() { return [...state.types].every((id) => state.scales[id]); }
  function mergedFeatures() {
    const seen = new Set(); const list = [];
    selectedTypes().forEach((t) => FEATURE_SETS[t.id].forEach(([name, price]) => {
      if (!seen.has(name)) { seen.add(name); list.push([name, price]); }
    }));
    return list;
  }
  // Remove stale scales/features after the type selection changes.
  function pruneState() {
    Object.keys(state.scales).forEach((id) => { if (!state.types.has(id)) delete state.scales[id]; });
    const valid = new Set(mergedFeatures().map(([n]) => n));
    [...state.features].forEach((n) => { if (!valid.has(n)) state.features.delete(n); });
  }

  /* ── Pricing ──────────────────────────────────────────────── */
  function compute() {
    const base = selectedTypes().reduce((s, t) => s + (scaleOptFor(t.id) ? scaleOptFor(t.id).price : 0), 0);
    const brandAdd = brandOpt() ? brandOpt().price : 0;
    const featMap = new Map(mergedFeatures());
    const featAdd = [...state.features].reduce((s, n) => s + (featMap.get(n) || 0), 0);
    const subtotal = base + brandAdd + featAdd;
    const mult = timelineOpt() ? timelineOpt().mult : 1;
    return { base, brandAdd, featAdd, subtotal, mult, total: Math.round(subtotal * mult) };
  }
  function brandOpt() { return BRANDS.find((b) => b.id === state.brand); }
  function timelineOpt() { return TIMELINES.find((t) => t.id === state.timeline); }

  /* ── Progress indicator ───────────────────────────────────── */
  function renderProgress() {
    let html = '';
    for (let i = 1; i <= 6; i++) {
      const cls = i < state.step ? 'done' : (i === state.step ? 'active' : '');
      html += '<span class="bcc-prog-dot ' + cls + '"></span>';
      if (i < 6) html += '<span class="bcc-prog-line ' + (i < state.step ? 'done' : '') + '"></span>';
    }
    progress.innerHTML = html;
  }

  /* ── Builders ─────────────────────────────────────────────── */
  // selectedId may be a string (single) or a Set (multi)
  function cardsHtml(options, selected, cols, typeAttr) {
    const isSel = (id) => (selected instanceof Set ? selected.has(id) : id === selected);
    const ta = typeAttr ? ' data-type="' + esc(typeAttr) + '"' : '';
    return '<div class="bcc-grid cols-' + cols + '">' + options.map((o) =>
      '<button type="button" class="bcc-card' + (isSel(o.id) ? ' sel' : '') + '" data-id="' + esc(o.id) + '"' + ta + '>' +
        icon(o.icon, 'bcc-card-ico') +
        '<span class="bcc-card-name">' + esc(o.name) + '</span>' +
        '<span class="bcc-card-desc">' + esc(o.desc) + '</span>' +
      '</button>'
    ).join('') + '</div>';
  }
  function pillsHtml(features) {
    return '<div class="bcc-pills">' + features.map(([name]) =>
      '<button type="button" class="bcc-pill' + (state.features.has(name) ? ' sel' : '') + '" data-name="' + esc(name) + '">' +
        '<span class="bcc-pill-check">' + CHECK_SVG + '</span>' + esc(name) +
      '</button>'
    ).join('') + '</div>';
  }
  function navHtml(opts) {
    const back = state.step > 1 ? '<button type="button" class="bcc-btn" data-act="back">&larr; Back</button>' : '<span></span>';
    const next = opts.nextLabel
      ? '<button type="button" class="bcc-btn bcc-btn-primary" data-act="next"' + (opts.nextDisabled ? ' disabled' : '') + '>' + opts.nextLabel + '</button>'
      : '';
    return '<div class="bcc-nav">' + back + '<span class="bcc-nav-spacer"></span>' + next + '</div>';
  }
  function head(label, title, sub) {
    return '<div class="bcc-step-label">' + esc(label) + '</div>' +
      '<h2 class="bcc-step-title">' + esc(title) + '</h2>' +
      '<p class="bcc-step-sub">' + esc(sub) + '</p>';
  }

  /* ── Running-total panel (sticky, right column) ───────────── */
  function renderSummary() {
    if (!summary) return;
    const c = compute();
    const items = breakdownItems();
    const top =
      '<span class="bcc-sum-eyebrow">Your estimate</span>' +
      '<div class="bcc-sum-total">' + fmt(c.total) + '</div>' +
      '<span class="bcc-sum-lbl">Running total · ex. VAT</span>';
    if (!items.length) {
      summary.innerHTML = top +
        '<div class="bcc-sum-empty">Your running total builds up here as you make your choices.</div>';
      return;
    }
    const itemsHtml = items.map((it) =>
      '<div class="bcc-sum-item"><span class="bcc-sum-name">' + esc(it.label) + '</span>' +
      '<span class="bcc-sum-amt' + (it.add ? ' add' : '') + (it.muted ? ' muted' : '') + '">' + esc(it.amount) + '</span></div>'
    ).join('');
    summary.innerHTML = top +
      '<div class="bcc-sum-div"></div>' +
      '<div class="bcc-sum-items">' + itemsHtml + '</div>' +
      '<p class="bcc-sum-note">A guide estimate — the final fixed-price quote is scoped to your exact requirements.</p>';
  }

  /* ── Render each step ─────────────────────────────────────── */
  function render() {
    renderProgress();
    if (state.step === 1) renderStep1();
    else if (state.step === 2) renderStep2();
    else if (state.step === 3) renderStep3();
    else if (state.step === 4) renderStep4();
    else if (state.step === 5) renderStep5();
    else renderStep6();
    renderSummary();
    wire();
  }

  function renderStep1() {
    panel.innerHTML =
      head('Step 1 of 6', 'What are you looking to build?', 'Select everything that applies — you can pick more than one.') +
      cardsHtml(TYPES, state.types, 3) +
      navHtml({ nextLabel: 'Next &rarr;', nextDisabled: state.types.size === 0 });
  }

  function renderStep2() {
    pruneState();
    const types = selectedTypes();
    let body;
    if (types.length === 1) {
      const t = types[0];
      panel.innerHTML =
        head('Step 2 of 6', STEP2_META[t.id].title, STEP2_META[t.id].sub) +
        cardsHtml(SCALE_SETS[t.id], state.scales[t.id], SCALE_SETS[t.id].length === 2 ? 2 : 3, t.id) +
        navHtml({ nextLabel: 'Next &rarr;', nextDisabled: !allScalesChosen() });
      return;
    }
    body = types.map((t) =>
      '<div class="bcc-group"><div class="bcc-group-label">' + icon(t.icon) + esc(t.name) + '</div>' +
      cardsHtml(SCALE_SETS[t.id], state.scales[t.id], SCALE_SETS[t.id].length === 2 ? 2 : 3, t.id) + '</div>'
    ).join('');
    panel.innerHTML =
      head('Step 2 of 6', 'How big is each part?', "Pick a scale for each thing you're building.") +
      body +
      navHtml({ nextLabel: 'Next &rarr;', nextDisabled: !allScalesChosen() });
  }

  function renderStep3() {
    pruneState();
    panel.innerHTML =
      head('Step 3 of 6', 'Which features matter most?', 'Select everything that applies — you can add more later.') +
      pillsHtml(mergedFeatures()) +
      navHtml({ nextLabel: 'Next &rarr;', nextDisabled: false });
  }
  function renderStep4() {
    panel.innerHTML =
      head('Step 4 of 6', 'Do you already have a brand?', 'This tells us how much design work is needed from scratch.') +
      cardsHtml(BRANDS, state.brand, 2) +
      navHtml({ nextLabel: 'Next &rarr;', nextDisabled: !state.brand });
  }
  function renderStep5() {
    panel.innerHTML =
      head('Step 5 of 6', 'When do you need this live?', 'Tighter timelines sometimes need more resource — this affects the estimate.') +
      cardsHtml(TIMELINES, state.timeline, 3) +
      navHtml({ nextLabel: 'See my estimate &rarr;', nextDisabled: !state.timeline });
  }

  function breakdownItems() {
    const c = compute();
    const featMap = new Map(mergedFeatures());
    const items = [];
    selectedTypes().forEach((t) => { const o = scaleOptFor(t.id); if (o) items.push({ label: o.name, amount: fmt(o.price) }); });
    if (brandOpt() && c.brandAdd > 0) items.push({ label: brandOpt().name, amount: '+' + fmt(c.brandAdd), add: true });
    mergedFeatures().forEach(([name]) => {
      if (state.features.has(name)) items.push({ label: name, amount: '+' + fmt(featMap.get(name)), add: true });
    });
    if (c.mult === 1.2) items.push({ label: 'Rush timeline (×1.2)', amount: 'included', muted: true });
    return items;
  }

  function renderStep6() {
    panel.innerHTML =
      head('Your estimate', "Here's what your build looks like", "Your running total is on the right — send it over and I'll come back with a fixed-price quote.") +
      '<div class="bcc-form-card">' +
        '<p class="bcc-form-sub">I\'ll review your answers and send a detailed, fixed-scope quote within one working day. No obligation.</p>' +
        '<form id="bccForm" novalidate>' +
          '<div class="bcc-form-grid">' +
            '<div class="bcc-field" id="bccField-name"><label for="bccName">Your name</label><input type="text" id="bccName" class="bcc-input" placeholder="e.g. Alex Chen" autocomplete="name"><div class="bcc-error">Please enter your name.</div></div>' +
            '<div class="bcc-field" id="bccField-email"><label for="bccEmail">Your email</label><input type="email" id="bccEmail" class="bcc-input" placeholder="you@company.com" autocomplete="email"><div class="bcc-error">Please enter a valid email address.</div></div>' +
          '</div>' +
          '<div class="bcc-field"><label for="bccBusiness">Business name <span style="color:var(--color-text-muted);font-weight:400">(optional)</span></label><input type="text" id="bccBusiness" class="bcc-input" placeholder="Your company" autocomplete="organization"></div>' +
          '<div class="bcc-field"><label for="bccNotes">Anything else? <span style="color:var(--color-text-muted);font-weight:400">(optional)</span></label><input type="text" id="bccNotes" class="bcc-input" placeholder="Specific requirements, integrations, questions…"></div>' +
          '<input type="text" id="bccHp" name="website" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<button type="submit" class="bcc-btn bcc-btn-primary bcc-btn-full" id="bccSend">Send my quote request &rarr;</button>' +
          '<div class="bcc-form-msg" id="bccFormMsg"></div>' +
        '</form>' +
      '</div>' +
      '<div class="bcc-nav"><button type="button" class="bcc-btn" data-act="back">&larr; Back</button><span class="bcc-nav-spacer"></span><button type="button" class="bcc-link" data-act="reset">Start again</button></div>';
  }

  /* ── Scroll the tool back into view on step change ────────── */
  function scrollToTool() {
    const top = document.getElementById('calculator').getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  /* ── Wire events for the current panel ────────────────────── */
  function wire() {
    panel.querySelectorAll('.bcc-card').forEach((btn) => {
      btn.addEventListener('click', () => onCardPick(btn.dataset.id, btn.dataset.type));
    });
    panel.querySelectorAll('.bcc-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const n = btn.dataset.name;
        if (state.features.has(n)) state.features.delete(n); else state.features.add(n);
        btn.classList.toggle('sel');
      });
    });
    panel.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'next' && !btn.disabled) { state.step++; render(); scrollToTool(); }
        else if (act === 'back') { state.step--; render(); scrollToTool(); }
        else if (act === 'reset') resetAll();
      });
    });
    const form = document.getElementById('bccForm');
    if (form) form.addEventListener('submit', onSubmit);
  }

  function onCardPick(id, typeCtx) {
    if (state.step === 1) {
      if (state.types.has(id)) state.types.delete(id); else state.types.add(id);
      pruneState();
    } else if (state.step === 2) {
      state.scales[typeCtx] = id;        // one scale per type group
    } else if (state.step === 4) {
      state.brand = id;
    } else if (state.step === 5) {
      state.timeline = id;
    }
    render();
  }

  function resetAll() {
    state.step = 1; state.types.clear(); state.scales = {}; state.features.clear();
    state.brand = null; state.timeline = null;
    render();
    scrollToTool();
  }

  /* ── Submit to Resend ─────────────────────────────────────── */
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

  async function onSubmit(e) {
    e.preventDefault();
    const nameF = document.getElementById('bccField-name');
    const emailF = document.getElementById('bccField-email');
    const nameEl = document.getElementById('bccName');
    const emailEl = document.getElementById('bccEmail');
    const msg = document.getElementById('bccFormMsg');
    const btn = document.getElementById('bccSend');
    nameF.classList.remove('bcc-invalid'); emailF.classList.remove('bcc-invalid');
    msg.className = 'bcc-form-msg';

    let ok = true;
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    if (!name) { nameF.classList.add('bcc-invalid'); ok = false; }
    if (!isEmail(email)) { emailF.classList.add('bcc-invalid'); ok = false; }
    if (!ok) return;

    const c = compute();
    const items = breakdownItems().map((it) => ({ label: it.label, amount: it.amount }));
    const business = document.getElementById('bccBusiness').value.trim();
    const notes = document.getElementById('bccNotes').value.trim();
    const hp = document.getElementById('bccHp');

    const showErr = (m) => {
      btn.disabled = false; btn.innerHTML = 'Send my quote request &rarr;';
      msg.className = 'bcc-form-msg show err';
      msg.textContent = m || 'Something went wrong — please try again.';
    };

    btn.disabled = true; btn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/build-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, business, notes,
          website: hp ? hp.value : '',
          build_type: selectedTypes().map((t) => t.name).join(', '),
          scale: selectedTypes().map((t) => scaleOptFor(t.id) ? scaleOptFor(t.id).name : '—').join(', '),
          features: [...state.features],
          brand: brandOpt() ? brandOpt().name : '—',
          timeline: timelineOpt() ? timelineOpt().name : '—',
          total: fmt(c.total),
          items,
        }),
      });
      const data = await res.json();
      if (data.success) {
        btn.remove();
        msg.className = 'bcc-form-msg show ok';
        msg.textContent = data.message || ('Done. I\'ll follow up at ' + email + ' within one working day.');
      } else {
        showErr(data.message);
      }
    } catch (err) {
      showErr();
    }
  }

  render();
})();
