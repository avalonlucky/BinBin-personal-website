/* ============================================================
   CASE STUDY — case.js
   作品详情页的滚动架构与交互。GSAP + ScrollTrigger + Lenis。
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ─────────────────────────────────────────
   滚动容器与首页一致：main.page，不是 window
───────────────────────────────────────── */
const scroller = document.querySelector('.page');
const content  = document.querySelector('.page-scroll');
ScrollTrigger.defaults({ scroller });

const lenis = new Lenis({
  wrapper: scroller,
  content,
  lerp: 0.1,
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
    lenis.scrollTo(target.offsetTop, { offset: 0 });
  });
});

/* ─────────────────────────────────────────
   产品数据 — 名称与副标题取自单页原稿文本层，
   主色取自单页顶部色带实际取样，代号取自页脚。
───────────────────────────────────────── */
const PRODUCTS = [
  { slug: 'db-audit',          name: '昂楷数据库安全审计系统',     slogan: '数据安全风险的预警机',                  code: 'AAS-AP',    color: '#234DA1' },
  { slug: 'db-protect',        name: '昂楷数据库综合安全防护系统', slogan: '数据库保镖，只放合规「访客」',          code: 'AAS-DBSG',  color: '#F17D4E' },
  { slug: 'data-classify',     name: '昂楷数据安全分类分级系统',   slogan: '数据资产的编目师',                      code: 'AAS-DSC',   color: '#54C897' },
  { slug: 'security-toolkit',  name: '昂楷数据安全检查工具箱',     slogan: '全面体检，安全隐患无处遁形',            code: 'AAS-DST',   color: '#A8EAC2' },
  { slug: 'capability-assess', name: '昂楷数据安全能力评估系统',   slogan: '精准诊断安全短板，清晰指引提升路径',    code: 'AAS-SMCA',  color: '#358BF9' },
  { slug: 'dynamic-mask',      name: '昂楷数据动态脱敏系统',       slogan: '敏感数据实时保护利器',                  code: 'AAS-DM-D',  color: '#4B7DEE' },
  { slug: 'static-mask',       name: '昂楷数据静态脱敏系统',       slogan: '给敏感数据穿上「隐形防护衣」',          code: 'AAS-DM-S',  color: '#3C94FB' },
  { slug: 'static-watermark',  name: '昂楷数据静态水印溯源系统',   slogan: '电子指纹　溯源无忧',                    code: 'AAS-WTS-S', color: '#9F9CE0' },
  { slug: 'api-mask',          name: '昂楷应用 / API 脱敏',        slogan: '数据七十二变，隐私去无踪',              code: 'AAS-DM-A',  color: '#1388D0' },
  { slug: 'api-watermark',     name: '昂楷应用 / API 水印系统',    slogan: '为数据注入可追踪的指纹',                code: 'AAS-WT-A',  color: '#868EFE' },
  { slug: 'api-audit',         name: '昂楷 API 安全审计系统',      slogan: 'API 安全的「空中哨兵」',                code: 'AAS-API-A', color: '#82C2DE' },
  { slug: 'governance',        name: '昂楷数据安全综合治理平台',   slogan: '运营级数据安全治理「驾驶舱」',          code: 'AAS-SIMP',  color: '#026CAE' },
  { slug: 'anti-statistics',   name: '昂楷下一代防统方系统',       slogan: '智能甄别，精准定位到人',                code: 'AAS-P',     color: '#477A6B' },
];

const A = 'assets/work/ankki';
const thumb = p => `../${A}/thumb/${p.slug}-front.webp`;
const sheet = (p, side) => `../${A}/sheet/${p.slug}-${side}.webp`;

/* ─────────────────────────────────────────
   单页卡片
───────────────────────────────────────── */
function sheetCard(p, index, eager) {
  const el = document.createElement('button');
  el.className = 'cs-sheet';
  el.type = 'button';
  el.style.setProperty('--sheet-c', p.color);
  el.dataset.lb = index;
  el.setAttribute('aria-label', `放大查看 ${p.name}`);
  el.innerHTML = `
    <img src="${thumb(p)}" alt="${p.name}单页正面" loading="${eager ? 'eager' : 'lazy'}" decoding="async">
    <span class="cs-sheet-label"><b>${p.name}</b><span>${p.slogan}</span></span>`;
  return el;
}

