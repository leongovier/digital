// Reading progress bar — case study detail pages only.
const bar = document.getElementById('progress');
if (bar) {
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = p + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}
