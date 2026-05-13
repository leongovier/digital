// Lightbox — opens any img marked with data-lightbox="<group>".
// Group name controls prev/next cycling: only images in the same group cycle together.
// Keyboard: ←/→ to navigate, Esc to close. Click backdrop or close button to dismiss.

const triggers = document.querySelectorAll<HTMLImageElement>('img[data-lightbox]');
if (triggers.length) {
  const groups = new Map<string, HTMLImageElement[]>();
  triggers.forEach((img) => {
    const group = img.dataset.lightbox || 'default';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(img);
  });

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image lightbox');
  overlay.hidden = true;
  overlay.innerHTML = `
    <button class="lightbox-btn lightbox-close" type="button" aria-label="Close lightbox">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous image">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
    </button>
    <button class="lightbox-btn lightbox-next" type="button" aria-label="Next image">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </button>
    <figure class="lightbox-figure">
      <img class="lightbox-img" alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
  `;
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector<HTMLImageElement>('.lightbox-img')!;
  const lbCap = overlay.querySelector<HTMLElement>('.lightbox-caption')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.lightbox-close')!;
  const prevBtn = overlay.querySelector<HTMLButtonElement>('.lightbox-prev')!;
  const nextBtn = overlay.querySelector<HTMLButtonElement>('.lightbox-next')!;

  let currentGroup: string | null = null;
  let currentIndex = 0;
  let lastFocus: HTMLElement | null = null;

  const isOpen = () => !overlay.hidden;

  const render = () => {
    if (!currentGroup) return;
    const list = groups.get(currentGroup) || [];
    if (!list.length) return;
    const src = list[currentIndex];
    lbImg.src = src.currentSrc || src.src;
    lbImg.alt = src.alt || '';
    lbCap.textContent = src.alt || '';
    const multi = list.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  };

  const open = (group: string, index: number) => {
    currentGroup = group;
    currentIndex = index;
    render();
    lastFocus = document.activeElement as HTMLElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    if (!isOpen()) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    currentGroup = null;
    lbImg.src = '';
    lastFocus?.focus();
  };

  const step = (dir: 1 | -1) => {
    if (!currentGroup) return;
    const list = groups.get(currentGroup) || [];
    if (!list.length) return;
    currentIndex = (currentIndex + dir + list.length) % list.length;
    render();
  };

  triggers.forEach((img) => {
    img.addEventListener('click', () => {
      const group = img.dataset.lightbox || 'default';
      const list = groups.get(group) || [];
      const idx = list.indexOf(img);
      if (idx >= 0) open(group, idx);
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  // Expose for auto-slide pause logic
  (window as unknown as { __lightboxOpen: () => boolean }).__lightboxOpen = isOpen;
}
