/* ============================================================
   Value Matrix ROI Scorer
   Live scoring + report delivery.

   Email is sent server-side via /api/scorer.js (Resend), which
   reuses the same RESEND_API_KEY already configured in Vercel
   for the contact form. No third-party keys live in this file.
   The endpoint emails the report to the user and a lead copy to
   the site owner.
   ============================================================ */

const VM_CONTACT_EMAIL = 'hello@leongovier.com';
const VM_SITE_URL = 'https://leongovier.digital/value-matrix.html';

/* Quadrant copy ------------------------------------------------ */
const VM_QUADRANTS = {
  build: {
    name: 'Build Now',
    emoji: '✅',
    colour: '#1D9E75',
    copy: 'High strategic value with a manageable implementation load. This is your beachhead candidate — strong upside without a heavy data, model-governance or SM&CR lift. Capture your baseline metric and target consumer outcome now so the ROI and Consumer Duty case is watertight at the end.',
    steps: [
      'Document your baseline metric and target consumer outcome this week.',
      'Scope the smallest shippable version and confirm the accountable SMF owner.',
      'Set a two-week delivery target and measure before and after.',
    ],
  },
  plan: {
    name: 'Plan Carefully',
    emoji: '📋',
    colour: '#378ADD',
    copy: 'High value but expensive to build — the data-protection, model-governance and SM&CR load is real. The return justifies the investment, but define your MVP and accountable owner before committing full resource.',
    steps: [
      'Identify the highest cost dimension (data, model risk or SM&CR) and attack it first.',
      'Run an early DPIA and model-risk assessment to size the governance work.',
      'Find a lightweight version that proves the value hypothesis before any full build decision.',
    ],
  },
  experiment: {
    name: 'Experiment',
    emoji: '🧪',
    colour: '#EF9F27',
    copy: 'Low cost means low regulatory and governance risk — worth a time-boxed spike. Set a clear exit criterion and a named owner before you start so it doesn\'t drift into an ungoverned permanent fixture.',
    steps: [
      'Set a hard two-week timebox with a named owner.',
      'Define success and your exit criterion before you begin.',
      'If it works, reassess the strategic value score — it may be higher than you thought.',
    ],
  },
  avoid: {
    name: 'Avoid',
    emoji: '❌',
    colour: '#E24B4A',
    copy: 'High implementation cost — data, model governance and SM&CR — with low strategic return. Unless the regulatory or commercial picture changes materially, redirect this resource to a higher-value initiative.',
    steps: [
      'Revisit in 90 days — regulatory expectations and data readiness change.',
      'Check whether a stripped-down version lowers the data and governance cost enough to shift the verdict.',
      'Run the scorer on your next candidate initiative instead.',
    ],
  },
};

/* Friendly labels for the breakdown + email ------------------- */
const VM_DIMENSION_LABELS = {
  revenue_impact: 'Revenue impact',
  fca_risk_reduction: 'FCA regulatory risk reduction',
  consumer_outcome: 'Consumer outcome improvement',
  competitive_differentiation: 'Competitive differentiation',
  operational_resilience: 'Operational resilience',
  data_readiness: 'Data readiness',
  data_compliance_overhead: 'Data compliance overhead',
  model_governance_burden: 'Model risk & governance burden',
  integration_complexity: 'Integration complexity',
  smcr_overhead: 'SM&CR overhead',
};

const VM_VALUE_KEYS = ['revenue_impact', 'fca_risk_reduction', 'consumer_outcome', 'competitive_differentiation', 'operational_resilience'];
const VM_COST_KEYS  = ['data_readiness', 'data_compliance_overhead', 'model_governance_burden', 'integration_complexity', 'smcr_overhead'];

