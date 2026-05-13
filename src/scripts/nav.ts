// Mobile nav toggle. The same DOM serves desktop and mobile — at md-down
// CSS turns the link list into a fullscreen panel and reveals the hamburger.

const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
const panel = document.getElementById('primaryNav');

if (toggle && panel) {
  const close = () => {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  };

  const open = () => {
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    if (panel.classList.contains('is-open')) close();
    else open();
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => close());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });
}
