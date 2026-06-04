/* ===== HEADER SCROLL ===== */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  updateActiveNav();
});

/* ===== MOBILE NAV ===== */
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');

// Create backdrop
const navBackdrop = document.createElement('div');
navBackdrop.className = 'mobile-nav-backdrop';
document.body.appendChild(navBackdrop);

function closeNav() {
  hamburger.classList.remove('open');
  mainNav.classList.remove('open');
  navBackdrop.classList.remove('open');
}

hamburger.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  hamburger.classList.toggle('open');
  navBackdrop.classList.toggle('open', isOpen);
});

navBackdrop.addEventListener('click', closeNav);

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

mainNav.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', closeNav);
});

/* ===== ACTIVE NAV ===== */
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.main-nav a');
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ===== LIGHTBOX ===== */
const galleries = {
  'checkrr': [
    'public/case-studies/cropped/checkrr/slider/01.webp',
    'public/case-studies/cropped/checkrr/slider/02.webp',
    'public/case-studies/cropped/checkrr/slider/03.webp',
    'public/case-studies/cropped/checkrr/dashboard.png',
    'public/case-studies/cropped/checkrr/dashboard-flat.png',
    'public/case-studies/cropped/checkrr/landing-hero.png',
    'public/case-studies/cropped/checkrr/landing-steps.png',
    'public/case-studies/cropped/checkrr/landing-mobile.png',
    'public/case-studies/cropped/checkrr/login.png',
    'public/case-studies/cropped/checkrr/new-paye.png',
    'public/case-studies/cropped/checkrr/new-self-employed.png',
    'public/case-studies/cropped/checkrr/affordibilty.png',
    'public/case-studies/cropped/checkrr/dti-screen.png',
    'public/case-studies/cropped/checkrr/ons.png',
    'public/case-studies/cropped/checkrr/white-lable.png',
    'public/case-studies/cropped/checkrr/integrations.png',
    'public/case-studies/cropped/checkrr/feature-flags.png',
    'public/case-studies/cropped/checkrr/home-card.webp',
  ],
  'cubik-crm': [
    'public/case-studies/cropped/cubik-crm/slider/01.webp',
    'public/case-studies/cropped/cubik-crm/slider/02.webp',
    'public/case-studies/cropped/cubik-crm/slider/03.webp',
    'public/case-studies/cropped/cubik-crm/slider/04.webp',
    'public/case-studies/cropped/cubik-crm/slider/05.webp',
    'public/case-studies/cropped/cubik-crm/slider/06.webp',
    'public/case-studies/cropped/cubik-crm/slider/07.webp',
    'public/case-studies/cropped/cubik-crm/slider/08.webp',
  ],
  'cubik-ai': [
    'public/case-studies/cropped/cubik-ai/slider/01.png',
    'public/case-studies/cropped/cubik-ai/slider/02.png',
    'public/case-studies/cropped/cubik-ai/slider/03.png',
    'public/case-studies/cropped/cubik-ai/slider/04.png',
    'public/case-studies/cropped/cubik-ai/slider/05.png',
    'public/case-studies/cropped/cubik-ai/slider/06.png',
    'public/case-studies/cropped/cubik-ai/slider/07.png',
    'public/case-studies/cropped/cubik-ai/slider/08.png',
    'public/case-studies/cropped/cubik-ai/slider/09.png',
    'public/case-studies/cropped/cubik-ai/hero-cubik.webp',
    'public/case-studies/cropped/cubik-ai/commercial-flat.png',
    'public/case-studies/cropped/cubik-ai/calculator-card.webp',
    'public/case-studies/cropped/cubik-ai/home-card.webp',
  ],
  'adaptive-crm': [
    'public/case-studies/cropped/adaptive-crm/slider/avs-01-matches-import-extracted.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-02-matches-import-reading.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-03-matches-import-upload.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-04-matches-list.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-05-match-detail.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-06-dashboard.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-07-leads-list.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-08-lead-detail.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-09-stock-list.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-10-customers-list.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-11-integrations.webp',
    'public/case-studies/cropped/adaptive-crm/slider/avs-12-social-post-generator.webp',
  ],
  'astra': [
    'public/case-studies/cropped/astra/slider/01.webp',
    'public/case-studies/cropped/astra/slider/02.webp',
    'public/case-studies/cropped/astra/slider/03.webp',
    'public/case-studies/cropped/astra/slider/04.webp',
    'public/case-studies/cropped/astra/slider/05.webp',
    'public/case-studies/cropped/astra/slider/06.webp',
    'public/case-studies/cropped/astra/slider/07.webp',
    'public/case-studies/cropped/astra/slider/08.webp',
    'public/case-studies/cropped/astra/slider/09.webp',
  ],
  'coincover': [
    'public/case-studies/cropped/coincover/slider/01.png',
    'public/case-studies/cropped/coincover/slider/02.png',
    'public/case-studies/cropped/coincover/slider/03.png',
    'public/case-studies/cropped/coincover/slider/04.png',
    'public/case-studies/cropped/coincover/slider/05.png',
    'public/case-studies/cropped/coincover/slider/06.png',
    'public/case-studies/cropped/coincover/slider/07.png',
    'public/case-studies/cropped/coincover/slider/08.png',
    'public/case-studies/cropped/coincover/slider/09.png',
    'public/case-studies/cropped/coincover/slider/10.png',
    'public/case-studies/cropped/coincover/slider/11.png',
  ],
  'polaris': [
    'public/case-studies/cropped/polaris-calculator-suite/slider/01.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/02.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/03.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/04.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/05.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/06.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/07.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/08.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/09.webp',
    'public/case-studies/cropped/polaris-calculator-suite/slider/10.webp',
  ],
  'jamf-etp': [
    'public/case-studies/cropped/jamf-etp/slider/01.webp',
    'public/case-studies/cropped/jamf-etp/slider/02.webp',
    'public/case-studies/cropped/jamf-etp/slider/03.webp',
    'public/case-studies/cropped/jamf-etp/slider/04.webp',
    'public/case-studies/cropped/jamf-etp/slider/05.webp',
    'public/case-studies/cropped/jamf-etp/slider/06.webp',
    'public/case-studies/cropped/jamf-etp/slider/07.webp',
    'public/case-studies/cropped/jamf-etp/slider/08.webp',
    'public/case-studies/cropped/jamf-etp/slider/09.webp',
  ],
  'qes': [
    'public/case-studies/cropped/qes/qes-1.png',
    'public/case-studies/cropped/qes/qes-2.png',
    'public/case-studies/cropped/qes/qes-3.png',
    'public/case-studies/cropped/qes/qes-4.png',
    'public/case-studies/cropped/qes/qes-5.png',
    'public/case-studies/cropped/qes/qes-6.png',
    'public/case-studies/cropped/qes/qes-7.png',
    'public/case-studies/cropped/qes/qes-8.png',
    'public/case-studies/cropped/qes/qes-9.png',
    'public/case-studies/cropped/qes/qes-10.png',
  ],
  'cwt': [
    'public/case-studies/cropped/cwt/hero-cwt.webp',
    'public/case-studies/cropped/cwt/slider/01.webp',
    'public/case-studies/cropped/cwt/slider/02.webp',
    'public/case-studies/cropped/cwt/slider/03.webp',
    'public/case-studies/cropped/cwt/slider/04.webp',
    'public/case-studies/cropped/cwt/slider/05.webp',
    'public/case-studies/cropped/cwt/slider/06.webp',
    'public/case-studies/cropped/cwt/slider/07.webp',
    'public/case-studies/cropped/cwt/slider/08.webp',
    'public/case-studies/cropped/cwt/slider/09.webp',
    'public/case-studies/cropped/cwt/slider/10.webp',
  ],
  'apps': [
    'public/case-studies/apps/apple-watch.png',
    'public/case-studies/apps/discover.webp',
    'public/case-studies/apps/creadigol.png',
    'public/case-studies/apps/oc-savings.png',
    'public/case-studies/apps/crestr.png',
    'public/case-studies/apps/plots.webp',
    'public/case-studies/apps/royaljet.png',
    'public/case-studies/apps/uxd.webp',
    'public/case-studies/apps/william-hill.webp',
  ],
  'anything-medical': [
    'images/case-studies/anything-medical/slider/01.webp',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.01.30.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.01.45.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.02.03.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.02.09.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.02.19.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.02.26.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.02.32.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.02.44.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.02.52.png',
    'images/case-studies/anything-medical/slider/Screenshot 2026-06-04 at 07.03.00.png',
  ],
  'lookrr': [
    'images/case-studies/lookrr/slider/01.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.56.37.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.56.48.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.56.54.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.57.27.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.57.45.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.58.09.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.58.27.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.58.49.png',
    'images/case-studies/lookrr/slider/Screenshot 2026-06-04 at 06.59.09.png',
  ],
  'websites': [
    'public/case-studies/websites/coliving.png',
    'public/case-studies/websites/cpb.png',
    'public/case-studies/websites/digital.png',
    'public/case-studies/websites/farbella.png',
    'public/case-studies/websites/gbestates.png',
    'public/case-studies/websites/gelisy.png',
    'public/case-studies/websites/johnrea.png',
    'public/case-studies/websites/lodges.png',
    'public/case-studies/websites/logicroom.png',
    'public/case-studies/websites/pmb.png',
    'public/case-studies/websites/sbs.png',
    'public/case-studies/websites/troika.png',
  ],
};