(function () {
  const sliders = Array.from(document.querySelectorAll('input[data-score]'));
  if (!sliders.length) return;

  const els = {
    value:  document.getElementById('vmValue'),
    cost:   document.getElementById('vmCost'),
    net:    document.getElementById('vmNet'),
    verdict: document.getElementById('vmVerdict'),
    vName:  document.getElementById('vmVerdictName'),
    vNet:   document.getElementById('vmVerdictNet'),
    vCopy:  document.getElementById('vmVerdictCopy'),
  };

  const cells = Array.from(document.querySelectorAll('.vm-cell'));

  /* Build the dimension breakdown rows once, return a key→bar/value map */
  const breakRefs = {};
  (function buildBreakdown() {
    const cols = {
      value: document.querySelector('.vm-break-col[data-group="value"]'),
      cost: document.querySelector('.vm-break-col[data-group="cost"]'),
    };
    const make = (keys, col) => {
      keys.forEach((k) => {
        const row = document.createElement('div');
        row.className = 'vm-break-row';
        row.innerHTML =
          '<span class="vm-break-label">' + VM_DIMENSION_LABELS[k] + '</span>' +
          '<span class="vm-break-bar"></span>' +
          '<span class="vm-break-val">3 / 5</span>';
        col.appendChild(row);
        breakRefs[k] = { bar: row.querySelector('.vm-break-bar'), val: row.querySelector('.vm-break-val') };
      });
    };
    if (cols.value) make(VM_VALUE_KEYS, cols.value);
    if (cols.cost) make(VM_COST_KEYS, cols.cost);
  })();

  let lastKey = null;

  function avg(keys, scores) {
    const sum = keys.reduce((t, k) => t + scores[k], 0);
    return sum / keys.length;
  }

  function quadrantKey(value, cost) {
    const highValue = value >= 3;
    const highCost = cost >= 3;
    if (highValue && !highCost) return 'build';
    if (highValue && highCost) return 'plan';
    if (!highValue && !highCost) return 'experiment';
    return 'avoid';
  }

  function readScores() {
    const scores = {};
    sliders.forEach((s) => { scores[s.dataset.score] = parseInt(s.value, 10); });
    return scores;
  }

  function compute() {
    const scores = readScores();
    const value = avg(VM_VALUE_KEYS, scores);
    const cost = avg(VM_COST_KEYS, scores);
    const net = value - cost;
    return { scores, value, cost, net, key: quadrantKey(value, cost) };
  }

  function fmtSigned(n) {
    const r = (Math.round(n * 10) / 10).toFixed(1);
    return (n > 0 ? '+' : '') + r;
  }

  function render() {
    const r = compute();

    els.value.textContent = r.value.toFixed(1);
    els.cost.textContent = r.cost.toFixed(1);
    els.net.textContent = fmtSigned(r.net);

    // Update the per-slider value badges + breakdown rows
    sliders.forEach((s) => {
      const badge = document.querySelector('[data-val-for="' + s.dataset.score + '"]');
      if (badge) badge.textContent = s.value;
      const ref = breakRefs[s.dataset.score];
      if (ref) {
        const v = parseInt(s.value, 10);
        ref.val.textContent = v + ' / 5';
        ref.bar.style.setProperty('--fill', ((v - 1) / 4 * 100) + '%');
      }
    });

    // Highlight the active quadrant cell
    cells.forEach((c) => c.classList.toggle('active', c.dataset.cell === r.key));

    // Apply verdict copy from the latest computed state (never a stale closure)
    const applyVerdict = (res) => {
      const q = VM_QUADRANTS[res.key];
      els.verdict.style.setProperty('--vd', q.colour);
      els.vName.textContent = q.name;
      els.vName.style.color = q.colour;
      els.vNet.textContent = 'Net ' + fmtSigned(res.net);
      els.vCopy.textContent = q.copy;
    };

    if (r.key !== lastKey) {
      // Subtle fade on quadrant change — recompute on the far side so rapid
      // moves within the fade window can't be clobbered by a stale value.
      els.verdict.classList.add('vm-fading');
      clearTimeout(render._fadeTimer);
      render._fadeTimer = setTimeout(() => {
        applyVerdict(compute());
        els.verdict.classList.remove('vm-fading');
      }, 180);
    } else {
      applyVerdict(r);
    }
    lastKey = r.key;
  }

  sliders.forEach((s) => s.addEventListener('input', render));
  render();

  /* ── Report form ─────────────────────────────────────────── */
  const form = document.getElementById('vmForm');
  const nameInput = document.getElementById('vmName');
  const emailInput = document.getElementById('vmEmail');
  const fieldName = document.getElementById('vmFieldName');
  const fieldEmail = document.getElementById('vmFieldEmail');
  const submitBtn = document.getElementById('vmSubmit');
  const hp = document.getElementById('vmHp'); // honeypot
  const msg = document.getElementById('vmFormMsg');

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  function showMsg(type, html) {
    msg.className = 'vm-form-msg show ' + type;
    msg.innerHTML = html;
  }

  function buildParams() {
    const r = compute();
    const q = VM_QUADRANTS[r.key];
    const name = nameInput.value.trim();

    const stepsList = q.steps.map((s, i) => '(' + (i + 1) + ') ' + s).join(' ');

    const pad = (label) => (label + ':').padEnd(34, ' ');

    const report_body =
      'Initiative: ' + name + '\n\n' +
      'SCORES\n' +
      '──────────────────────────\n' +
      pad('Strategic Value') + r.value.toFixed(1) + ' / 5\n' +
      pad('Implementation Cost') + r.cost.toFixed(1) + ' / 5\n' +
      pad('Net Priority Score') + fmtSigned(r.net) + '\n\n' +
      'DIMENSION BREAKDOWN\n' +
      '──────────────────────────\n' +
      Object.keys(VM_DIMENSION_LABELS)
        .map((k) => pad(VM_DIMENSION_LABELS[k]) + r.scores[k] + ' / 5')
        .join('\n') + '\n\n' +
      'VERDICT\n' +
      '──────────────────────────\n' +
      q.name + ' — ' + q.copy + '\n\n' +
      'WHAT TO DO NEXT\n' +
      '──────────────────────────\n' +
      q.steps.map((s) => '• ' + s).join('\n') + '\n\n' +
      '──────────────────────────\n' +
      'Generated by the Value Matrix ROI Scorer\n' +
      VM_SITE_URL;

    return {
      initiative_name: name,
      email: emailInput.value.trim(),
      to_email: emailInput.value.trim(),
      strategic_value: r.value.toFixed(1),
      implementation_cost: r.cost.toFixed(1),
      net_score: fmtSigned(r.net),
      verdict_name: q.name,
      verdict: q.name + ' — ' + q.copy,
      next_steps: stepsList,
      // Per-dimension scores — Strategic Value
      revenue_impact: r.scores.revenue_impact,
      fca_risk_reduction: r.scores.fca_risk_reduction,
      consumer_outcome: r.scores.consumer_outcome,
      competitive_differentiation: r.scores.competitive_differentiation,
      operational_resilience: r.scores.operational_resilience,
      // Per-dimension scores — Implementation Cost
      data_readiness: r.scores.data_readiness,
      data_compliance_overhead: r.scores.data_compliance_overhead,
      model_governance_burden: r.scores.model_governance_burden,
      integration_complexity: r.scores.integration_complexity,
      smcr_overhead: r.scores.smcr_overhead,
      subject: 'Your Value Matrix score for ' + name,
      report_body: report_body,
    };
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Validate
    let ok = true;
    fieldName.classList.remove('vm-invalid');
    fieldEmail.classList.remove('vm-invalid');
    msg.className = 'vm-form-msg';

    if (!nameInput.value.trim()) { fieldName.classList.add('vm-invalid'); ok = false; }
    if (!isEmail(emailInput.value)) { fieldEmail.classList.add('vm-invalid'); ok = false; }
    if (!ok) return;

    const email = emailInput.value.trim();
    const params = buildParams();
    params.website = hp ? hp.value : ''; // honeypot

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const onError = (message) => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send my report &rarr;';
      showMsg('err', message ||
        ('Something went wrong — please try again or contact ' +
         '<a href="mailto:' + VM_CONTACT_EMAIL + '">' + VM_CONTACT_EMAIL + '</a>.'));
    };

    try {
      const res = await fetch('/api/scorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        submitBtn.remove();
        showMsg('ok',
          'Report sent to <strong>' + email + '</strong>. ' +
          'Check your inbox — it should arrive within a minute.');
      } else {
        onError(data.message);
      }
    } catch (err) {
      onError();
    }
  });
})();
