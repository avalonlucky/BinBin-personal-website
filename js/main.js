/* ============================================================
   ESTRELA STUDIO — main.js
   GSAP 3.12 + ScrollTrigger · Lenis · Canvas borders
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerFine = window.matchMedia('(pointer: fine)');
const desktopMotion = () => window.matchMedia('(min-width: 769px)').matches && !prefersReducedMotion.matches;

/* ─────────────────────────────────────────
   SCROLL ARCHITECTURE (1:1 原站)
   滚动容器是 main.page，不是 window。
   ScrollTrigger 全部以 .page 为 scroller。
───────────────────────────────────────── */
const scroller = document.querySelector('.page');
const content  = document.querySelector('.page-scroll');
ScrollTrigger.defaults({ scroller });

/* ─────────────────────────────────────────
   LENIS smooth scroll (挂在 main.page 容器上)
───────────────────────────────────────── */
const lenis = new Lenis({
  wrapper: scroller,    // 自定义 scroller 元素（原生滚动，非 window）
  content,
  lerp: 0.1,            // 跟手的线性插值（贴近原站，比 duration 模式更跟随滚轮）
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    const top = target.offsetTop;
    if (typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(top, { offset: 0 });
    } else {
      scroller.scrollTo({ top, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    }
    history.replaceState(null, '', hash);
  });
});

/* ─────────────────────────────────────────
   CANVAS BORDER — traveling light effect
   Draws an animated shimmer along the border
   of pill/card elements (matches original)
───────────────────────────────────────── */
function initCanvasBorders() {
  if (prefersReducedMotion.matches) return;

  document.querySelectorAll('[data-border]').forEach(el => {
    const canvas = el.querySelector('.border-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let raf;
    let phase = Math.random() * Math.PI * 2; // randomize starting position

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = el.offsetWidth  * dpr;
      canvas.height = el.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }

    function drawRoundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y,     x + w, y + r,     r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h,     x, y + h - r,     r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y,         x + r, y,         r);
      ctx.closePath();
    }

    function tick() {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const r = Math.min(w, h) / 2;
      const radius = el.classList.contains('nav-pill') ? 6 : 8;

      ctx.clearRect(0, 0, w, h);

      // Base border — faint
      const isLight = document.getElementById('nav')?.dataset.theme === 'light';
      drawRoundRect(0.5, 0.5, w - 1, h - 1, radius);
      ctx.strokeStyle = isLight
        ? 'rgba(2,2,2,0.1)'
        : 'rgba(251,251,244,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Traveling light — brighter arc moving around the perimeter
      phase += 0.012;
      const totalPerimeter = 2 * (w + h) + Math.PI * (radius * 2 - w - h); // approx
      const lightX = Math.cos(phase) * w * 0.5 + w * 0.5;
      const lightY = Math.sin(phase) * h * 0.5 + h * 0.5;

      const grad = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, Math.max(w, h) * 0.6);
      grad.addColorStop(0, isLight ? 'rgba(2,2,2,0.35)' : 'rgba(251,251,244,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      // Clip to the border path only (thin ring)
      ctx.save();
      drawRoundRect(0.5, 0.5, w - 1, h - 1, radius);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = grad;
      ctx.stroke();
      ctx.restore();

      raf = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    tick();
  });
}

/* ─────────────────────────────────────────
   NAV THEME SWITCH (dark/light on scroll)
───────────────────────────────────────── */
function initNavTheme() {
  const nav = document.getElementById('nav');

  ScrollTrigger.create({
    trigger: '.s-ai-tools',
    start: 'top 60px',
    onEnter:    () => nav.dataset.theme = 'light',
    onLeaveBack:() => nav.dataset.theme = 'dark',
  });

  ScrollTrigger.create({
    trigger: '.s-testimonials',
    start: 'top 60px',
    onEnter:    () => nav.dataset.theme = 'dark',
    onLeaveBack:() => nav.dataset.theme = 'light',
  });

}