/* ─────────────────────────────────────────
   HERO 单页墙 — 双轨反向，内容自动补足一轮
───────────────────────────────────────── */
function initWall() {
  const rows = document.querySelectorAll('.cs-wall-row');
  if (!rows.length) return;

  // 上排 7 款、下排 6 款
  const split = [PRODUCTS.slice(0, 7), PRODUCTS.slice(7)];

  rows.forEach((row, i) => {
    const set = split[i] || PRODUCTS;
    const build = () => set.forEach(p => row.appendChild(sheetCard(p, PRODUCTS.indexOf(p), i === 0)));
    build();
    // 补足到至少两倍容器宽度，保证 -50% 位移无缝衔接
    let guard = 0;
    while (row.scrollWidth < row.parentElement.clientWidth * 2 && guard < 6) { build(); guard++; }
    // 复制一整轮用于循环
    [...row.children].forEach(c => row.appendChild(c.cloneNode(true)));
  });
}

/* ─────────────────────────────────────────
   13 款全系列网格
───────────────────────────────────────── */
function initGrid() {
  const grid = document.querySelector('[data-grid13]');
  if (!grid) return;
  PRODUCTS.forEach((p, i) => grid.appendChild(sheetCard(p, i, false)));
}

/* ─────────────────────────────────────────
   副标题 pills — 染上各自产品主色
───────────────────────────────────────── */
function initPills() {
  const box = document.querySelector('[data-pills]');
  if (!box) return;
  PRODUCTS.forEach(p => {
    const el = document.createElement('span');
    el.className = 'cs-pill';
    el.style.setProperty('--pill-c', p.color);
    el.textContent = p.slogan;
    box.appendChild(el);
  });

  if (prefersReducedMotion.matches) return;
  gsap.from(box.children, {
    opacity: 0, y: 12, duration: .5, stagger: .055, ease: 'power2.out',
    scrollTrigger: { trigger: box, start: 'top 88%' },
  });
}

/* ─────────────────────────────────────────
   色彩系统 — 13 色板 ↔ 单页预览联动
───────────────────────────────────────── */
function initPalette() {
  const list = document.querySelector('[data-swatches]');
  const preview = document.querySelector('[data-palette-preview]');
  if (!list || !preview) return;

  const img  = preview.querySelector('img');
  const name = preview.querySelector('[data-pp-name]');
  const slog = preview.querySelector('[data-pp-slogan]');
  const code = preview.querySelector('[data-pp-code]');
  const fig  = preview.querySelector('.cs-palette-fig');

  let activeIndex = 0;

  const show = i => {
    const p = PRODUCTS[i];
    activeIndex = i;
    img.src = sheet(p, 'front');
    img.alt = `${p.name}单页正面`;
    name.textContent = p.name;
    slog.textContent = p.slogan;
    code.textContent = `${p.code}　·　${p.color.toUpperCase()}`;
    list.querySelectorAll('.cs-swatch').forEach((s, si) => s.classList.toggle('is-active', si === i));
  };

  PRODUCTS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cs-swatch';
    b.style.setProperty('--sw-c', p.color);
    b.innerHTML = `<i></i><span class="cs-swatch-t"><b>${p.name.replace(/^昂楷/, '')}</b><small>${p.code}</small></span>`;
    b.addEventListener('mouseenter', () => show(i));
    b.addEventListener('focus', () => show(i));
    b.addEventListener('click', () => show(i));
    list.appendChild(b);
  });

  fig.addEventListener('click', () => openLightbox(activeIndex));
  show(0);
}