(function () {
  const lightbox    = document.getElementById('lightbox');
  const mainImg     = document.getElementById('lightboxMainImg');
  const thumbsWrap  = document.getElementById('lightboxThumbs');
  const counter     = document.getElementById('lightboxCounter');
  const prevBtn     = document.getElementById('lightboxPrev');
  const nextBtn     = document.getElementById('lightboxNext');
  const thumbPrev   = document.getElementById('lightboxThumbPrev');
  const thumbNext   = document.getElementById('lightboxThumbNext');
  if (!lightbox) return;

  const THUMB_STEP = 3; // thumbs to scroll per click
  let images = [];
  let idx = 0;
  let thumbOffset = 0;

  function openLightbox(imgs, startIdx) {
    images = imgs.filter(src => src);
    if (!images.length) return;
    idx = startIdx || 0;
    thumbOffset = 0;

    thumbsWrap.innerHTML = '';
    images.forEach((src, i) => {
      const btn = document.createElement('button');
      btn.className = 'lightbox-thumb' + (i === idx ? ' active' : '');
      btn.setAttribute('aria-label', `View image ${i + 1}`);
      btn.innerHTML = `<img src="${src}" alt="Gallery image ${i + 1}" loading="lazy">`;
      btn.addEventListener('click', () => goTo(i));
      thumbsWrap.appendChild(btn);
    });

    render();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function goTo(i) {
    idx = Math.max(0, Math.min(i, images.length - 1));
    render();
  }

  function scrollThumbs(dir) {
    const thumbs = thumbsWrap.querySelectorAll('.lightbox-thumb');
    if (!thumbs.length) return;
    const thumbW = thumbs[0].offsetWidth + 8; // width + gap
    const viewW  = thumbsWrap.parentElement.offsetWidth;
    const maxOffset = Math.max(0, thumbs.length * thumbW - viewW);
    thumbOffset = Math.max(0, Math.min(thumbOffset + dir * THUMB_STEP * thumbW, maxOffset));
    thumbsWrap.style.transform = `translateX(-${thumbOffset}px)`;
    if (thumbPrev) thumbPrev.disabled = thumbOffset === 0;
    if (thumbNext) thumbNext.disabled = thumbOffset >= maxOffset;
  }

  function scrollThumbsToActive() {
    const thumbs = thumbsWrap.querySelectorAll('.lightbox-thumb');
    if (!thumbs.length) return;
    const thumbW = thumbs[0].offsetWidth + 8;
    const viewW  = thumbsWrap.parentElement ? thumbsWrap.parentElement.offsetWidth : 600;
    const maxOffset = Math.max(0, thumbs.length * thumbW - viewW);
    const targetOffset = Math.max(0, idx * thumbW - viewW / 2 + thumbW / 2);
    thumbOffset = Math.min(targetOffset, maxOffset);
    thumbsWrap.style.transform = `translateX(-${thumbOffset}px)`;
    if (thumbPrev) thumbPrev.disabled = thumbOffset === 0;
    if (thumbNext) thumbNext.disabled = thumbOffset >= maxOffset;
  }

  function render() {
    mainImg.src = images[idx];
    mainImg.alt = `Gallery image ${idx + 1}`;
    counter.textContent = `${idx + 1} / ${images.length}`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === images.length - 1;
    thumbsWrap.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
    scrollThumbsToActive();
  }

  prevBtn.addEventListener('click', () => goTo(idx - 1));
  nextBtn.addEventListener('click', () => goTo(idx + 1));
  if (thumbPrev) thumbPrev.addEventListener('click', () => scrollThumbs(-1));
  if (thumbNext) thumbNext.addEventListener('click', () => scrollThumbs(1));
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  goTo(idx - 1);
    if (e.key === 'ArrowRight') goTo(idx + 1);
    if (e.key === 'Escape')     closeLightbox();
  });

  // Expose so gallery buttons can call it
  window.openLightbox = openLightbox;
  window.galleries    = galleries;
})();