/* ─────────────────────────────────────────
   AI TOOLS — marquee / grid view switch
───────────────────────────────────────── */
function initAiToolsView() {
  const section = document.querySelector('.s-ai-tools');
  const toggle = section?.querySelector('.ai-view-toggle');
  const grid = section?.querySelector('.ai-tools-grid');
  if (!section || !toggle || !grid) return;

  const sourceTools = section.querySelectorAll('.ai-marquee-group:not([aria-hidden]) .ai-tool');
  sourceTools.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'ai-grid-card';
    card.innerHTML = tool.innerHTML;
    grid.appendChild(card);
  });

  const setView = gridActive => {
    section.classList.toggle('is-grid', gridActive);
    toggle.setAttribute('aria-pressed', String(gridActive));
    section.querySelector('[data-ai-view-label="marquee"]')?.classList.toggle('is-active', !gridActive);
    section.querySelector('[data-ai-view-label="grid"]')?.classList.toggle('is-active', gridActive);
    ScrollTrigger.refresh();
  };

  toggle.addEventListener('click', () => setView(!section.classList.contains('is-grid')));
}

function initAiMarqueeLoops() {
  const rows = document.querySelectorAll('.ai-marquee-row');
  if (!rows.length) return;

  const fillRows = () => {
    rows.forEach(row => {
      const [source, duplicate] = row.querySelectorAll('.ai-marquee-group');
      if (!source || !duplicate) return;

      const originalTools = [...source.children].filter(tool => !tool.dataset.loopCopy);
      if (!originalTools.length) return;

      while (source.scrollWidth < row.clientWidth * 1.15) {
        originalTools.forEach(tool => {
          const copy = tool.cloneNode(true);
          copy.dataset.loopCopy = 'true';
          source.appendChild(copy);
        });
      }

      duplicate.replaceChildren(...[...source.children].map(tool => tool.cloneNode(true)));
    });
  };

  fillRows();
  window.addEventListener('resize', fillRows);
}

/* ─────────────────────────────────────────
   SCROLL ANIMATIONS
───────────────────────────────────────── */
let _scrollAnimsDone = false;
function initScrollAnimations() {
  if (_scrollAnimsDone) return;
  _scrollAnimsDone = true;

  if (prefersReducedMotion.matches) {
    gsap.set('.reveal-up, .ai-tools-heading, .work-col, .work-section-title, .testi-card, .values-heading, .value-card, .faq-item', {
      clearProps: 'all',
      opacity: 1,
    });
    return;
  }

  // ── Hero video parallax while pinned on scroll ──
  gsap.to('.hero-bg', {
    scrollTrigger: {
      trigger: '.s-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
    scale: 1.1,
    yPercent: 6,
  });

  // ── Hero copy converges toward center and fades, matching the reference scroll feel ──
  const heroCopyTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.s-hero',
      start: 'top top',
      end: 'bottom 35%',
      scrub: 1.2,
    },
  });
  heroCopyTl
    .to('.hero-title-left', { xPercent: 38, ease: 'none', duration: 1 }, 0)
    .to('.hero-title-right', { xPercent: -50, ease: 'none', duration: 1 }, 0)
    .to('.hero-title-left, .hero-title-right', { autoAlpha: 0, ease: 'none', duration: 0.28 }, 0.72);
  gsap.to('.hero-scroll-hint', {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.s-hero',
      start: 'top top',
      end: 'top+=220 top',
      scrub: true,
    },
  });

  // ── Section headings (scrub-linked) ──
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 55%', scrub: true },
      });
  });

  // ── Generic reveal-up (scrub-linked) ──
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 58%', scrub: true },
      });
  });

  gsap.fromTo('.work-section-heading',
    { y: 44, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-work', start: 'top 85%', end: 'top 55%', scrub: true },
    });

  gsap.fromTo('.ai-tools-heading',
    { y: 44, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-ai-tools', start: 'top 88%', end: 'top 58%', scrub: true },
    });

  gsap.fromTo('.ai-marquee',
    { y: 32, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.ai-marquee', start: 'top 92%', end: 'top 66%', scrub: true },
    });

  // ── 项目列：交错升起（cascade，不再整列一起） ──
  gsap.fromTo('.work-col',
    { y: 70, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out', stagger: 0.13,
      scrollTrigger: { trigger: '.s-work', start: 'top 82%', end: 'top 38%', scrub: true },
    });

  // ── ABOUT section — pin (matches original ~3836px scroll height) ──
  if (desktopMotion()) {
    ScrollTrigger.create({
      trigger: '.s-about',
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
    });
  }

  // ── About image (scrub-linked) ──
  gsap.fromTo('.about-img',
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-about', start: 'top 88%', end: 'top 55%', scrub: true },
    });

  gsap.fromTo('.design-view-heading',
    { y: 44, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-design-view', start: 'top 82%', end: 'top 55%', scrub: true },
    });

  gsap.utils.toArray('.design-row').forEach((row, i) => {
    gsap.fromTo(row,
      { y: 44, opacity: 0 },
      {
        y: 0, opacity: 1, ease: 'expo.out',
        scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 62%', scrub: true },
        delay: i * 0.04,
      });
  });

  // ── Testimonial carousel (scrub-linked) ──
  gsap.fromTo('.testi-carousel',
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.testi-carousel', start: 'top 90%', end: 'top 55%', scrub: true },
    });

  gsap.fromTo('.values-heading',
    { y: 44, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-values', start: 'top 88%', end: 'top 62%', scrub: true },
    });

  gsap.fromTo('.value-card',
    { y: 44, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: '.values-track', start: 'top 90%', end: 'top 58%', scrub: true },
    });

  // ── FAQ items (scrub-linked, staggered) ──
  gsap.fromTo('.faq-item',
    { y: 24, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out', stagger: 0.05,
      scrollTrigger: { trigger: '.faq-list', start: 'top 88%', end: 'top 55%', scrub: true },
    });

  // ── Footer wordmark parallax ──
  gsap.from('.footer-wordmark span', {
    scrollTrigger: {
      trigger: '.s-footer',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: 2,
    },
    y: 80,
  });

  // ── Image parallax on scroll ──
  gsap.utils.toArray('.about-img img').forEach(img => {
    gsap.fromTo(img,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('figure'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      }
    );
  });
}