/* ─────────────────────────────────────────
   翻面演示 — 滚动驱动 rotateY 0→180
───────────────────────────────────────── */
function initFlip() {
  const wrap = document.querySelector('[data-flip]');
  if (!wrap) return;
  const inner = wrap.querySelector('.cs-flip-inner');
  const front = document.querySelector('[data-flip-side="front"]');
  const back  = document.querySelector('[data-flip-side="back"]');
  const hint  = document.querySelector('.cs-flip-hint');

  back?.classList.add('is-out');

  if (prefersReducedMotion.matches) return;

  // rotateY 用 power1.inOut：中点角速度最快，正侧面（90°）一闪而过，
  // 不会停在“纸变成一条线”的那一帧。中途略微缩小，读起来像真的在翻。
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrap,
      start: 'top 68%',
      end: 'bottom 42%',
      scrub: 0.5,
      onUpdate: self => {
        hint?.style.setProperty('--flip-progress', self.progress.toFixed(3));
        const flipped = self.progress > 0.5;
        front?.classList.toggle('is-out', flipped);
        back?.classList.toggle('is-out', !flipped);
      },
    },
  });

  tl.to(inner, { rotateY: 180, ease: 'power1.inOut', duration: 1 }, 0)
    .to(inner, { scale: 0.94, ease: 'sine.inOut', duration: 0.5 }, 0)
    .to(inner, { scale: 1,    ease: 'sine.inOut', duration: 0.5 }, 0.5);
}

/* ─────────────────────────────────────────
   版式对比 — 左侧条逐条砸下，右侧块依次浮现
───────────────────────────────────────── */
function initLayoutCompare() {
  const box = document.querySelector('.cs-layouts');
  if (!box || prefersReducedMotion.matches) return;

  const old = box.querySelectorAll('.cs-layout:not(.is-mine) .cs-bar');
  const mine = box.querySelectorAll('.cs-layout.is-mine .cs-bar');

  gsap.from(old, {
    y: -14, opacity: 0, duration: .34, stagger: .06, ease: 'power3.in',
    scrollTrigger: { trigger: box, start: 'top 84%' },
  });
  gsap.from(mine, {
    scaleX: 0, opacity: 0, duration: .55, stagger: .13, ease: 'power2.out', delay: .45,
    scrollTrigger: { trigger: box, start: 'top 84%' },
  });
}

/* ─────────────────────────────────────────
   跨部门汇聚图 — 曲线描向中心
───────────────────────────────────────── */
function initHub() {
  const hub = document.querySelector('.cs-hub');
  if (!hub) return;
  const svg = hub.querySelector('.cs-hub-svg');
  const core = hub.querySelector('.cs-hub-core');
  const nodes = hub.querySelectorAll('.cs-hub-node');
  if (!svg || !core || !nodes.length) return;

  const draw = () => {
    if (window.innerWidth <= 768) { svg.innerHTML = ''; return; }
    const hb = hub.getBoundingClientRect();
    const cb = core.getBoundingClientRect();
    const cx = cb.left - hb.left + cb.width / 2;
    const cy = cb.top - hb.top + cb.height / 2;
    const r = cb.width / 2 + 6;

    svg.setAttribute('viewBox', `0 0 ${hb.width} ${hb.height}`);
    svg.innerHTML = [...nodes].map(n => {
      const nb = n.getBoundingClientRect();
      const fromRight = (nb.left - hb.left) < cx;
      const x = nb.left - hb.left + (fromRight ? nb.width : 0);
      const y = nb.top - hb.top + nb.height / 2;
      const ang = Math.atan2(y - cy, x - cx);
      const ex = cx + Math.cos(ang) * r;
      const ey = cy + Math.sin(ang) * r;
      const mx = (x + ex) / 2;
      return `<path d="M ${x} ${y} Q ${mx} ${y} ${ex} ${ey}" />`;
    }).join('');

    if (prefersReducedMotion.matches) return;
    svg.querySelectorAll('path').forEach(p => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, {
        strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut',
        scrollTrigger: { trigger: hub, start: 'top 78%' },
      });
    });
  };

  draw();
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 180); });
}

