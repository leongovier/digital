// Home page interactions: cursor glow, scroll-reveal, smooth anchors, scroll-spy.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cursor accent
const glow = document.getElementById('cursorGlow');
if (glow && !reduceMotion) {
  let raf: number | null = null;
  document.addEventListener('mousemove', (e) => {
    document.body.classList.add('cursor-active');
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  });
  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
  });
}

// Scroll reveal — anything within 92% viewport on load reveals immediately
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
);

const revealEls = document.querySelectorAll<HTMLElement>('.reveal');
const vh = window.innerHeight;
revealEls.forEach((el) => {
  const rect = el.getBoundingClientRect();
  if (rect.top < vh * 0.92) {
    el.classList.add('in');
  } else {
    io.observe(el);
  }
});

// Smooth anchors — every in-page anchor (#section), excluding bare #
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target instanceof HTMLElement) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
    }
  });
});

// Sliders — every track marked with data-slider-track is wired to its arrow buttons.
// Buttons reference their track via aria-controls. Snap handles motion; arrows scroll
// by one card width. Tracks marked data-auto-slide also auto-advance every 5s, pausing
// on hover and after user interaction.
document.querySelectorAll<HTMLElement>('[data-slider-track]').forEach((track) => {
  if (!track.id) return;
  const btns = document.querySelectorAll<HTMLButtonElement>(
    `.slider-btn[aria-controls="${track.id}"]`,
  );

  const cardWidth = () => {
    const first = track.querySelector<HTMLElement>(':scope > *');
    if (!first) return 320;
    const gap = parseInt(getComputedStyle(track).columnGap || '24', 10);
    return first.offsetWidth + (Number.isFinite(gap) ? gap : 24);
  };

  const atEnd = () => track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

  const advance = (dir: 1 | -1) => {
    if (dir === 1 && atEnd()) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (dir === -1 && track.scrollLeft <= 0) {
      track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: dir * cardWidth(), behavior: 'smooth' });
    }
  };

  // Auto-slide is independent of the disabled state — arrows stay live for looping.
  const isAuto = track.hasAttribute('data-auto-slide');

  const updateDisabled = () => {
    if (isAuto) return; // looping slider — never disable
    const max = track.scrollWidth - track.clientWidth - 1;
    btns.forEach((btn) => {
      const dir = btn.dataset.dir;
      if (dir === 'prev') btn.toggleAttribute('disabled', track.scrollLeft <= 0);
      if (dir === 'next') btn.toggleAttribute('disabled', track.scrollLeft >= max);
    });
  };

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir === 'next' ? 1 : -1;
      advance(dir as 1 | -1);
    });
  });

  track.addEventListener('scroll', updateDisabled, { passive: true });
  window.addEventListener('resize', updateDisabled);
  updateDisabled();

  // Tab-bar sync: buttons with data-tab-controls=<trackId> jump to a slide and
  // reflect the current slide via .active.
  const tabs = document.querySelectorAll<HTMLButtonElement>(
    `[data-tab-controls="${track.id}"]`,
  );
  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const idx = Number(tab.dataset.tabIndex || '0');
        track.scrollTo({ left: idx * cardWidth(), behavior: 'smooth' });
      });
    });
    const updateActive = () => {
      const w = cardWidth();
      if (!w) return;
      const idx = Math.round(track.scrollLeft / w);
      tabs.forEach((tab, i) => {
        const active = i === idx;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    };
    track.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
  }

  if (isAuto && !reduceMotion) {
    const tickMs = 5000;
    const userPauseMs = 9000;
    let pauseUntil = 0;
    let timer: number | null = null;

    let inView = false;
    let hovered = false;
    let focused = false;

    const tick = () => {
      if (Date.now() < pauseUntil) return;
      if (document.hidden) return;
      const lb = (window as unknown as { __lightboxOpen?: () => boolean }).__lightboxOpen;
      if (lb && lb()) return; // pause while lightbox open
      advance(1);
    };

    const start = () => {
      if (timer !== null) return;
      if (!inView || hovered || focused || document.hidden) return;
      timer = window.setInterval(tick, tickMs);
    };
    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };
    const userPause = () => {
      pauseUntil = Date.now() + userPauseMs;
    };

    track.addEventListener('mouseenter', () => { hovered = true; stop(); });
    track.addEventListener('mouseleave', () => { hovered = false; start(); });
    track.addEventListener('focusin', () => { focused = true; stop(); });
    track.addEventListener('focusout', () => { focused = false; start(); });
    track.addEventListener('scroll', userPause, { passive: true });
    btns.forEach((btn) => btn.addEventListener('click', userPause));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          inView = en.isIntersecting;
          if (inView) start();
          else stop();
        });
      },
      { threshold: 0.25 },
    );
    visibilityObserver.observe(track);
  }
});

// Scroll-spy: track section whose offsetTop is most recently passed (120px buffer)
const sectionIds = ['home', 'work', 'process', 'feedback', 'gallery', 'contact'];
const sections = sectionIds
  .map((id) => ({ id, el: document.getElementById(id) }))
  .filter((s): s is { id: string; el: HTMLElement } => s.el !== null);

if (sections.length > 0) {
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY + 120;
      let active = sections[0].id;
      for (const s of sections) {
        if (s.el.offsetTop <= y) active = s.id;
      }
      document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((l) => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + active);
      });
    },
    { passive: true },
  );
}