/* ─────────────────────────────────────────
   DESIGN VIEW ROWS — reference-style elastic hover
───────────────────────────────────────── */
function initDesignRows() {
  const rows = gsap.utils.toArray('.design-row');
  if (!rows.length) return;

  let active = rows.find(row => row.classList.contains('is-active')) || rows[0];

  function revealText(row, immediate = false) {
    const lines = row.querySelectorAll('.design-row-desc span');
    if (!lines.length) return;

    gsap.killTweensOf(lines);
    if (immediate || prefersReducedMotion.matches) {
      gsap.set(lines, { yPercent: 0 });
      return;
    }

    gsap.fromTo(lines,
      { yPercent: 120 },
      {
        yPercent: 0,
        duration: 0.85,
        ease: 'power4.out',
        stagger: 0.08,
        overwrite: 'auto',
      });
  }

  function setActive(row) {
    if (!row || row === active) return;
    active?.classList.remove('is-active');
    row.classList.add('is-active');
    active = row;
    revealText(row);
  }

  rows.forEach(row => {
    const lines = row.querySelectorAll('.design-row-desc span');
    if (lines.length) gsap.set(lines, { yPercent: row === active ? 0 : 120 });
  });
  if (active) revealText(active, true);

  rows.forEach(row => {
    const img = row.querySelector('.design-row-fig img');

    row.addEventListener('pointerenter', () => setActive(row));
    row.addEventListener('focusin', () => setActive(row));

    if (!desktopMotion() || !img) return;

    row.addEventListener('pointermove', e => {
      const box = row.getBoundingClientRect();
      const dx = (e.clientX - (box.left + box.width / 2)) / box.width;
      const dy = (e.clientY - (box.top + box.height / 2)) / box.height;
      gsap.to(img, {
        xPercent: dx * 2.2,
        yPercent: dy * 1.8,
        scale: 1.025,
        duration: 0.9,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });

    row.addEventListener('pointerleave', () => {
      gsap.to(img, {
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        duration: 1.15,
        ease: 'power4.out',
        overwrite: 'auto',
      });
    });
  });
}

/* ─────────────────────────────────────────
   WORK CARDS — "View project" 跟随鼠标
───────────────────────────────────────── */
function initWorkCta() {
  if (!desktopMotion()) return;

  const grid = document.querySelector('.work-grid');
  const cards = gsap.utils.toArray('.work-col');
  if (!grid || !cards.length) return;

  const items = cards;
  let activeIndex = -1;
  let layoutTween;

  function rem(value) {
    return value * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  function metrics() {
    const gridW = grid.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const gapTotal = gap * (items.length - 1);
    const large = Math.min(Math.max(rem(49.25), gridW * 0.31), gridW * 0.4);
    const normal = Math.max((gridW - gapTotal - large) / (items.length - 1), rem(16));
    const base = Math.max((gridW - gapTotal) / items.length, rem(14));
    return {
      base,
      large,
      normal,
      projectActiveH: Math.min(rem(72), window.innerWidth * 0.78, 980),
      projectSubH: Math.min(rem(43.4), window.innerWidth * 0.56, 620),
      projectRestH: Math.min(rem(37), window.innerWidth * 0.5, 540),
      projectBaseH: Math.min(rem(43.4), window.innerWidth * 0.56, 620),
    };
  }

  function clearState() {
    grid.classList.remove('is-project-active');
    items.forEach(item => item.classList.remove('is-active', 'is-sub-active'));
  }

  function setActive(nextIndex, options = {}) {
    if (nextIndex === activeIndex && !options.force) return;
    activeIndex = nextIndex;
    const m = metrics();

    clearState();
    if (nextIndex >= 0) {
      grid.classList.add('is-project-active');
      items[nextIndex].classList.add('is-active');
      items[nextIndex - 1]?.classList.add('is-sub-active');
      items[nextIndex + 1]?.classList.add('is-sub-active');
    }

    layoutTween?.kill();
    layoutTween = gsap.timeline({
      defaults: {
        duration: options.fast ? 0.8 : (options.reset ? 1.25 : 1.18),
        ease: options.reset ? 'expo.out' : 'power4.out',
        overwrite: 'auto',
      },
    });

    items.forEach((item, index) => {
      const isActive = index === nextIndex;
      const isNeighbor = Math.abs(index - nextIndex) === 1;
      const width = nextIndex >= 0 ? (isActive ? m.large : m.normal) : m.base;
      const height = nextIndex >= 0
        ? (isActive ? m.projectActiveH : (isNeighbor ? m.projectSubH : m.projectRestH))
        : m.projectBaseH;

      layoutTween.to(item, { width, height }, 0);
    });
  }

  cards.forEach(card => {
    const button = card.querySelector('.work-view-btn');
    const img = card.querySelector('.work-col-img img');
    const xTo = button ? gsap.quickTo(button, 'left', { duration: 0.45, ease: 'power3.out', overwrite: 'auto' }) : null;
    const yTo = button ? gsap.quickTo(button, 'top', { duration: 0.45, ease: 'power3.out', overwrite: 'auto' }) : null;

    card.addEventListener('pointermove', e => {
      const b = card.getBoundingClientRect();
      const x = Math.min(b.width * 0.82, Math.max(b.width * 0.26, e.clientX - b.left));
      const y = Math.min(b.height * 0.72, Math.max(b.height * 0.24, e.clientY - b.top));
      xTo?.(x);
      yTo?.(y);

      if (img) {
        const dx = (e.clientX - (b.left + b.width / 2)) / b.width;
        const dy = (e.clientY - (b.top + b.height / 2)) / b.height;
        gsap.to(img, {
          xPercent: dx * 3,
          yPercent: dy * 2,
          scale: 1.065,
          duration: 0.9,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });

    card.addEventListener('pointerleave', () => {
      if (!img) return;
      gsap.to(img, {
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        duration: 1.1,
        ease: 'power4.out',
        overwrite: 'auto',
      });
    });
  });

  grid.addEventListener('pointermove', e => {
    const target = e.target.closest('.work-col');
    if (!target || !grid.contains(target)) return;
    const nextIndex = items.indexOf(target);
    if (nextIndex === -1) return;
    setActive(nextIndex);
  });

  grid.addEventListener('pointerleave', () => {
    activeIndex = -1;
    clearState();
    setActive(-1, { force: true, reset: true });
    activeIndex = -1;
  });

  setActive(-1, { force: true, fast: true });
  window.addEventListener('resize', () => setActive(activeIndex, { force: true, fast: true }));
}

/* ─────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────── */
function animCounter(el, val) {
  gsap.to(el, {
    innerHTML: val,
    duration: 0.3, ease: 'expo.out',
    snap: { innerHTML: 1 },
  });
}

/* ─────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach((btn, i) => {
    const item = btn.closest('.faq-item');
    const ans  = item.querySelector('.faq-a');
    const answerId = `faq-answer-${i + 1}`;
    ans.id = answerId;
    btn.setAttribute('aria-controls', answerId);
    btn.setAttribute('aria-expanded', 'false');
    gsap.set(ans, { height: 0, overflow: 'hidden' });

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(open => {
        open.classList.remove('open');
        open.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        gsap.to(open.querySelector('.faq-a'), {
          height: 0, duration: 0.4, ease: 'expo.inOut',
        });
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        gsap.to(ans, { height: 'auto', duration: 0.5, ease: 'expo.out' });
      }
    });
  });
}

/* ─────────────────────────────────────────
   TESTIMONIAL CAROUSEL
───────────────────────────────────────── */
function initDragScroll() {
  const carousel = document.getElementById('testiCarousel');
  if (!carousel) return;

  const cards = [...carousel.querySelectorAll('.testi-card')];
  const prev = carousel.querySelector('.testi-zone-prev');
  const next = carousel.querySelector('.testi-zone-next');
  const arrow = carousel.querySelector('.testi-arrow');
  const desktop = () => window.matchMedia('(min-width: 769px)').matches;
  let activeIndex = 0;
  let pointerTarget = null;
  let touchStartX = null;
  let pointerFrame = 0;
  let pendingPointer = null;

  function relativeSlot(index) {
    let slot = index - activeIndex;
    const half = Math.floor(cards.length / 2);
    if (slot > half) slot -= cards.length;
    if (slot < -half) slot += cards.length;
    return slot;
  }

  function layout() {
    cards.forEach((card, index) => {
      const slot = relativeSlot(index);
      const neighbor = Math.abs(slot) === 1;
      card.classList.toggle('is-current', slot === 0);
      card.style.setProperty('--testi-x', desktop() ? `${slot * 56.6667}vw` : `${slot * 100}%`);
      card.style.setProperty('--testi-scale', slot === 0 ? '1' : (neighbor ? '.7' : '.56'));
      card.style.setProperty('--testi-rotate', neighbor ? `${slot * .1}deg` : '0deg');
      card.style.opacity = slot === 0 || neighbor ? '1' : '0';
      card.style.zIndex = slot === 0 ? '3' : (neighbor ? '2' : '1');
    });
  }

  function cycle(direction) {
    activeIndex = (activeIndex + direction + cards.length) % cards.length;
    layout();
  }

  function clearPointerTarget() {
    pointerTarget?.classList.remove('is-pointer-target');
    pointerTarget = null;
  }

  function applyPointer(e) {
    const box = carousel.getBoundingClientRect();
    const isPrev = e.clientX < box.left + box.width / 2;
    carousel.classList.toggle('is-prev', isPrev);
    carousel.classList.add('is-pointer-active');
    arrow.style.setProperty('--testi-arrow-x', `${e.clientX - box.left}px`);
    arrow.style.setProperty('--testi-arrow-y', `${e.clientY - box.top}px`);

    const visibleTarget = cards
      .filter(card => Number(card.style.opacity) > 0)
      .find(card => {
        const cardBox = card.getBoundingClientRect();
        return e.clientX >= cardBox.left && e.clientX <= cardBox.right &&
          e.clientY >= cardBox.top && e.clientY <= cardBox.bottom;
      }) || null;

    if (visibleTarget !== pointerTarget) {
      clearPointerTarget();
      pointerTarget = visibleTarget;
      pointerTarget?.classList.add('is-pointer-target');
    }

    if (pointerTarget) {
      const cardBox = pointerTarget.getBoundingClientRect();
      const x = e.clientX - cardBox.left;
      const y = e.clientY - cardBox.top;
      const edge = Math.min(x, cardBox.width - x, y, cardBox.height - y);
      const glowX = edge === x ? 0 : (edge === cardBox.width - x ? cardBox.width : x);
      const glowY = edge === y ? 0 : (edge === cardBox.height - y ? cardBox.height : y);
      pointerTarget.style.setProperty('--testi-glow-x', `${glowX}px`);
      pointerTarget.style.setProperty('--testi-glow-y', `${glowY}px`);
    }
  }

  function updatePointer(e) {
    if (!desktop()) return;
    pendingPointer = { clientX: e.clientX, clientY: e.clientY };
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (pendingPointer) applyPointer(pendingPointer);
      pendingPointer = null;
    });
  }

  prev?.addEventListener('click', () => cycle(-1));
  next?.addEventListener('click', () => cycle(1));
  carousel.addEventListener('pointermove', updatePointer);
  carousel.addEventListener('pointerleave', () => {
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pendingPointer = null;
    carousel.classList.remove('is-pointer-active');
    clearPointerTarget();
  });
  carousel.addEventListener('touchstart', e => {
    touchStartX = e.touches[0]?.clientX ?? null;
  }, { passive: true });
  carousel.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 35) cycle(delta < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });
  window.addEventListener('resize', layout);
  layout();
}

/* ─────────────────────────────────────────
   HERO TITLE — subtle mouse tilt
───────────────────────────────────────── */
function initHeroTilt() {
  if (!pointerFine.matches || prefersReducedMotion.matches) return;

  const hero = document.querySelector('.s-hero');
  const left  = hero?.querySelector('.hero-title-left');
  const right = hero?.querySelector('.hero-title-right');
  if (!hero || !left) return;

  hero.addEventListener('mousemove', e => {
    const dx = (e.clientX / window.innerWidth  - 0.5) * 14;
    const dy = (e.clientY / window.innerHeight - 0.5) *  8;
    gsap.to([left, right], { x: dx, y: dy, duration: 1, ease: 'expo.out' });
  });
  hero.addEventListener('mouseleave', () => {
    gsap.to([left, right], { x: 0, y: 0, duration: 1.2, ease: 'expo.out' });
  });
}

function initValuesCarousel() {
  const track = document.querySelector('.values-track');
  const prev = document.querySelector('.values-arrow-prev');
  const next = document.querySelector('.values-arrow-next');
  if (!track || !prev || !next) return;

  const scrollByCard = direction => {
    const card = track.querySelector('.value-card');
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const distance = card ? card.getBoundingClientRect().width + gap : track.clientWidth * .85;
    track.scrollBy({ left: direction * distance, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  };

  prev.addEventListener('click', () => scrollByCard(-1));
  next.addEventListener('click', () => scrollByCard(1));
}

/* ─────────────────────────────────────────
   REAL-TIME CLOCK (Cape Town GMT+2)
───────────────────────────────────────── */
function initClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      hour12: false,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };
  tick();
  setInterval(tick, 1000);
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */

// Seek hero video to the vibrant colorful frame
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  const seek = () => { heroVideo.currentTime = 7.5; };
  heroVideo.readyState >= 1 ? seek() : heroVideo.addEventListener('loadedmetadata', seek, { once: true });
}

initCanvasBorders();
initScrollAnimations();
initNavTheme();
initAiToolsView();
initAiMarqueeLoops();
initWorkCta();
initDesignRows();
initFAQ();
initDragScroll();
initHeroTilt();
initValuesCarousel();
initClock();

window.addEventListener('resize', () => ScrollTrigger.refresh());
