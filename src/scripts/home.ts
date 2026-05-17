// Home page (v2) interactions:
//   1. Shape layer — fixed pastel squircles that drift, rotate and scale with scroll.
//   2. Nav scroll-spy — highlights the section currently in view.
//   3. Feedback carousel — prev/next paging over the testimonial rail.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Shape layer ---------- */
function initShapes(): void {
  const shapes = Array.from(
    document.querySelectorAll<HTMLElement>('.shape-layer .shape'),
  );
  if (!shapes.length) return;

  // Reduced motion: reveal shapes at their resting state, skip the rAF loop.
  if (reduceMotion) {
    shapes.forEach((s) => {
      s.style.opacity = '1';
    });
    return;
  }

  // Per-shape params — deterministic so the motion looks composed, not jittery.
  const params = shapes.map((s, i) => {
    const r = s.getBoundingClientRect();
    const isSmall = Math.max(r.width, r.height) < 140; // small shapes roam both axes
    return {
      el: s,
      tyAmp: isSmall ? 180 + (i % 3) * 40 : 80 + (i % 3) * 40,
      txAmp: isSmall ? 220 + (i % 4) * 60 : 0,
      tyOffset: i * 0.18,
      txOffset: i * 0.42,
      rotAmp: isSmall ? 200 + (i % 4) * 40 : 60 + (i % 4) * 30,
      scaleAmp: isSmall ? 0.12 + (i % 3) * 0.05 : 0.06 + (i % 3) * 0.04,
    };
  });

  // Entry: start small/faded, pop in once with a staggered transition.
  shapes.forEach((s, i) => {
    s.style.setProperty('--scl', '0.4');
    s.style.setProperty('--rd', '-20deg');
    s.style.setProperty('--ty', '40px');
    s.style.setProperty('--tx', '0px');
    s.style.opacity = '0';
    s.style.transition =
      'opacity .9s ease, transform 1.2s cubic-bezier(.18,.9,.25,1.1)';
    window.setTimeout(() => {
      s.style.opacity = '1';
      s.style.setProperty('--scl', '1');
      s.style.setProperty('--rd', '0deg');
      s.style.setProperty('--ty', '0px');
      s.style.setProperty('--tx', '0px');
      // Clear the transition once settled so it doesn't fight the rAF loop.
      window.setTimeout(() => {
        s.style.transition = '';
      }, 1300);
    }, 120 + i * 110);
  });

  let ticking = false;
  function update(): void {
    const max = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    const ySc = window.scrollY;
    params.forEach(
      ({ el, tyAmp, txAmp, tyOffset, txOffset, rotAmp, scaleAmp }) => {
        const ty = Math.sin(ySc * 0.0025 + tyOffset * Math.PI) * tyAmp;
        const tx = txAmp
          ? Math.sin(ySc * 0.0018 + txOffset * Math.PI) * txAmp
          : 0;
        const rd = p * rotAmp - rotAmp * 0.3;
        const scl = 1 + Math.sin(ySc * 0.003 + tyOffset * Math.PI * 2) * scaleAmp;
        el.style.setProperty('--ty', ty.toFixed(1) + 'px');
        el.style.setProperty('--tx', tx.toFixed(1) + 'px');
        el.style.setProperty('--rd', rd.toFixed(1) + 'deg');
        el.style.setProperty('--scl', scl.toFixed(3));
      },
    );
    ticking = false;
  }
  function onScroll(): void {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.setTimeout(update, 1500);
}

/* ---------- 2. Nav scroll-spy ---------- */
function initScrollSpy(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav .link'));
  const ids = links
    .map((a) => a.getAttribute('href') ?? '')
    .filter((h) => h.startsWith('#'));
  const sections = ids
    .map((id) => document.querySelector<HTMLElement>(id))
    .filter((s): s is HTMLElement => s !== null);
  if (!sections.length) return;

  const onScroll = (): void => {
    const y = window.scrollY + 120;
    let cur = sections[0].id;
    for (const s of sections) {
      if (s.offsetTop <= y) cur = s.id;
    }
    links.forEach((l) => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- 3. Feedback carousel ---------- */
function initFeedbackCarousel(): void {
  const rail = document.getElementById('fbRail');
  if (!rail || !rail.parentElement) return;

  let idx = 0;
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.fb-btn'));

  const maxIdx = (): number => {
    const cards = rail.children.length;
    const visible = Math.max(
      1,
      Math.floor((rail.parentElement as HTMLElement).offsetWidth / 380),
    );
    return Math.max(0, cards - visible);
  };

  const update = (): void => {
    idx = Math.min(idx, maxIdx());
    const first = rail.children[0] as HTMLElement | undefined;
    if (!first) return;
    const colW = first.offsetWidth + 22; // grid gap
    rail.style.transform = `translateX(${-idx * colW}px)`;
  };

  buttons.forEach((b) => {
    b.addEventListener('click', () => {
      const dir = b.dataset.dir;
      idx =
        dir === 'next'
          ? Math.min(maxIdx(), idx + 1)
          : Math.max(0, idx - 1);
      buttons.forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      update();
    });
  });
  window.addEventListener('resize', update);
  update();
}

/* ---------- 4. Timeline (click to activate a stop) ---------- */
function initTimeline(): void {
  const stops = Array.from(document.querySelectorAll<HTMLElement>('.tl-stop'));
  if (!stops.length) return;
  stops.forEach((stop) => {
    stop.addEventListener('click', () => {
      stops.forEach((s) => {
        s.classList.remove('active');
        s.setAttribute('aria-pressed', 'false');
      });
      stop.classList.add('active');
      stop.setAttribute('aria-pressed', 'true');
    });
  });
}

initShapes();
initScrollSpy();
initFeedbackCarousel();
initTimeline();
