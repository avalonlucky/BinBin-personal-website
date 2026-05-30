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
      const radius = el.classList.contains('nav-pill') ? 6 : (el.classList.contains('showreel-btn') ? r : 8);

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
    trigger: '.s-exp',
    start: 'top 60px',
    onEnter:    () => nav.dataset.theme = 'light',
    onLeaveBack:() => nav.dataset.theme = 'dark',
  });

}

/* ─────────────────────────────────────────
   SCROLL ANIMATIONS
───────────────────────────────────────── */
let _scrollAnimsDone = false;
function initScrollAnimations() {
  if (_scrollAnimsDone) return;
  _scrollAnimsDone = true;

  if (prefersReducedMotion.matches) {
    gsap.set('.reveal-up, .exp-desc, .exp-eyebrow, .work-col, .work-featured-desc, .work-all-link, .testi-card, .faq-item', {
      clearProps: 'all',
      opacity: 1,
    });
    return;
  }

  // ── EXP section — pin while images drift (matches original 3×vh scroll) ──
  if (desktopMotion()) {
    ScrollTrigger.create({
      trigger: '.s-exp',
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
    });
    gsap.utils.toArray('.exp-img').forEach((img, i) => {
      const yDist = [-120, 90, -60, 80, -100, 70, -50, 110][i] ?? 60;
      gsap.to(img, {
        y: yDist,
        ease: 'none',
        scrollTrigger: {
          trigger: '.s-exp',
          start: 'top top',
          end: '+=200%',
          scrub: 1.5,
        },
      });
    });
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

  // ── EXP heading lines (scrub-linked reveal) ──
  gsap.fromTo('.exp-heading .line span',
    { yPercent: 108 },
    {
      yPercent: 0, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: '.s-exp', start: 'top 92%', end: 'top 45%', scrub: true },
    });
  gsap.fromTo('.exp-showreel',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-exp', start: 'top 88%', end: 'top 55%', scrub: true },
    });
  gsap.fromTo('.exp-eyebrow',
    { opacity: 0, y: 28 },
    {
      opacity: 1, y: 0, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-exp', start: 'top 80%', end: 'top 48%', scrub: true },
    });
  gsap.fromTo('.exp-desc',
    { opacity: 0, y: 28 },
    {
      opacity: 1, y: 0, ease: 'expo.out',
      scrollTrigger: { trigger: '.s-exp', start: 'top 75%', end: 'top 42%', scrub: true },
    });

  // ── EXP images scatter in (scrub-linked; y reserved for parallax drift) ──
  gsap.utils.toArray('.exp-img').forEach((img, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    gsap.fromTo(img,
      { x: 60 * dir, opacity: 0, scale: 0.9 },
      {
        x: 0, opacity: 1, scale: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.s-exp', start: `top ${92 - i * 2}%`, end: `top ${55 - i * 2}%`, scrub: true },
      });
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

  // ── Featured 面板：逐行遮罩揭示 + 描述/链接上升（原站签名动画） ──
  gsap.fromTo('.work-featured-title .lmask-in',
    { yPercent: 110 },
    {
      yPercent: 0, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.s-work', start: 'top 85%', end: 'top 45%', scrub: true },
    });
  gsap.fromTo('.work-featured-desc, .work-all-link',
    { y: 28, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.s-work', start: 'top 78%', end: 'top 42%', scrub: true },
    });

  // ── 项目列：交错升起（cascade，不再整列一起） ──
  gsap.fromTo('.work-col',
    { y: 70, opacity: 0 },
    {
      y: 0, opacity: 1, ease: 'expo.out', stagger: 0.13,
      scrollTrigger: { trigger: '.s-work', start: 'top 82%', end: 'top 38%', scrub: true },
    });

  // ── Work counter follows scroll ──
  const counter = document.getElementById('workCounter');
  document.querySelectorAll('.work-item').forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 52%',
      onEnter:    () => animCounter(counter, i + 1),
      onLeaveBack:() => animCounter(counter, i),
    });
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

  // ── Services image from alternating sides (scrub-linked) ──
  gsap.utils.toArray('.svc-item').forEach((item, i) => {
    const fig = item.querySelector('.svc-fig');
    if (!fig) return;
    const dir = i % 2 === 0 ? -1 : 1;
    gsap.fromTo(fig,
      { x: 40 * dir, opacity: 0 },
      {
        x: 0, opacity: 1, ease: 'expo.out',
        scrollTrigger: { trigger: item, start: 'top 88%', end: 'top 58%', scrub: true },
      });
  });

  // ── Testimonial cards (scrub-linked, staggered) ──
  gsap.fromTo('.testi-card',
    { x: 50, opacity: 0 },
    {
      x: 0, opacity: 1, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: '.testi-track', start: 'top 90%', end: 'top 55%', scrub: true },
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
  gsap.utils.toArray('.svc-fig img, .about-img img').forEach(img => {
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
   WORK CARDS — "View project" 跟随鼠标
───────────────────────────────────────── */
function initWorkCta() {
  document.querySelectorAll('.work-col').forEach(card => {
    card.addEventListener('pointermove', e => {
      const b = card.getBoundingClientRect();
      const x = ((e.clientX - b.left) / b.width)  * 100;
      const y = ((e.clientY - b.top)  / b.height) * 100;
      card.style.setProperty('--cta-x', `${Math.min(82, Math.max(26, x))}%`);
      card.style.setProperty('--cta-y', `${Math.min(72, Math.max(24, y))}%`);
    });
  });
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
   TESTIMONIAL DRAG SCROLL
───────────────────────────────────────── */
function initDragScroll() {
  const track = document.getElementById('testiTrack');
  if (!track) return;

  let down = false, startX, scrollLeft;

  track.addEventListener('mousedown', e => {
    down = true; track.classList.add('is-dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { down = false; track.classList.remove('is-dragging'); });
  track.addEventListener('mouseup',    () => { down = false; track.classList.remove('is-dragging'); });
  track.addEventListener('mousemove', e => {
    if (!down) return;
    e.preventDefault();
    track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.6;
  });
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
initWorkCta();
initFAQ();
initDragScroll();
initHeroTilt();
initClock();

window.addEventListener('resize', () => ScrollTrigger.refresh());