/* ─────────────────────────────────────────
   数字滚动
───────────────────────────────────────── */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const fmt = v => Math.round(v).toLocaleString('en-US') + suffix;

    if (prefersReducedMotion.matches) { el.textContent = fmt(target); return; }

    el.textContent = fmt(0);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.5, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: () => { el.textContent = fmt(obj.v); },
    });
  });
}

/* ─────────────────────────────────────────
   甘特条 / 里程碑
───────────────────────────────────────── */
function initGantt() {
  const g = document.querySelector('.cs-gantt');
  if (!g || prefersReducedMotion.matches) return;
  gsap.from(g.querySelectorAll('.cs-gantt-bar'), {
    scaleX: 0, opacity: 0, duration: .5, stagger: .035, ease: 'power2.out',
    scrollTrigger: { trigger: g, start: 'top 84%' },
  });
}

function initTimeline() {
  const tl = document.querySelector('.cs-timeline');
  if (!tl) return;
  const line = tl.querySelector('.cs-timeline-line');
  const rows = tl.querySelectorAll('.cs-ms');
  if (prefersReducedMotion.matches) return;

  if (line) {
    const setH = () => { line.style.height = `${tl.offsetHeight - 48}px`; };
    setH();
    window.addEventListener('resize', setH);
    gsap.to(line, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: tl, start: 'top 76%', end: 'bottom 62%', scrub: true },
    });
  }
  gsap.from(rows, {
    opacity: 0, x: -16, duration: .55, stagger: .12, ease: 'power2.out',
    scrollTrigger: { trigger: tl, start: 'top 80%' },
  });
}

/* ─────────────────────────────────────────
   通用进场
───────────────────────────────────────── */
function initReveal() {
  if (prefersReducedMotion.matches) return;
  document.querySelectorAll('.cs-section').forEach(sec => {
    const head = sec.querySelectorAll('.cs-num, .cs-title, .cs-lede');
    if (head.length) {
      gsap.from(head, {
        opacity: 0, y: 20, duration: .7, stagger: .08, ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 82%' },
      });
    }
  });

  const grouped = '.cs-card, .cs-stat, .cs-hub-node, .cs-spec, .cs-phase, .cs-deliver, .cs-doc, .cs-flow-step';
  document.querySelectorAll(grouped).forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 22, duration: .65, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
    });
  });
}

/* ─────────────────────────────────────────
   导航配色：深色 hero → 浅色正文 → 深色收尾
───────────────────────────────────────── */
function initNavTheme() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const body = document.querySelector('.cs-body');
  const closing = document.querySelector('.cs-closing');

  if (body) ScrollTrigger.create({
    trigger: body, start: 'top 60px',
    onEnter:     () => nav.dataset.theme = 'light',
    onLeaveBack: () => nav.dataset.theme = 'dark',
  });
  if (closing) ScrollTrigger.create({
    trigger: closing, start: 'top 60px',
    onEnter:     () => nav.dataset.theme = 'dark',
    onLeaveBack: () => nav.dataset.theme = 'light',
  });
}

/* ─────────────────────────────────────────
   LIGHTBOX — 正反面切换 + 键盘操作
───────────────────────────────────────── */
let lbIndex = 0;
let lbSide = 'front';

function showLightbox(lb) {
  lb.classList.add('is-open');
  lb.setAttribute('aria-hidden', 'false');
  lenis.stop();
  lb.querySelector('.cs-lb-close')?.focus();
}

function openLightbox(i) {
  const lb = document.querySelector('.cs-lb');
  if (!lb) return;
  lbIndex = i;
  lbSide = 'front';
  lb.classList.remove('is-single');
  renderLightbox();
  showLightbox(lb);
}

/* 单图模式：文件凭证、场景图等与产品数组无关的图 */
function openZoom(src, title, note) {
  const lb = document.querySelector('.cs-lb');
  if (!lb) return;
  lb.classList.add('is-single');
  const img = lb.querySelector('[data-lb-img]');
  img.src = src;
  img.alt = title || '';
  lb.querySelector('[data-lb-name]').textContent = title || '';
  lb.querySelector('[data-lb-meta]').textContent = note || '';
  showLightbox(lb);
}