/* ===== SIDE DRAWER ===== */
function openDrawer(id) {
  const drawer = document.getElementById('drawer-' + id);
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDrawer(id) {
  const drawer = document.getElementById('drawer-' + id);
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-pricing-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-pricing-tab');
    document.querySelectorAll('[data-pricing-tab]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.pricing-tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('ptab-' + tab);
    if (panel) panel.classList.add('active');
  });
});

document.querySelectorAll('.calc-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.calc-tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('calcTab-' + tab.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

document.querySelectorAll('.drawer-open-btn').forEach(btn => {
  btn.addEventListener('click', () => openDrawer(btn.dataset.drawer));
});

document.querySelectorAll('.feat-card-view-btn:not(.feat-card-gallery-btn)').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    openDrawer(btn.dataset.drawer);
  });
});

document.querySelectorAll('.feat-card-gallery-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const card = btn.closest('.feat-card, .app-card');
    const id = (card && card.dataset.drawer) || (card && card.dataset.gallery);
    const imgs = window.galleries && window.galleries[id];
    if (imgs) window.openLightbox(imgs, 0);
  });
});

document.querySelectorAll('.side-drawer').forEach(drawer => {
  const id = drawer.id.replace('drawer-', '');
  drawer.querySelector('.side-drawer-backdrop').addEventListener('click', () => closeDrawer(id));
  drawer.querySelector('.side-drawer-close').addEventListener('click', () => closeDrawer(id));

  drawer.querySelectorAll('.drawer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      drawer.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
      drawer.querySelectorAll('.drawer-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = drawer.querySelector('#drawerTab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.side-drawer.open').forEach(drawer => {
      closeDrawer(drawer.id.replace('drawer-', ''));
    });
  }
});

