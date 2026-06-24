/* ============================================================
   Forward Deployment Map
   Client-side gap analysis + coaching + Resend email delivery.

   Email sends server-side via /api/fde-map.js (Resend),
   reusing the same RESEND_API_KEY already configured for the
   other tools. No third-party keys in this file.
   ============================================================ */

const BC_CONTACT_EMAIL = 'hello@leongovier.com';

const DIMS = [
  {
    id: 'problem',
    name: 'Problem definition',
    q: 'Can you prove this is a real problem worth solving?',
    what: 'Stakeholders reject business cases that start with a solution. The strongest cases open with undeniable evidence that the problem exists, is significant, and is unsolved by current approaches.',
    fix: 'Talk to three people who experience this problem today. Document what they said, how long the problem takes to work around, and what it costs them. That\'s your problem definition.',
    proven: 'You can present a crisp problem statement backed by primary research, quantify the problem in time, cost, or risk, and explain why existing solutions are insufficient. No stakeholder can question whether the problem is real.',
    arts: [
      '3–5 stakeholder interviews with synthesised pain points',
      'Problem statement: who, what, root cause, consequence',
      'Current-state process map showing where the problem occurs',
      'Quantified problem size: time lost, cost, error rate, or risk exposure',
      'Evidence that existing tools or processes don\'t solve it',
    ],
  },
  {
    id: 'solution',
    name: 'Solution design',
    q: 'Can you show how the AI actually solves it — end to end?',
    what: 'A vague "AI will help" claim gets shot down in any serious review. Stakeholders need to see the mechanism: what data goes in, what the model does, what comes out, and where humans stay in the loop.',
    fix: 'Draw the system from data input to decision output. Add one human checkpoint and one failure mode. That diagram is your solution design. Narrate the tradeoffs in one paragraph.',
    proven: 'You can walk any stakeholder through the solution end-to-end, explain every design decision, show where humans remain accountable, and anticipate the "what if it gets it wrong?" question before it\'s asked.',
    arts: [
      'End-to-end process diagram: input → model → output → human review',
      'Data requirements doc: what data is needed, where it comes from, how clean it is',
      'Human-in-the-loop design: where oversight sits and why',
      'Failure mode analysis: what happens when the model is wrong',
      'Build vs. buy decision with rationale',
    ],
  },
  {
    id: 'evidence',
    name: 'Evidence of value',
    q: 'Can you prove it works before asking for full investment?',
    what: 'Requests for large budgets without proof of concept get rejected. The strongest cases show a small, controlled test that demonstrates the approach works — before asking to scale.',
    fix: 'Run the smallest possible test. Even a manual simulation of the AI workflow on 10 real cases gives you before/after data. That pilot result is more persuasive than any projection.',
    proven: 'You have a documented pilot: a defined scope, a baseline measurement, a result, and a clear line between what the test proved and what it didn\'t. Stakeholders can see the logic from pilot to full deployment.',
    arts: [
      'Pilot design: scope, sample size, success criteria defined upfront',
      'Baseline metric captured before the pilot started',
      'Pilot results: what happened, measured against the baseline',
      'Honest scope statement: what the pilot proved and what it didn\'t',
      'Extrapolation rationale: how pilot results scale to full deployment',
    ],
  },
  {
    id: 'roi',
    name: 'ROI and cost',
    q: 'Can you show the numbers stack up — fully loaded?',
    what: 'Most AI business cases undercount cost and overcount benefit. Stakeholders who\'ve been burned before will challenge both. A credible ROI case shows the full cost, a conservative benefit estimate, and a payback period.',
    fix: 'List every cost: build time, API or licensing fees, integration, maintenance, training, and change management. Then list only the benefits you can measure directly. That gap is your honest ROI.',
    proven: 'You present a fully-loaded cost model, a conservative benefit estimate with stated assumptions, a payback period, and a sensitivity analysis showing the case holds even if benefits come in 30% lower than expected.',
    arts: [
      'Fully-loaded cost model: build, run, maintain, change management',
      'Conservative benefit estimate with stated assumptions',
      'Payback period calculation',
      'Sensitivity analysis: does the case hold if benefits underperform by 30%?',
      'Comparison to cost of doing nothing or continuing the current approach',
    ],
  },
  {
    id: 'risk',
    name: 'Risk and governance',
    q: 'Can you show you\'ve thought about what could go wrong?',
    what: 'Ungoverned AI initiatives get stopped at legal, compliance, or board review. Proactively addressing risk — model failure, data privacy, regulatory exposure, and change management — builds confidence and removes blockers.',
    fix: 'List the five things that could go wrong with this initiative. For each one, write one sentence on how you\'d detect it and one sentence on what you\'d do about it. That\'s your risk register.',
    proven: 'You present a risk register that covers model risk, data risk, regulatory risk, and change risk. You have a defined monitoring plan, a named owner for each risk, and a clear escalation path. Stakeholders leave feeling the initiative is well-governed, not reckless.',
    arts: [
      'Risk register: model, data, regulatory, and change management risks',
      'Monitoring plan: how you\'ll know if something goes wrong post-deployment',
      'Named risk owner for each material risk',
      'Regulatory and compliance pre-clearance (where applicable)',
      'Rollback or exit plan if the initiative underperforms',
    ],
  },
];