function closeLightbox() {
  const lb = document.querySelector('.cs-lb');
  if (!lb) return;
  lb.classList.remove('is-open');
  lb.setAttribute('aria-hidden', 'true');
  lenis.start();
}

function renderLightbox() {
  const lb = document.querySelector('.cs-lb');
  const p = PRODUCTS[lbIndex];
  const img = lb.querySelector('[data-lb-img]');
  img.src = sheet(p, lbSide);
  img.alt = `${p.name}单页${lbSide === 'front' ? '正面' : '背面'}`;
  lb.querySelector('[data-lb-name]').textContent = p.name;
  lb.querySelector('[data-lb-meta]').textContent =
    `${p.slogan}　·　${p.code}　·　${lbSide === 'front' ? '正面' : '背面'} ${lbIndex + 1}/${PRODUCTS.length}`;
  lb.querySelector('[data-lb-flip]').textContent = lbSide === 'front' ? '看背面 →' : '← 看正面';
}

function initLightbox() {
  const lb = document.querySelector('.cs-lb');
  if (!lb) return;

  const step = d => { lbIndex = (lbIndex + d + PRODUCTS.length) % PRODUCTS.length; lbSide = 'front'; renderLightbox(); };

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-lb]');
    if (t) { e.preventDefault(); openLightbox(Number(t.dataset.lb)); return; }

    const z = e.target.closest('[data-zoom]');
    if (z) { e.preventDefault(); openZoom(z.dataset.zoom, z.dataset.zoomTitle, z.dataset.zoomNote); }
  });

  lb.querySelector('.cs-lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.cs-lb-prev').addEventListener('click', () => step(-1));
  lb.querySelector('.cs-lb-next').addEventListener('click', () => step(1));
  lb.querySelector('[data-lb-flip]').addEventListener('click', () => {
    lbSide = lbSide === 'front' ? 'back' : 'front';
    renderLightbox();
  });
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (lb.classList.contains('is-single')) return;   // 单图模式没有前后与翻面
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
    if (e.key === ' ') { e.preventDefault(); lbSide = lbSide === 'front' ? 'back' : 'front'; renderLightbox(); }
  });
}

/* ─────────────────────────────────────────
   导航药丸描边（与首页一致）
───────────────────────────────────────── */
function initCanvasBorders() {
  if (prefersReducedMotion.matches) return;

  document.querySelectorAll('[data-border]').forEach(el => {
    const canvas = el.querySelector('.border-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = Math.random() * Math.PI * 2;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = el.offsetWidth  * dpr;
      canvas.height = el.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }

    function tick() {
      const w = el.offsetWidth, h = el.offsetHeight;
      const radius = el.classList.contains('nav-pill') ? 6 : 8;
      const isLight = document.getElementById('nav')?.dataset.theme === 'light';

      ctx.clearRect(0, 0, w, h);
      roundRect(0.5, 0.5, w - 1, h - 1, radius);
      ctx.strokeStyle = isLight ? 'rgba(2,2,2,0.1)' : 'rgba(251,251,244,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      phase += 0.012;
      const lx = Math.cos(phase) * w * 0.5 + w * 0.5;
      const ly = Math.sin(phase) * h * 0.5 + h * 0.5;
      const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, Math.max(w, h) * 0.6);
      grad.addColorStop(0, isLight ? 'rgba(2,2,2,0.35)' : 'rgba(251,251,244,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      roundRect(0.5, 0.5, w - 1, h - 1, radius);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = grad;
      ctx.stroke();

      requestAnimationFrame(tick);
    }

    new ResizeObserver(resize).observe(el);
    resize();
    tick();
  });
}

function initClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };
  tick();
  setInterval(tick, 1000);
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
initWall();
initGrid();
initPills();
initPalette();
initFlip();
initLayoutCompare();
initHub();
initCounters();
initGantt();
initTimeline();
initReveal();
initNavTheme();
initLightbox();
initCanvasBorders();
initClock();

window.addEventListener('load', () => ScrollTrigger.refresh());
window.addEventListener('resize', () => ScrollTrigger.refresh());
