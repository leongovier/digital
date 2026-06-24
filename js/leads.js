/* ────────────────────────────────────────────────────────────
   Private leads board — leongovier.digital/leads.html
   - Login (username + 8-digit PIN), validated server-side in prod.
   - Pipeline: New · Contacted · Quoted · Won · Lost
   - Click a lead → side drawer (details, notes, stage move).
   On localhost it runs against a seeded mock store so the UI is
   fully usable without the database; in production it calls
   /api/leads with the stored credentials on every request.
   ──────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var STAGES = [
    { key: 'new',       label: 'New',       color: 'var(--lds-stage-new)' },
    { key: 'contacted', label: 'Contacted', color: 'var(--lds-stage-contacted)' },
    { key: 'quoted',    label: 'Quoted',    color: 'var(--lds-stage-quoted)' },
    { key: 'won',       label: 'Won',       color: 'var(--lds-stage-won)' },
    { key: 'lost',      label: 'Lost',      color: 'var(--lds-stage-lost)' }
  ];
  var SOURCE_LABEL = {
    'contact': 'Contact', 'build-cost': 'Build Cost', 'value-matrix': 'Value Matrix',
    'eval': 'Eval', 'fde-map': 'Forward Deployment Map'
  };
  var IS_LOCAL = ['localhost', '127.0.0.1', ''].indexOf(location.hostname) !== -1;
  var CRED_KEY = 'lds_cred';

  var $ = function (id) { return document.getElementById(id); };
  var state = { leads: [], openId: null, cred: null };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function stageOf(key) { for (var i = 0; i < STAGES.length; i++) if (STAGES[i].key === key) return STAGES[i]; return STAGES[0]; }
  function timeAgo(ts) {
    var d = (Date.now() - new Date(ts).getTime()) / 1000;
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + 'm ago';
    if (d < 86400) return Math.floor(d / 3600) + 'h ago';
    if (d < 604800) return Math.floor(d / 86400) + 'd ago';
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  function fmtDate(ts) { return new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

  /* ── Data layer ──────────────────────────────────────────── */
  var realApi = {
    call: function (action, extra) {
      var body = Object.assign({ action: action }, state.cred, extra || {});
      return fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, data: j }; }); });
    },
    login: function () { return this.call('login'); },
    list: function () { return this.call('list'); },
    move: function (id, stage) { return this.call('move', { id: id, stage: stage }); },
    note: function (id, text) { return this.call('note', { id: id, text: text }); }
  };

  var mockApi = (function () {
    var KEY = 'lds_mock_v1';
    function seed() {
      var now = Date.now(), H = 3600000, D = 86400000;
      return [
        { id: 1, source: 'build-cost', name: 'Priya Shah', email: 'priya@northgatelending.co.uk', business: 'Northgate Lending', summary: 'AI-powered tool · £6,599', stage: 'new', created_at: new Date(now - 2 * H).toISOString(), updated_at: new Date(now - 2 * H).toISOString(), payload: { build_type: 'AI-powered tool', scale: 'Growth', timeline: 'Standard', total: '£6,599' }, notes: [] },
        { id: 2, source: 'contact', name: 'Tom Beswick', email: 'tom@beswickfinance.com', business: 'beswickfinance.com', summary: 'New website · Q3 start', stage: 'new', created_at: new Date(now - 9 * H).toISOString(), updated_at: new Date(now - 9 * H).toISOString(), payload: { project_type: 'Website', budget: '£8k–12k', start_date: 'Q3' }, notes: [] },
        { id: 3, source: 'value-matrix', name: 'Broker portal rebuild', email: 'h.kaur@lumencredit.io', business: 'Lumen Credit', summary: 'Verdict: Build it · +38', stage: 'contacted', created_at: new Date(now - 1 * D).toISOString(), updated_at: new Date(now - 5 * H).toISOString(), payload: { verdict_name: 'Build it', net_score: '+38' }, notes: [{ id: 91, body: 'Called — keen, sending availability for a scoping call next week.', created_at: new Date(now - 5 * H).toISOString() }] },
        { id: 4, source: 'fde-map', name: 'James Whitfield', email: 'james@whitfieldbridging.co.uk', business: 'Bridging affordability case', summary: 'Case strength: Moderate', stage: 'contacted', created_at: new Date(now - 2 * D).toISOString(), updated_at: new Date(now - 1 * D).toISOString(), payload: { case_strength: 'Moderate', weakest: 'Evidence' }, notes: [] },
        { id: 5, source: 'eval', name: 'Affordability eval framework', email: 'devs@cresta-fs.com', business: 'Cresta FS', summary: 'Use case: affordability checks', stage: 'quoted', created_at: new Date(now - 3 * D).toISOString(), updated_at: new Date(now - 2 * D).toISOString(), payload: { use_case: 'Affordability checks', sensitivity: 'High' }, notes: [{ id: 92, body: 'Quote sent — £4,500 fixed for the framework + 2 review sessions.', created_at: new Date(now - 2 * D).toISOString() }] },
        { id: 6, source: 'build-cost', name: 'Dana Okoro', email: 'dana@swiftmotorfinance.com', business: 'Swift Motor Finance', summary: 'Web + system · £11,200', stage: 'quoted', created_at: new Date(now - 4 * D).toISOString(), updated_at: new Date(now - 3 * D).toISOString(), payload: { build_type: 'Web + system', total: '£11,200' }, notes: [] },
        { id: 7, source: 'contact', name: 'Rachel Lindqvist', email: 'rachel@harbourassist.com', business: 'Harbour Assist', summary: 'CRM pipeline tool', stage: 'won', created_at: new Date(now - 9 * D).toISOString(), updated_at: new Date(now - 4 * D).toISOString(), payload: { project_type: 'CRM tool', budget: '£15k+' }, notes: [{ id: 93, body: 'Signed. Kickoff booked for Monday.', created_at: new Date(now - 4 * D).toISOString() }] },
        { id: 8, source: 'build-cost', name: 'Mark Devlin', email: 'mark@devlin-co.uk', business: 'Devlin & Co', summary: 'Starter website · £4,999', stage: 'lost', created_at: new Date(now - 14 * D).toISOString(), updated_at: new Date(now - 8 * D).toISOString(), payload: { build_type: 'Website', total: '£4,999' }, notes: [{ id: 94, body: 'Went with a cheaper template builder. Keep warm for phase 2.', created_at: new Date(now - 8 * D).toISOString() }] }
      ];
    }
    function read() { try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {} var s = seed(); write(s); return s; }
    function write(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
    function P(v) { return Promise.resolve(v); }
    return {
      login: function () { return P({ ok: true, data: { ok: true } }); },
      list: function () { return P({ ok: true, data: { ok: true, leads: read() } }); },
      move: function (id, stage) { var d = read(); for (var i = 0; i < d.length; i++) if (d[i].id === id) { d[i].stage = stage; d[i].updated_at = new Date().toISOString(); } write(d); return P({ ok: true, data: { ok: true } }); },
      note: function (id, text) { var d = read(), note = { id: Date.now(), body: text, created_at: new Date().toISOString() }; for (var i = 0; i < d.length; i++) if (d[i].id === id) { (d[i].notes = d[i].notes || []).push(note); d[i].updated_at = note.created_at; } write(d); return P({ ok: true, data: { ok: true, note: note } }); }
    };
  })();

  var api = IS_LOCAL ? mockApi : realApi;

  /* ── Auth ────────────────────────────────────────────────── */
  function loadCred() { try { var r = sessionStorage.getItem(CRED_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function saveCred(c) { try { sessionStorage.setItem(CRED_KEY, JSON.stringify(c)); } catch (e) {} }
  function clearCred() { try { sessionStorage.removeItem(CRED_KEY); } catch (e) {} }

  function showLogin() { $('ldsLogin').hidden = false; $('ldsApp').hidden = true; $('ldsUser').focus(); }
  function showApp() { $('ldsLogin').hidden = true; $('ldsApp').hidden = false; }

  function doLogin(e) {
    if (e) e.preventDefault();
    var user = $('ldsUser').value.trim(), pin = $('ldsPin').value.trim();
    var err = $('ldsLoginErr'), btn = $('ldsLoginBtn');
    err.textContent = '';
    if (!user || !pin) { err.textContent = 'Enter your username and PIN.'; return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    state.cred = { username: user, pin: pin };
    api.login().then(function (r) {
      btn.disabled = false; btn.textContent = 'Sign in';
      if (!r.ok) { err.textContent = (r.data && r.data.message) || 'Invalid username or PIN.'; state.cred = null; return; }
      saveCred(state.cred); $('ldsPin').value = '';
      showApp(); loadLeads();
    }).catch(function () { btn.disabled = false; btn.textContent = 'Sign in'; err.textContent = 'Could not reach the server.'; state.cred = null; });
  }

  function signOut() { clearCred(); state.cred = null; state.leads = []; closeDrawer(); showLogin(); }

  /* ── Board ───────────────────────────────────────────────── */
  function loadLeads() {
    var board = $('ldsBoard');
    if (!state.leads.length) board.innerHTML = '<div class="lds-loading" id="ldsLoading">Loading leads…</div>';
    api.list().then(function (r) {
      if (!r.ok) { if (r.data && r.data.message && /pin|auth/i.test(r.data.message)) return signOut(); board.innerHTML = '<div class="lds-loading">Could not load leads.</div>'; return; }
      state.leads = (r.data.leads || []).map(function (l) { l.id = typeof l.id === 'string' ? parseInt(l.id, 10) || l.id : l.id; l.notes = l.notes || []; return l; });
      renderBoard();
    }).catch(function () { board.innerHTML = '<div class="lds-loading">Could not load leads.</div>'; });
  }

  function renderBoard() {
    var board = $('ldsBoard');
    $('ldsCount').textContent = state.leads.length + (state.leads.length === 1 ? ' lead' : ' leads');
    board.innerHTML = '';
    STAGES.forEach(function (st) {
      var items = state.leads.filter(function (l) { return l.stage === st.key; });
      var col = document.createElement('div');
      col.className = 'lds-col';
      col.innerHTML =
        '<div class="lds-col-head"><span class="lds-dot" style="background:' + st.color + '"></span>' +
        '<span class="lds-col-name">' + st.label + '</span>' +
        '<span class="lds-col-count">' + items.length + '</span></div>' +
        '<div class="lds-col-body">' + (items.length ? items.map(cardHtml).join('') : '<div class="lds-empty">No leads</div>') + '</div>';
      board.appendChild(col);
    });
    [].forEach.call(board.querySelectorAll('.lds-card'), function (el) {
      el.addEventListener('click', function () { openDrawer(parseInt(el.getAttribute('data-id'), 10)); });
    });
  }

  function cardHtml(l) {
    var n = (l.notes || []).length;
    return '<div class="lds-card" data-id="' + esc(l.id) + '">' +
      '<div class="lds-card-top"><span class="lds-card-name">' + esc(l.name || l.email || 'Lead') + '</span>' +
      '<span class="lds-badge">' + esc(SOURCE_LABEL[l.source] || l.source) + '</span></div>' +
      (l.summary ? '<div class="lds-card-sub">' + esc(l.summary) + '</div>' : '') +
      '<div class="lds-card-meta"><span>' + timeAgo(l.created_at) + '</span>' +
      (n ? '<span class="lds-card-notes"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' + n + '</span>' : '') + '</div></div>';
  }

  /* ── Drawer ──────────────────────────────────────────────── */
  function openDrawer(id) {
    state.openId = id;
    renderDrawer();
    $('ldsOverlay').hidden = false; $('ldsDrawer').hidden = false; $('ldsDrawer').setAttribute('aria-hidden', 'false');
    void $('ldsDrawer').offsetWidth; // commit the closed state before transitioning
    $('ldsOverlay').classList.add('show'); $('ldsDrawer').classList.add('show');
  }
  function closeDrawer() {
    state.openId = null;
    var ov = $('ldsOverlay'), dr = $('ldsDrawer');
    ov.classList.remove('show'); dr.classList.remove('show'); dr.setAttribute('aria-hidden', 'true');
    setTimeout(function () { ov.hidden = true; dr.hidden = true; }, 300);
  }
  function currentLead() { for (var i = 0; i < state.leads.length; i++) if (state.leads[i].id === state.openId) return state.leads[i]; return null; }

  function renderDrawer() {
    var l = currentLead(); if (!l) return;
    var rows = [];
    if (l.email) rows.push(['Email', '<a href="mailto:' + esc(l.email) + '">' + esc(l.email) + '</a>']);
    if (l.business) rows.push(['Business', esc(l.business)]);
    rows.push(['Source', esc(SOURCE_LABEL[l.source] || l.source)]);
    rows.push(['Received', esc(fmtDate(l.created_at))]);
    var pay = l.payload || {};
    Object.keys(pay).forEach(function (k) {
      var v = pay[k]; if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
      if (Array.isArray(v)) v = v.join(', ');
      else if (typeof v === 'object') v = JSON.stringify(v);
      rows.push([prettyKey(k), esc(String(v))]);
    });

    var notes = (l.notes || []).slice().sort(function (a, b) { return new Date(a.created_at) - new Date(b.created_at); });
    var notesHtml = notes.length
      ? '<div class="lds-notes">' + notes.map(function (nt) {
          return '<div class="lds-note"><div class="lds-note-body">' + esc(nt.body) + '</div><div class="lds-note-time">' + esc(fmtDate(nt.created_at)) + '</div></div>';
        }).join('') + '</div>'
      : '<div class="lds-note-empty">No notes yet.</div>';

    $('ldsDrawer').innerHTML =
      '<div class="lds-drawer-head"><div><h2>' + esc(l.name || l.email || 'Lead') + '</h2>' +
        '<span class="lds-badge">' + esc(SOURCE_LABEL[l.source] || l.source) + '</span></div>' +
        '<button class="lds-drawer-close" id="ldsDrawerClose" aria-label="Close">&times;</button></div>' +
      '<div class="lds-drawer-body">' +
        '<div class="lds-sec"><p class="lds-sec-label">Stage</p><div class="lds-stage-pick">' +
          STAGES.map(function (st) {
            return '<button class="lds-stage-opt' + (st.key === l.stage ? ' active' : '') + '" data-stage="' + st.key + '" style="' + (st.key === l.stage ? 'color:' + st.color : '') + '">' +
              '<span class="lds-dot" style="background:' + st.color + '"></span>' + st.label + '</button>';
          }).join('') + '</div></div>' +
        '<div class="lds-sec"><p class="lds-sec-label">Details</p><div class="lds-detail">' +
          rows.map(function (r) { return '<div class="lds-detail-row"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span></div>'; }).join('') +
        '</div></div>' +
        '<div class="lds-sec"><p class="lds-sec-label">Notes</p>' + notesHtml +
          '<div class="lds-note-form"><textarea class="lds-textarea" id="ldsNoteText" placeholder="Add a note…"></textarea>' +
          '<button class="lds-note-add" id="ldsNoteAdd">Add note</button></div></div>' +
      '</div>';

    $('ldsDrawerClose').addEventListener('click', closeDrawer);
    [].forEach.call($('ldsDrawer').querySelectorAll('.lds-stage-opt'), function (b) {
      b.addEventListener('click', function () { moveStage(l.id, b.getAttribute('data-stage')); });
    });
    var addBtn = $('ldsNoteAdd'), ta = $('ldsNoteText');
    addBtn.addEventListener('click', function () { addNote(l.id, ta.value); });
  }

  function prettyKey(k) { return k.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }

  function moveStage(id, stage) {
    var l = currentLead(); if (!l || l.stage === stage) { if (l) { l.stage = stage; } }
    var prev = l ? l.stage : null;
    if (l) l.stage = stage;
    renderDrawer(); renderBoard();
    api.move(id, stage).then(function (r) {
      if (!r.ok) { if (l && prev) l.stage = prev; renderDrawer(); renderBoard(); alert((r.data && r.data.message) || 'Could not move lead.'); }
    });
  }

  function addNote(id, text) {
    text = (text || '').trim(); if (!text) return;
    var l = currentLead(); var btn = $('ldsNoteAdd');
    btn.disabled = true; btn.textContent = 'Adding…';
    api.note(id, text).then(function (r) {
      btn.disabled = false; btn.textContent = 'Add note';
      if (!r.ok) { alert((r.data && r.data.message) || 'Could not add note.'); return; }
      var note = (r.data && r.data.note) || { id: Date.now(), body: text, created_at: new Date().toISOString() };
      if (l) { l.notes = l.notes || []; l.notes.push(note); l.updated_at = note.created_at; }
      renderDrawer(); renderBoard();
    }).catch(function () { btn.disabled = false; btn.textContent = 'Add note'; alert('Could not add note.'); });
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    $('ldsLoginForm').addEventListener('submit', doLogin);
    $('ldsPin').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 8); });
    $('ldsRefresh').addEventListener('click', loadLeads);
    $('ldsSignout').addEventListener('click', signOut);
    $('ldsOverlay').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.openId != null) closeDrawer(); });

    var cred = loadCred();
    if (cred) { state.cred = cred; showApp(); loadLeads(); }
    else showLogin();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