const RATINGS = ['None', 'Weak', 'Partial', 'Strong', 'Watertight'];
const FILL_C = ['#262630', '#e24b4a', '#ef9f27', '#378add', '#1d9e75'];
const LBL_C  = ['#555a6b', '#e24b4a', '#ef9f27', '#378add', '#1d9e75'];

/* ── Helpers ─────────────────────────────────────────────────── */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

(function () {
  const $ = (id) => document.getElementById(id);
  const els = {
    dims: $('bcDims'),
    pct: $('bcPct'), cov: $('bcCov'), gap: $('bcGap'),
    verdict: $('bcVerdict'), vTitle: $('bcVTitle'), vDesc: $('bcVDesc'),
    planWrap: $('bcPlanWrap'), planList: $('bcPlanList'),
    name: $('bcName'), email: $('bcEmail'), initiative: $('bcInitiative'),
    form: $('bcForm'), send: $('bcSend'), hp: $('bcHp'), formMsg: $('bcFormMsg'),
  };
  if (!els.dims) return;

  const scores = {};
  const notes = {};
  const rated = {};
  DIMS.forEach((d) => { scores[d.id] = 0; notes[d.id] = ''; rated[d.id] = false; });

  /* ── Build the accordion cards ───────────────────────────────── */
  function buildCards() {
    els.dims.innerHTML = DIMS.map((d) => `
      <div class="bc-card" id="bcCard-${d.id}">
        <div class="bc-head" data-toggle="${d.id}">
          <div>
            <div class="bc-name">${esc(d.name)}</div>
            <div class="bc-q">${esc(d.q)}</div>
          </div>
          <div class="bc-head-right">
            <div class="bc-track"><div class="bc-fill" id="bcFill-${d.id}"></div></div>
            <span class="bc-rl" id="bcRl-${d.id}">None</span>
            <span class="bc-chev" id="bcChev-${d.id}">▾</span>
          </div>
        </div>
        <div class="bc-body" id="bcBody-${d.id}">
          <div class="bc-body-inner">
            <p class="bc-what">${esc(d.what)}</p>
            <div class="bc-ratings">
              ${RATINGS.map((r, i) => `<button type="button" class="bc-rbtn" data-dim="${d.id}" data-score="${i}">${r}</button>`).join('')}
            </div>
            <input type="text" class="bc-evidence" data-note="${d.id}" placeholder="What evidence do you have? (optional)" autocomplete="off">
            <div class="bc-coach" id="bcCoach-${d.id}"></div>
          </div>
        </div>
      </div>`).join('');

    // Toggle accordions
    els.dims.querySelectorAll('[data-toggle]').forEach((head) => {
      head.addEventListener('click', () => toggleCard(head.dataset.toggle));
    });
    // Rating buttons
    els.dims.querySelectorAll('.bc-rbtn').forEach((btn) => {
      btn.addEventListener('click', () => setScore(btn.dataset.dim, parseInt(btn.dataset.score, 10)));
    });
    // Evidence notes
    els.dims.querySelectorAll('.bc-evidence').forEach((inp) => {
      inp.addEventListener('input', () => { notes[inp.dataset.note] = inp.value; });
    });
  }

  function toggleCard(id) {
    const body = $('bcBody-' + id);
    const willOpen = !body.classList.contains('open');
    // Accordion: only one card open at a time — close the others first.
    DIMS.forEach((d) => {
      const b = $('bcBody-' + d.id);
      const c = $('bcChev-' + d.id);
      if (b) b.classList.remove('open');
      if (c) c.style.transform = '';
    });
    if (willOpen) {
      body.classList.add('open');
      $('bcChev-' + id).style.transform = 'rotate(180deg)';
    }
  }

  function setScore(id, score) {
    scores[id] = score;
    rated[id] = true;
    const fill = $('bcFill-' + id);
    fill.style.width = (score / 4 * 100) + '%';
    fill.style.background = FILL_C[score];
    const rl = $('bcRl-' + id);
    rl.textContent = RATINGS[score];
    rl.style.color = LBL_C[score];
    $('bcCard-' + id).querySelectorAll('.bc-rbtn').forEach((b) => {
      b.classList.toggle('sel', parseInt(b.dataset.score, 10) === score);
    });
    renderCoach(id, score);
    update();
  }

  function renderCoach(id, score) {
    const d = DIMS.find((x) => x.id === id);
    const box = $('bcCoach-' + id);
    if (score === 4) {
      box.className = 'bc-coach show proven';
      box.innerHTML =
        '<div class="bc-coach-lbl">Status</div>' +
        '<div class="bc-coach-title" style="color:#1d9e75">Watertight — strong position</div>' +
        '<div class="bc-coach-body" style="margin:0">Solid evidence here. Make sure this dimension is clearly documented and easy for stakeholders to find and challenge. Maintain it as the initiative evolves.</div>';
    } else {
      const needed = d.arts.slice(score);
      box.className = 'bc-coach show';
      box.innerHTML =
        '<div class="bc-coach-lbl">Coaching — ' + esc(RATINGS[score]) + ' &rarr; ' + esc(RATINGS[Math.min(score + 1, 4)]) + '</div>' +
        '<div class="bc-coach-title">What to build next</div>' +
        '<div class="bc-coach-body">' + esc(d.fix) + '</div>' +
        '<div class="bc-coach-sub">Evidence that will strengthen your case:</div>' +
        '<div class="bc-arts">' +
          needed.map((a, i) => '<div class="bc-art"><span class="bc-art-n">' + (i + 1) + '.</span><span>' + esc(a) + '</span></div>').join('') +
        '</div>' +
        '<div class="bc-coach-sub">What Watertight looks like:</div>' +
        '<div class="bc-coach-body" style="margin:0">' + esc(d.proven) + '</div>';
    }
  }

  /* ── Live results ────────────────────────────────────────────── */
  function update() {
    const vals = DIMS.map((d) => scores[d.id]);
    const anyRated = DIMS.some((d) => rated[d.id]);
    if (!anyRated) return;

    const total = vals.reduce((a, b) => a + b, 0);
    const pct = Math.round(total / 20 * 100);
    const cov = vals.filter((v) => v >= 2).length;
    const minV = Math.min(...vals);
    const gap = DIMS[vals.indexOf(minV)];

    els.pct.textContent = pct + '%';
    els.cov.textContent = cov + ' / 5';
    els.gap.textContent = gap.name;

    let title, desc, bc, tc, bg;
    if (pct >= 80) {
      title = 'Strong business case'; tc = '#1d9e75'; bc = 'rgba(29,158,117,0.4)'; bg = 'rgba(29,158,117,0.06)';
      desc = 'You have solid evidence across most dimensions. Tighten your weakest area and make sure every claim is traceable to a source a CFO or Chief Risk Officer could verify.';
    } else if (pct >= 50) {
      title = 'Developing case — gaps to close'; tc = '#ef9f27'; bc = 'rgba(239,159,39,0.4)'; bg = 'rgba(239,159,39,0.06)';
      desc = 'Good foundation but real gaps that will attract pushback in a senior review. The build plan below shows what to prioritise to reach investment-ready fastest.';
    } else {
      title = 'Early stage — significant gaps'; tc = '#e24b4a'; bc = 'rgba(226,75,74,0.4)'; bg = 'rgba(226,75,74,0.06)';
      desc = 'Your case has gaps across multiple dimensions. A senior stakeholder will push back hard right now. Take it one dimension at a time — smallest provable evidence first.';
    }

    els.verdict.style.background = bg;
    els.verdict.style.borderColor = bc;
    els.vTitle.textContent = title;
    els.vTitle.style.color = tc;
    els.vDesc.textContent = desc;

    buildPlan();
    els.planWrap.classList.add('show');
  }

  function buildPlan() {
    const sorted = [...DIMS].sort((a, b) => scores[a.id] - scores[b.id]);
    els.planList.innerHTML = sorted.map((d, i) => {
      const sc = scores[d.id];
      const badge = i === 0
        ? '<span class="bc-badge bc-badge--now">Fix first</span>'
        : i <= 2
          ? '<span class="bc-badge bc-badge--next">Fix next</span>'
          : '<span class="bc-badge bc-badge--later">Polish later</span>';
      const action = sc === 4
        ? 'Watertight. Maintain and keep it current as the initiative evolves.'
        : sc === 3
          ? 'Strong. One more piece of evidence gets you to Watertight. ' + d.fix
          : RATINGS[sc] + ' evidence. Stakeholders will push back here. ' + d.fix;
      return '<div class="bc-plan-row">' +
        '<span class="bc-plan-num">' + (i + 1) + '</span>' +
        '<div><div class="bc-plan-name">' + esc(d.name) + ' <span class="bc-plan-rate">· ' + esc(RATINGS[sc]) + '</span></div>' +
        '<div class="bc-plan-action">' + esc(action) + '</div></div>' +
        badge +
      '</div>';
    }).join('');
  }

  /* ── Plain-text report (for the email payload) ───────────────── */
  function buildReportText(name, email, initiative) {
    const vals = DIMS.map((d) => scores[d.id]);
    const total = vals.reduce((a, b) => a + b, 0);
    const pct = Math.round(total / 20 * 100);
    const cov = vals.filter((v) => v >= 2).length;
    const sorted = [...DIMS].sort((a, b) => scores[a.id] - scores[b.id]);
    const DIV = '─'.repeat(40);

    const lines = [];
    lines.push('AI BUSINESS CASE GAP MAP');
    lines.push('Initiative:     ' + (initiative || 'Not specified'));
    lines.push('Prepared for:   ' + name + ' (' + email + ')');
    lines.push('Case strength:  ' + pct + '%   ·   Dimensions covered: ' + cov + ' / 5');
    lines.push('', DIV, '', 'DIMENSION SCORES', '');
    DIMS.forEach((d) => {
      lines.push(d.name + ': ' + RATINGS[scores[d.id]] + ' (' + scores[d.id] + '/4)' + (notes[d.id] ? ' — ' + notes[d.id] : ''));
    });
    lines.push('', DIV, '', 'PRIORITISED BUILD PLAN', '');
    sorted.forEach((d, i) => {
      const sc = scores[d.id];
      const tag = i === 0 ? 'FIX FIRST' : (i <= 2 ? 'FIX NEXT' : 'POLISH LATER');
      lines.push((i + 1) + '. [' + tag + '] ' + d.name + ' — ' + RATINGS[sc]);
      lines.push('   ' + (sc === 4 ? 'Watertight. Maintain and keep it current.' : d.fix));
      lines.push('');
    });
    lines.push(DIV, '', 'YOUR TWO BIGGEST GAPS', '');
    sorted.slice(0, 2).forEach((d) => {
      lines.push('▸ ' + d.name);
      lines.push('  What Watertight looks like: ' + d.proven);
      lines.push('  Evidence to build:');
      d.arts.slice(scores[d.id]).forEach((a, i) => lines.push('    ' + (i + 1) + '. ' + a));
      lines.push('');
    });
    lines.push(DIV, 'Generated by the Forward Deployment Map', 'leongovier.digital', '');
    return lines.join('\n');
  }

  /* ── Email submit ────────────────────────────────────────────── */
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
  function setError(key) { const f = $('bcField-' + key); if (f) f.classList.add('bc-invalid'); }
  function clearError(key) { const f = $('bcField-' + key); if (f) f.classList.remove('bc-invalid'); }
  function showFormMsg(type, html) { els.formMsg.className = 'bc-form-msg show ' + type; els.formMsg.innerHTML = html; }

  els.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ['name', 'email'].forEach(clearError);
    els.formMsg.className = 'bc-form-msg';

    let ok = true;
    const name = els.name.value.trim();
    const email = els.email.value.trim();
    if (!name) { setError('name'); ok = false; }
    if (!isEmail(email)) { setError('email'); ok = false; }
    if (!ok) return;

    if (!DIMS.some((d) => rated[d.id])) {
      showFormMsg('err', 'Please rate at least one dimension above first.');
      return;
    }

    const initiative = els.initiative.value.trim();
    const vals = DIMS.map((d) => scores[d.id]);
    const pct = Math.round(vals.reduce((a, b) => a + b, 0) / 20 * 100);
    const sorted = [...DIMS].sort((a, b) => scores[a.id] - scores[b.id]);
    const reportText = buildReportText(name, email, initiative);

    const onError = (message) => {
      els.send.disabled = false;
      els.send.innerHTML = 'Send my gap analysis &rarr;';
      showFormMsg('err', message ||
        ('Something went wrong — please try again or contact ' +
         '<a href="mailto:' + BC_CONTACT_EMAIL + '">' + BC_CONTACT_EMAIL + '</a>.'));
    };

    els.send.disabled = true;
    els.send.textContent = 'Sending…';

    try {
      const res = await fetch('/api/fde-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          initiative_name: initiative || 'Your AI initiative',
          case_strength: pct + '%',
          weakest: sorted[0].name,
          gap_1: sorted[0].name,
          gap_2: sorted[1].name,
          scores: DIMS.map((d) => ({ name: d.name, rating: RATINGS[scores[d.id]], score: scores[d.id] })),
          report_body: reportText,
          website: els.hp ? els.hp.value : '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        els.send.remove();
        showFormMsg('ok', 'Gap analysis sent to <strong>' + esc(email) + '</strong>. Check your inbox — it should arrive within a minute.');
      } else {
        onError(data.message);
      }
    } catch (err) {
      onError();
    }
  });

  buildCards();
})();