/* ===== FEATURES CATEGORY TOGGLE ===== */
document.querySelectorAll('.features-cat-toggle').forEach(toggle => {
  const btns = toggle.querySelectorAll('.process-toggle-btn');
  const section = toggle.closest('section');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      (section || document).querySelectorAll('.features-grid, .apps-masonry').forEach(grid => {
        grid.classList.toggle('hidden', grid.id !== `feat-${cat}`);
      });
    });
  });
});

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = 'true';
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.floor(progress * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

function checkStatsInView() {
  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;
  const rect = statsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    statsSection.querySelectorAll('.stat-number').forEach(animateCounter);
    window.removeEventListener('scroll', checkStatsInView);
  }
}

window.addEventListener('scroll', checkStatsInView, { passive: true });
checkStatsInView();

/* ===== ACCORDION ===== */
document.querySelectorAll('.accordion').forEach(accordion => {
  const items = accordion.querySelectorAll('.accordion-item');

  items.forEach(item => {
    item.querySelector('.accordion-header').addEventListener('click', () => {
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-body').style.display = 'none';
      });

      if (!isOpen) {
        item.classList.add('open');
        body.style.display = 'block';
      }
    });
  });
});



/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.stat-card, .accordion-item, .timeline-card, .process-card, .tool-tag'
).forEach(el => {
  // Skip elements inside hidden containers — observer won't fire for them
  if (el.closest('.hidden')) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease';
  revealObserver.observe(el);
});

/* ===== CONTACT FORM ===== */
function handleContactForm(formId, submitId, successId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById(submitId);
    const success = document.getElementById(successId);
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const formData = new FormData(form);
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const data = await res.json();
      success.textContent = data.message;
      success.style.display = 'block';
      success.style.color = data.success ? '#4caf88' : '#ff6b6b';
      if (data.success) form.reset();
    } catch {
      success.textContent = 'Something went wrong. Please email me directly at hello@leongovier.com.';
      success.style.display = 'block';
      success.style.color = '#ff6b6b';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send enquiry';
    }
  });
}
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contactSubmit');
    const success = document.getElementById('contactSuccess');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const formData = new FormData(contactForm);
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const data = await res.json();
      success.textContent = data.message;
      success.style.display = 'block';
      success.style.color = data.success ? '#4caf88' : '#ff6b6b';
      if (data.success) contactForm.reset();
    } catch {
      success.textContent = 'Something went wrong. Please email me directly at hello@leongovier.com.';
      success.style.display = 'block';
      success.style.color = '#ff6b6b';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit';
    }
  });
}

