/* ============================================================
   ESTRELA STUDIO — main.js
   GSAP 3.12 + ScrollTrigger · Lenis · Canvas borders
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerFine = window.matchMedia('(pointer: fine)');
const desktopMotion = () => window.matchMedia('(min-width: 769px)').matches && !prefersReducedMotion.matches;

// 作品是面试官最优先查看的内容：首页中始终排在 AI 工具模块之前。
const selectedWorkSection = document.querySelector('.s-work');
const aiToolsSection = document.querySelector('.s-ai-tools');
if (selectedWorkSection && aiToolsSection) {
  aiToolsSection.parentNode.insertBefore(selectedWorkSection, aiToolsSection);
}

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
  // 手机端交给浏览器处理原生触摸，避免 Android 上纵向平滑滚动
  // 与作品区横向滑动争抢手势，造成“划了却没有反应”。
  syncTouch: desktopMotion(),
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
    onLeaveBack:() => nav.dataset.theme = 'light',
  });

  ScrollTrigger.create({
    trigger: '.s-footer',
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
    gsap.set('.reveal-up, .ai-tools-heading, .work-col, .work-section-title, .testi-card', {
      clearProps: 'all',
      opacity: 1,
    });
    return;
  }

  // PC 保留首屏视差与汇聚动画；手机首屏采用短画幅和静态排版，
  // 避免整屏被动画占满，也避免 fixed 文案滑出首屏后继续压住正文。
  if (desktopMotion()) {
    gsap.to('.hero-computer', {
      scrollTrigger: {
        trigger: '.s-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
      scale: 1.045,
      yPercent: 5,
    });

    const heroCopyTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.s-hero',
        start: 'top top',
        end: 'bottom 35%',
        scrub: 1.2,
      },
    });
    heroCopyTl
      .to('.hero-copy', { xPercent: 16, ease: 'none', duration: 1 }, 0)
      .to('.hero-computer', { xPercent: -8, ease: 'none', duration: 1 }, 0)
      .to('.hero-copy, .hero-computer', { autoAlpha: 0, ease: 'none', duration: 0.28 }, 0.72);
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
  } else {
    gsap.set('.hero-copy, .hero-computer', { clearProps: 'transform,opacity,visibility' });
  }

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
   MOBILE WORK — 原生横滑 + 当前项目反馈
   不接管手势，只根据卡片中心位置更新序号；实际滑动仍由浏览器完成。
───────────────────────────────────────── */
function initMobileWorkCarousel() {
  const viewport = document.querySelector('.s-work [data-hscroll]');
  const track = viewport?.querySelector('[data-hscroll-track]');
  const cards = track ? [...track.querySelectorAll(':scope > .work-col')] : [];
  const current = document.querySelector('[data-work-current]');
  const total = document.querySelector('[data-work-total]');
  if (!viewport || !cards.length || !current || !total) return;

  total.textContent = String(cards.length).padStart(2, '0');
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', '精选作品，左右滑动查看');
  viewport.tabIndex = 0;

  let raf = 0;
  const update = () => {
    raf = 0;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let active = 0;
    let nearest = Infinity;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);
      if (distance < nearest) {
        nearest = distance;
        active = index;
      }
    });
    cards.forEach((card, index) => card.classList.toggle('is-mobile-current', index === active));
    current.textContent = String(active + 1).padStart(2, '0');
  };
  const requestUpdate = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  viewport.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  requestUpdate();
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
  const items = [...document.querySelectorAll('.faq-item')];
  if (!items.length) return;

  function splitAnswerLines(answer) {
    const text = answer.dataset.text || answer.textContent.trim();
    answer.dataset.text = text;
    answer.replaceChildren();

    const words = text.split(/\s+/);
    const measures = words.map((word, index) => {
      const span = document.createElement('span');
      span.textContent = word + (index === words.length - 1 ? '' : ' ');
      span.style.whiteSpace = 'pre';
      answer.appendChild(span);
      return span;
    });

    const rows = [];
    measures.forEach((word) => {
      const top = word.offsetTop;
      const row = rows.at(-1);
      if (!row || Math.abs(row.top - top) > 1) rows.push({ top, words: [word.textContent] });
      else row.words.push(word.textContent);
    });

    answer.replaceChildren();
    return rows.map((row) => {
      const line = document.createElement('span');
      const inner = document.createElement('span');
      line.className = 'faq-answer-line';
      inner.className = 'faq-answer-line-inner';
      inner.textContent = row.words.join('').trim();
      line.appendChild(inner);
      answer.appendChild(line);
      return inner;
    });
  }

  function refreshScroll() {
    lenis.resize();
    ScrollTrigger.refresh();
  }

  function addBorderFollow(item) {
    if (!pointerFine.matches || prefersReducedMotion.matches) return;
    const border = item.querySelector('.faq-border');
    let current = 50;
    let target = 50;
    let active = false;
    let frame = 0;

    const render = () => {
      current += (target - current) * 0.14;
      border.style.setProperty('--faq-glow-x', `${current}%`);
      if (active || Math.abs(target - current) > 0.05) frame = requestAnimationFrame(render);
      else frame = 0;
    };

    item.addEventListener('pointerenter', () => {
      active = true;
      border.style.setProperty('--faq-glow-opacity', '1');
      if (!frame) frame = requestAnimationFrame(render);
    });
    item.addEventListener('pointermove', (event) => {
      const bounds = item.getBoundingClientRect();
      target = ((event.clientX - bounds.left) / bounds.width) * 100;
      if (!frame) frame = requestAnimationFrame(render);
    });
    item.addEventListener('pointerleave', () => {
      active = false;
      border.style.setProperty('--faq-glow-opacity', '0');
    });
  }

  document.fonts.ready.then(() => {
    const mobile = window.matchMedia('(max-width: 1099px)').matches;

    items.forEach((item, index) => {
      const inner = item.querySelector('.faq-item-inner');
      const answerWrapper = item.querySelector('.faq-answer-wrapper');
      const answer = item.querySelector('.faq-answer');
      const toggle = item.querySelector('.faq-toggle');
      const lines = splitAnswerLines(answer);
      const collapsible = mobile ? answerWrapper : inner;
      const closedHeight = mobile ? 0 : '7.5rem';
      const answerId = `faq-answer-${index + 1}`;

      answerWrapper.id = answerId;
      toggle.setAttribute('aria-controls', answerId);
      toggle.setAttribute('aria-expanded', 'false');
      gsap.set(collapsible, { height: closedHeight, overflow: 'hidden' });
      gsap.set(answer, { yPercent: 10 });
      gsap.set(lines, { yPercent: 110 });

      const accordionTimeline = gsap.timeline({
        paused: true,
        defaults: { overwrite: 'auto' },
        onComplete: refreshScroll,
        onReverseComplete: refreshScroll,
      });
      accordionTimeline.to(collapsible, { height: 'auto', duration: 0.8, ease: 'power3.out' }, 0);
      accordionTimeline.to(answer, { yPercent: 0, duration: 1.4, ease: 'power3.out' }, 0.1);
      accordionTimeline.to(lines, { yPercent: 0, duration: 1.4, ease: 'power3.out', stagger: 0.05 }, 0.1);

      const toggleItem = () => {
        const opening = !item.classList.contains('open');
        item.classList.toggle('open', opening);
        toggle.setAttribute('aria-expanded', String(opening));
        if (opening) {
          accordionTimeline.invalidate().play();
        } else {
          accordionTimeline.reverse();
        }
      };

      item.addEventListener('click', toggleItem);

      addBorderFollow(item);
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
   HERO — subtle mouse tilt
───────────────────────────────────────── */
function initHeroTilt() {
  if (!pointerFine.matches || prefersReducedMotion.matches) return;

  const hero = document.querySelector('.s-hero');
  const computer = hero?.querySelector('.hero-computer');
  if (!hero || !computer) return;

  hero.addEventListener('mousemove', e => {
    const dx = (e.clientX / window.innerWidth  - 0.5) * 14;
    const dy = (e.clientY / window.innerHeight - 0.5) *  8;
    gsap.to(computer, { x: dx, y: dy, duration: 1, ease: 'expo.out' });
  });
  hero.addEventListener('mouseleave', () => {
    gsap.to(computer, { x: 0, y: 0, duration: 1.2, ease: 'expo.out' });
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

initCanvasBorders();
initScrollAnimations();
initNavTheme();
initAiToolsView();
initAiMarqueeLoops();
initWorkCta();
initMobileWorkCarousel();
initDesignRows();
initFAQ();
initDragScroll();
initHeroTilt();
initClock();

window.addEventListener('resize', () => ScrollTrigger.refresh());
