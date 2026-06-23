/* ============================================================
   Lightweight content protection for the tool pages.
   Discourages casual copying / printing so the generated
   results are obtained via the email option instead.

   NOTE: this is a deterrent, not real security — anyone with
   dev tools or "view source" can still read the page. It just
   blocks right-click, text selection/copy, and printing for
   ordinary visitors.

   Applied only to pages whose <body> has class="no-copy".
   ============================================================ */
(function () {
  if (!document.body || !document.body.classList.contains('no-copy')) return;

  const isField = (el) => !!el && (
    el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
  );

  // Right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Copy / cut (allow from form fields so people can reuse what they typed)
  ['copy', 'cut'].forEach((evt) => {
    document.addEventListener(evt, (e) => {
      if (isField(e.target)) return;
      e.preventDefault();
    });
  });

  // Drag-out of text/images
  document.addEventListener('dragstart', (e) => {
    if (isField(e.target)) return;
    e.preventDefault();
  });

  // Text selection (leave form fields selectable)
  document.addEventListener('selectstart', (e) => {
    if (isField(e.target)) return;
    e.preventDefault();
  });

  // Keyboard shortcuts: copy/cut/save/print/view-source
  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = (e.key || '').toLowerCase();
    if (!['c', 'x', 's', 'p', 'u'].includes(k)) return;
    if (isField(e.target) && (k === 'c' || k === 'x')) return; // copy/cut within a field is fine
    e.preventDefault();
  });

  // Neuter programmatic printing
  try { window.print = function () {}; } catch (_) { /* ignore */ }
})();