/* ===== POLICY MODALS ===== */
(function () {
  var modal = document.getElementById('policyModal');
  if (!modal) return;
  var titleEl = document.getElementById('policyTitle');
  var bodyEl  = document.getElementById('policyBody');

  var content = {
    privacy:
      '<h3>Who we are</h3><p>This website is operated by LG Digital Ltd. Registered in Cardiff, Wales, United Kingdom. Contact us at <a href="mailto:hello@leongovier.digital">hello@leongovier.digital</a>.</p>' +
      '<h3>What data we collect</h3><p>When you use the contact form on this website, we collect:</p><ul><li>Your name</li><li>Your email address</li><li>Your phone number (optional)</li><li>Your business name (optional)</li><li>The nature of your enquiry</li><li>Any additional information you choose to provide</li></ul><p>We do not collect data through cookies or tracking technologies beyond what is described in our Cookie Policy.</p>' +
      '<h3>How we use your data</h3><p>We use the information you submit solely to respond to your enquiry and communicate about potential or ongoing work. We do not use your data for marketing without your explicit consent.</p>' +
      '<h3>Legal basis for processing</h3><p>We process your data on the basis of legitimate interest — specifically, to respond to a business enquiry you have initiated.</p>' +
      '<h3>Who we share your data with</h3><p>Your data is transmitted via <strong>Resend</strong> (our email delivery provider). We do not sell, rent or share your personal data with any third party. Review Resend privacy policy at <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener">resend.com</a>.</p>' +
      '<h3>How long we keep your data</h3><p>We retain enquiry data for up to 2 years, or for the duration of any client relationship, whichever is longer.</p>' +
      '<h3>Your rights</h3><p>Under UK GDPR you have the right to access, correct, delete or restrict your data, and to lodge a complaint with the ICO at <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a>.</p><p>To exercise any of these rights, email <a href="mailto:hello@leongovier.digital">hello@leongovier.digital</a>.</p>' +
      '<h3>Data security</h3><p>All data submitted is transmitted over HTTPS. We take reasonable measures to protect your data from unauthorised access.</p>' +
      '<h3>Changes to this policy</h3><p>We may update this policy from time to time. Last updated: June 2026.</p>',
    cookies:
      '<h3>What are cookies</h3><p>Cookies are small text files placed on your device when you visit a website.</p>' +
      '<h3>What cookies this site uses</h3><p>This website does not use first-party cookies for tracking, advertising or analytics.</p><p>The only cookies that may be set are <strong>strictly necessary</strong> technical cookies set by our hosting provider (Vercel). These do not identify you personally.</p>' +
      '<h3>Third-party services</h3><p>We do not currently run any third-party analytics, advertising or social media scripts. If this changes, this policy will be updated first.</p>' +
      '<h3>Google Fonts</h3><p>This site loads fonts from Google Fonts. Google may log your IP address as part of this request. Review their policy at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com</a>.</p>' +
      '<h3>Managing cookies</h3><p>You can control and delete cookies through your browser settings. This site will continue to function normally without them. For guidance visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener">aboutcookies.org</a>.</p>' +
      '<h3>Changes to this policy</h3><p>We may update this policy if we introduce new services or scripts. Last updated: June 2026.</p>'
  };

  var titles = { privacy: 'Privacy Policy', cookies: 'Cookie Policy' };

  function openModal(key) {
    titleEl.textContent = titles[key] || '';
    bodyEl.innerHTML = content[key] || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.footer-policy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.getAttribute('data-policy')); });
  });

  document.getElementById('policyClose').addEventListener('click', closeModal);
  modal.querySelector('.policy-modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();

// FEEDBACK CAROUSEL
(function () {
  var track = document.getElementById('feedbackTrack');
  var dotsWrap = document.getElementById('feedbackDots');
  var prevBtn = document.getElementById('feedbackPrev');
  var nextBtn = document.getElementById('feedbackNext');
  if (!track) return;

  var cards = track.querySelectorAll('.feedback-card');
  var total = cards.length;
  var visible = 3;
  var current = 0;
  var maxIndex = total - visible;

  function getVisible() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    visible = getVisible();
    maxIndex = total - visible;
    for (var i = 0; i <= maxIndex; i++) {
      var dot = document.createElement('button');
      dot.className = 'feedback-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.dataset.index = i;
      dot.addEventListener('click', function () { goTo(parseInt(this.dataset.index)); });
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(index) {
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;
    current = index;
    var cardWidth = cards[0].offsetWidth;
    var gap = 24;
    track.style.transform = 'translateX(-' + (current * (cardWidth + gap)) + 'px)';
    dotsWrap.querySelectorAll('.feedback-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === maxIndex;
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); });

  window.addEventListener('resize', function () {
    visible = getVisible();
    maxIndex = total - visible;
    if (current > maxIndex) current = maxIndex;
    buildDots();
    goTo(current);
  });

  buildDots();
  goTo(0);
})();
