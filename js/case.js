/* ============================================================
   CASE STUDY — case.js
   作品详情页的滚动架构与交互。GSAP + ScrollTrigger + Lenis。
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

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
  // 真机触摸交给浏览器原生滚动。Lenis 的触摸同步会和移动端 sticky / pin
  // 争夺同一个位移，表现为占位层在走、内容却没有跟上。
  syncTouch: false,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* main.page 才是真正的滚动容器，浏览器刷新时不会替它恢复 scrollTop。
   只在刷新 / 前进后退时恢复；从其他页面正常点进来仍从顶部开始。 */
const scrollRestoreKey = `case-scroll:${location.pathname}`;
const navigationType = performance.getEntriesByType('navigation')[0]?.type;
const shouldRestoreScroll = navigationType === 'reload' || navigationType === 'back_forward';
let lastCaseScroll = scroller.scrollTop;
let savedCaseScroll = 0;
try { savedCaseScroll = Number(sessionStorage.getItem(scrollRestoreKey)) || 0; } catch (error) { /* storage 不可用时保持浏览器默认 */ }

lenis.on('scroll', event => { lastCaseScroll = event.scroll; });
window.addEventListener('pagehide', () => {
  try { sessionStorage.setItem(scrollRestoreKey, String(lastCaseScroll)); } catch (error) { /* storage 不可用时忽略 */ }
});

function restoreCaseScroll() {
  if (!shouldRestoreScroll || savedCaseScroll <= 0) return;
  lenis.scrollTo(savedCaseScroll, { immediate: true, force: true });
  scroller.scrollTop = savedCaseScroll;
  ScrollTrigger.update();
}

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
    <img src="${thumb(p)}" alt="${p.name}单页正面" width="420" height="543"
         loading="${eager ? 'eager' : 'lazy'}" decoding="async">
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

/* ═════════════════════════════════════════
   内刊案例（《昂楷视界》）专用交互
   —— 元素不存在时各函数直接返回，两个详情页共用同一个 case.js。
═════════════════════════════════════════ */

/* ─────────────────────────────────────────
   印章 — 阳刻 / 阴刻 切换
   手稿里做过「黑白反白实验」，这里把两个结果做成可切换的实物。
───────────────────────────────────────── */
function initSeal() {
  const box = document.querySelector('[data-seal]');
  if (!box) return;
  const stage = box.querySelector('.cs-seal-stage');
  const faces = {
    relief:  box.querySelector('[data-seal-face="relief"]'),   // 阳刻（正形）
    inverse: box.querySelector('[data-seal-face="inverse"]'),   // 阴刻（反白）
  };
  const btns = [...box.querySelectorAll('[data-seal-mode]')];
  const now = box.querySelector('[data-seal-now]');
  const LABEL = { relief: '阳刻 · 正形', inverse: '阴刻 · 反白' };

  let cur = null;
  const show = mode => {
    if (mode === cur) return;
    cur = mode;
    Object.entries(faces).forEach(([k, el]) => el?.classList.toggle('is-off', k !== mode));
    stage.classList.toggle('is-inverse', mode === 'inverse');
    btns.forEach(b => b.classList.toggle('is-active', b.dataset.sealMode === mode));
    if (now) now.textContent = LABEL[mode];
  };

  btns.forEach(b => b.addEventListener('click', () => show(b.dataset.sealMode)));
  show('relief');
  // 面板组会按滚动位置调它，所以挂出去
  window.__sealShow = show;
}

/* ─────────────────────────────────────────
   横向面板组 — 把区块钉在视口，纵向滚动换算成横向位移。
   走到最后一张才把滚动还给页面。窄屏不介入（CSS 已退回纵向堆叠）。
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   礼盒开启 — 视频进度绑定滚轮
   data-scroll-screens 控制滚完视频需要多少屏，数字越大越慢。
   ScrollTrigger 只更新目标时间；真正的 seek 在 rAF 里做插值并按源视频帧率
   量化，避免 wheel 事件密度和浏览器解码速度不同步。
───────────────────────────────────────── */
function initScrubVideo() {
  const box = document.querySelector('[data-scrub-video]');
  if (!box) return;
  const video = box.querySelector('video');
  if (!video) return;

  const scrollTrack = box.closest('.cs-reveal-scroll') || box;
  const mobileScrub = window.matchMedia('(max-width: 768px)').matches || hasCoarsePointer;
  if (mobileScrub) scrollTrack.classList.add('is-mobile-scrub');
  const scrollScreens = Math.max(1, Number(box.dataset.scrollScreens) || 3.2);
  const sourceFps = Math.max(1, Number(box.dataset.videoFps) || 30);
  const frameDuration = 1 / sourceFps;
  const reducedPoster = box.dataset.reducedPoster;
  const sourceUrl = mobileScrub ? video.dataset.src : (video.dataset.srcHq || video.dataset.src);

  let trigger;
  let targetTime = 0;
  let displayTime = 0;
  let raf = 0;
  let duration = 0;

  const maxTime = () => Math.max(0, duration - frameDuration);
  const clampTime = value => Math.min(maxTime(), Math.max(0, value));

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(renderFrame);
  };

  const renderFrame = () => {
    raf = 0;
    if (!duration) return;

    const delta = targetTime - displayTime;
    displayTime = Math.abs(delta) <= frameDuration * 0.35
      ? targetTime
      : displayTime + delta * 0.24;

    // 只请求视频里真实存在的帧，减少无意义的小数时间 seek。
    const nextTime = clampTime(Math.round(displayTime * sourceFps) / sourceFps);
    if (!video.seeking && Math.abs(video.currentTime - nextTime) >= frameDuration * 0.45) {
      try { video.currentTime = nextTime; } catch (error) { /* 元数据尚未可用，下一帧重试 */ }
    }

    if (Math.abs(targetTime - displayTime) > frameDuration * 0.2 || video.seeking) schedule();
  };

  const syncToProgress = (progress, immediate = false) => {
    if (!duration) return;
    targetTime = clampTime(progress * duration);
    if (immediate) displayTime = targetTime;
    box.classList.toggle('is-open', progress > 0.08);
    schedule();
  };

  const prepareVideo = () => {
    video.pause();
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration) return;
    syncToProgress(trigger?.progress || 0, true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  if (prefersReducedMotion.matches) {
    scrollTrack.classList.add('is-reduced');
    box.classList.add('is-open', 'is-reduced');
    if (reducedPoster) video.poster = reducedPoster;
    return;
  }

  video.addEventListener('seeked', schedule);
  video.addEventListener('loadedmetadata', prepareVideo);

  const triggerOptions = {
    trigger: box,
    start: mobileScrub ? 'top bottom' : 'top top',
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: self => syncToProgress(self.progress),
    onRefresh: self => syncToProgress(self.progress, true),
  };

  if (mobileScrub) {
    // The first frame starts moving as soon as the video enters from below.
    // Finish when its top reaches the viewport top, without extra track space.
    triggerOptions.end = 'top top';
  } else {
    triggerOptions.end = () => '+=' + Math.round(window.innerHeight * scrollScreens);
    triggerOptions.pin = true;
    triggerOptions.pinSpacing = true;
    triggerOptions.anticipatePin = 1;
  }

  trigger = ScrollTrigger.create(triggerOptions);

  // Cloudflare Pages 对部分 MP4 不返回 Range。直接让 <video> 请求时，浏览器每次
  // seek 都会被完整 200 响应夹回 0；先拉成同源 Blob 后，逐帧定位不再依赖服务器。
  const loadScrubSource = async () => {
    if (!sourceUrl) return;
    try {
      const response = await fetch(sourceUrl, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
      const blob = await response.blob();
      video.src = URL.createObjectURL(blob);
    } catch (error) {
      // 本地 file 预览或 fetch 被拦时仍可退回普通视频 URL。
      video.src = sourceUrl;
    }
    video.load();
  };
  loadScrubSource();

  // 浏览器恢复滚动位置发生在 load/pageshow 附近；重新量尺寸并同步当前帧。
  window.addEventListener('pageshow', () => requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    syncToProgress(trigger.progress, true);
  }));
}

/* ─────────────────────────────────────────
   竖向时间轴（.cs-line）— 主线随滚动描出来，经过的圆点点亮
───────────────────────────────────────── */
function initLine() {
  const lines = [...document.querySelectorAll('[data-line]')];
  if (!lines.length) return;

  lines.forEach(line => {
    const fill  = line.querySelector('[data-line-fill]');
    const items = [...line.querySelectorAll('[data-line-item]')];
    if (!fill || !items.length) return;

    const draw = () => {
      const r = line.getBoundingClientRect();
      // 描到视口中线：线头始终在读者正在读的那一行附近
      const p = (window.innerHeight * 0.5 - r.top) / r.height;
      fill.style.height = (Math.max(0, Math.min(1, p)) * 100).toFixed(2) + '%';
      items.forEach(it => {
        const d = it.querySelector('.cs-line-dot').getBoundingClientRect();
        it.classList.toggle('is-on', d.top <= window.innerHeight * 0.5);
      });
    };

    ScrollTrigger.create({
      trigger: line,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: draw,
      onRefresh: draw,
    });
    draw();
  });
}

function initDeck() {
  const decks = [...document.querySelectorAll('[data-deck]')];
  if (!decks.length) return;

  decks.forEach(deck => {
    const track = deck.querySelector('[data-deck-track]');
    if (!track) return;
    const steps = [...deck.querySelectorAll('[data-deck-step]')];
    const panels = [...track.querySelectorAll('.cs-panel')];
    const fill  = deck.querySelector('[data-deck-fill]');
    const sealPanel = deck.querySelector('[data-seal]')?.closest('.cs-panel');

    const activate = (i, currentSteps = steps, currentPanels = panels) => {
      steps.forEach(s => s.classList.remove('is-on'));
      panels.forEach(p => p.classList.remove('is-active'));
      currentSteps[i]?.classList.add('is-on');
      currentPanels[i]?.classList.add('is-active');
    };
    activate(0);

    gsap.matchMedia().add('(min-width: 769px)', () => {
      // 轨道左内边距同时是「最后一张离右缘的余量」
      const pad = () => parseFloat(getComputedStyle(track).paddingRight) || 0;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + pad());
      if (distance() <= 0) return;

      const tween = gsap.to(track, { x: () => -distance(), ease: 'none' });
      const st = ScrollTrigger.create({
        trigger: deck,
        start: () => `top ${(document.querySelector('#nav')?.offsetHeight || 64) + 12}px`,
        end: () => '+=' + distance(),
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.6,
        invalidateOnRefresh: true,
        animation: tween,
        onUpdate: self => {
          const i = Math.min(steps.length - 1, Matheq(self.progress, steps.length));
          activate(i);
          if (fill) fill.style.width = (self.progress * 100).toFixed(2) + '%';
          // 印章：面板中心越过视口中线就翻面，不用点按钮
          if (sealPanel && window.__sealShow) {
            const r = sealPanel.getBoundingClientRect();
            window.__sealShow(r.left + r.width / 2 < window.innerWidth * 0.5 ? 'inverse' : 'relief');
          }
        },
      });

      return () => { st.kill(); tween.kill(); gsap.set(track, { clearProps: 'x' }); };
    });

    // 手机端把区块经过视口的进度映射成横向叙事。页面保持正常流动，
    // 避免 pin 额外制造一整屏甚至数屏高的空白占位。
    gsap.matchMedia().add('(max-width: 768px)', () => {
      const view = deck.querySelector('.cs-deck-view');
      if (!view) return;
      const visiblePanels = panels.filter(panel => panel.offsetParent !== null);
      const distance = () => Math.max(0, track.scrollWidth - view.clientWidth);
      if (distance() <= 0) return;

      view.classList.add('is-auto-x');
      const tween = gsap.to(track, { x: () => -distance(), ease: 'none' });
      const st = ScrollTrigger.create({
        trigger: view,
        start: 'top 92%',
        end: 'bottom 8%',
        scrub: 0.45,
        invalidateOnRefresh: true,
        animation: tween,
        onUpdate: self => {
          const active = Math.min(visiblePanels.length - 1, Matheq(self.progress, visiblePanels.length));
          activate(active, [], visiblePanels);
          if (fill) fill.style.width = `${(self.progress * 100).toFixed(2)}%`;
          if (sealPanel && window.__sealShow) {
            window.__sealShow(visiblePanels[active] === sealPanel ? 'inverse' : 'relief');
          }
        },
      });

      return () => {
        st.kill();
        tween.kill();
        view.classList.remove('is-auto-x');
        gsap.set(track, { clearProps: 'x' });
      };
    });
  });
}

/* 手机端同类横向卡片统一由纵向滚动驱动。卡片在区块自然经过视口时推进，
   不 pin、不增加占位；反向滚动、停止和恢复仍由 ScrollTrigger 接管。 */
function initMobileAutoRails() {
  const rails = [
    ...document.querySelectorAll('.case-page.is-vision .is-proofroom .cs-line'),
    ...document.querySelectorAll('.case-page.is-vision .is-outcome .cs-lessons'),
  ];
  if (!rails.length) return;

  gsap.matchMedia().add('(max-width: 768px)', () => {
    const made = rails.map(view => {
      const distance = () => Math.max(0, view.scrollWidth - view.clientWidth);
      if (distance() <= 0) return null;

      view.classList.add('is-auto-x');
      view.scrollLeft = 0;
      const tween = gsap.to(view, { scrollLeft: () => distance(), ease: 'none' });
      const st = ScrollTrigger.create({
        trigger: view,
        start: 'top 92%',
        end: 'bottom 8%',
        scrub: 0.45,
        invalidateOnRefresh: true,
        animation: tween,
      });
      return { view, tween, st };
    }).filter(Boolean);

    return () => made.forEach(({ view, tween, st }) => {
      st.kill();
      tween.kill();
      view.classList.remove('is-auto-x');
      view.scrollLeft = 0;
    });
  });
}

/* 进度 → 第几步。步数少时四舍五入会让第一步一闪而过，用等分区间更稳。 */
function Matheq(progress, n) {
  return Math.max(0, Math.min(n - 1, Math.floor(progress * n - 1e-6)));
}

/* ─────────────────────────────────────────
   目录三级优先级 — hover 卡片，点亮真实目录页上对应的版面位置
   坐标是在导出图上叠百分比网格量出来的（1800×1187），
   用百分比存，图片换尺寸也不用改。
───────────────────────────────────────── */
const TOC_HOTSPOTS = [
  // 01 最瞩目：封面核心文章，占掉左页大半，配大图 + 摘要 + 署名
  [{ l: 23.4, t: 21.8, w: 24.2, h: 43.0 }],
  // 02 图文结合：从每章挑出的代表文章，各自单独配图
  [{ l: 52.6, t: 25.2, w: 19.0, h: 22.0 },
   { l: 52.6, t: 48.6, w: 19.0, h: 21.5 },
   { l: 77.6, t: 50.2, w: 17.8, h: 40.5 }],
  // 03 基础信息层：常规条目，点线引导 + 页码
  [{ l: 23.4, t: 69.5, w: 24.2, h: 9.5 },
   { l: 23.4, t: 79.5, w: 24.2, h: 12.5 },
   { l: 52.6, t: 11.5, w: 19.0, h: 12.0 },
   { l: 77.6, t: 11.5, w: 17.8, h: 13.0 }],
];

function initTocMap() {
  const map = document.querySelector('[data-tocmap]');
  if (!map) return;
  const fig   = map.querySelector('.cs-tocmap-fig');
  // 优先级卡不一定和图在同一个容器里：面板组把图放进 .cs-panel-fig、
  // 把卡片放进 .cs-panel-txt，只在 map 内部找会一张都找不到，
  // 联动就静默失效。往上找到共同祖先再找卡片。
  const scope = map.closest('.cs-panel, .cs-section, .cs-deck') || document;
  const prios = [...scope.querySelectorAll('.cs-prio')];
  if (!fig || !prios.length) return;

  // 按数据建热区：每个优先级一组，同组一起亮
  const groups = TOC_HOTSPOTS.map((boxes, gi) => boxes.map(b => {
    const el = document.createElement('div');
    el.className = 'cs-hot';
    el.style.cssText = `left:${b.l}%;top:${b.t}%;width:${b.w}%;height:${b.h}%`;
    if (b === boxes[0]) {
      const tag = document.createElement('span');
      tag.textContent = prios[gi]?.dataset.prioLabel || `0${gi + 1}`;
      el.appendChild(tag);
    }
    fig.appendChild(el);
    return el;
  }));

  let current = -1;
  const light = gi => {
    if (gi === current) return;
    current = gi;
    groups.forEach((g, i) => g.forEach(el => el.classList.toggle('is-on', i === gi)));
    prios.forEach((p, i) => p.classList.toggle('is-active', i === gi));
    fig.classList.toggle('is-lit', gi >= 0);
  };

  prios.forEach((p, i) => {
    p.addEventListener('mouseenter', () => light(i));
    p.addEventListener('focus',      () => light(i));
    p.addEventListener('click',      () => light(current === i ? -1 : i));
  });
  // 只在整块移出时才灭，卡片之间来回移动不闪
  map.addEventListener('mouseleave', () => light(-1));
}

/* ─────────────────────────────────────────
   印章式页码演示 — 上一页 / 下一页
   页码按奇偶落到左下或右下，正是规范里那条
   「奇数页左对齐、偶数页右对齐，距边各 12mm」。
───────────────────────────────────────── */
function initPageDemo() {
  const box = document.querySelector('[data-pagedemo]');
  if (!box) return;
  const num   = box.querySelector('.cs-pd-num');
  const label = box.querySelector('.cs-pd-num b');
  const state = box.querySelector('[data-pd-state]');
  const head  = box.querySelector('.cs-pd-head');
  const MAX = 84;                       // 第三期共 84 页（42 个跨页）
  const HEADS = [
    [3,  '刊首语 / KANSHOUYU'],
    [9,  '鸿程·笃行 / HONGCHENG·DUXING'],
    [27, '行澜·领驭 / HANGLAN·LINGYU'],
    [36, '实战·撷英 / SHIZHAN·XIEYING'],
    [58, '心语·织梦 / XINYU·ZHIMENG'],
  ];
  let page = 27;

  const render = () => {
    const odd = page % 2 === 1;
    label.textContent = page;
    // 12mm / 210mm ≈ 5.7% —— 按刊物的实际边距换算成百分比
    num.style.left  = odd ? '5.7%' : 'auto';
    num.style.right = odd ? 'auto' : '5.7%';
    state.innerHTML = `第 <b>${page}</b> 页 · ${odd ? '奇数页 · 靠左' : '偶数页 · 靠右'} · 距边 12mm`;
    const h = HEADS.filter(([from]) => page >= from).pop();
    head.textContent = h ? h[1] : '目录 / CONTENTS';
  };

  box.querySelectorAll('[data-pd-step]').forEach(b => {
    b.addEventListener('click', () => {
      page = Math.min(MAX, Math.max(1, page + Number(b.dataset.pdStep)));
      render();
    });
  });
  render();
}

/* ─────────────────────────────────────────
   刊物阅读器 — 整本翻页
   页面图在 assets/work/vision/book/<key>/000.webp 起编号。
   第三期原始 PDF 是跨页版，导出时已拆成单页并按
   「封面 → p1..p82 → 封底」重新排好。
───────────────────────────────────────── */
const BOOKS = [
  { key: 'v3',  name: '《昂楷视界》第三期', sub: '十五周年特刊', pages: 84,  ar: 0.758 },
  { key: 'v4',  name: '《昂楷视界》第四期', sub: '数安中国 · 环球智慧', pages: 108, ar: 0.775 },
  { key: 'dao', name: '《昂楷之道》',       sub: '同道 · 同行 · 同心', pages: 108, ar: 0.780 },
];

function initReader() {
  const rd = document.querySelector('[data-reader]');
  if (!rd) return;

  const stageBook = rd.querySelector('.cs-rd-book');
  const pgL   = rd.querySelector('.cs-rd-pg.is-left');
  const pgR   = rd.querySelector('.cs-rd-pg.is-right');
  const flip  = rd.querySelector('.cs-rd-flip');
  const faceF = flip.querySelector('.cs-rd-face.front img');
  const faceB = flip.querySelector('.cs-rd-face.back img');
  const tabsBox = rd.querySelector('.cs-rd-tabs');
  const coach = rd.querySelector('[data-rd-coach]');
  const range = rd.querySelector('.cs-rd-range');
  const count = rd.querySelector('.cs-rd-count');
  const btnPrev = rd.querySelector('.cs-rd-nav.prev');
  const btnNext = rd.querySelector('.cs-rd-nav.next');
  const hitPrev = rd.querySelector('.cs-rd-hit.prev');
  const hitNext = rd.querySelector('.cs-rd-hit.next');

  let book = BOOKS[0];
  let pos = 0;
  let busy = false;
  let queuedTurns = 0;
  let readerHistoryActive = false;
  const single = () => window.innerWidth <= 768;

  const url = i => (i == null || i < 0 || i >= book.pages)
    ? null : `../assets/work/vision/book/${book.key}/${String(i).padStart(3, '0')}.webp`;

  // 桌面按跨页走：pos 0 只有封面，之后 left=2p-1 / right=2p
  const leftIdx  = p => single() ? null : (p === 0 ? null : 2 * p - 1);
  const rightIdx = p => single() ? p : 2 * p;
  const maxPos   = () => single() ? book.pages - 1 : Math.floor(book.pages / 2);

  const setImg = (slot, i) => {
    const src = url(i);
    const img = slot.querySelector('img');
    slot.classList.toggle('is-blank', !src);
    if (src) { img.src = src; img.style.visibility = ''; }
    else { img.removeAttribute('src'); img.style.visibility = 'hidden'; }
  };

  // 只预取前后几页，300 张图不能一次性拉
  const preload = () => {
    const base = single() ? pos : 2 * pos;
    for (let d = -3; d <= 5; d++) {
      const u = url(base + d);
      if (u) { const im = new Image(); im.src = u; }
    }
  };

  const render = () => {
    stageBook.style.setProperty('--pg-ar', book.ar);
    stageBook.classList.toggle('is-single', single());
    setImg(pgL, leftIdx(pos));
    setImg(pgR, rightIdx(pos));
    // 页码直接用数组下标——它正好等于刊物上印的页码（下标 0 是封面、最后一张是封底），
    // 之前 +1 显示成 4–5、纸上却印着 3 和 4，对不上。
    const l = leftIdx(pos), r = rightIdx(pos);
    const last = book.pages - 1;
    const nameOf = i => i === 0 ? '封面' : (i === last ? '封底' : String(i));
    let label;
    if (l == null || l >= book.pages) label = nameOf(Math.min(r, last));
    else if (r >= book.pages)         label = nameOf(l);
    else                              label = `${nameOf(l)}–${nameOf(r)}`;
    count.innerHTML = `<b>${label}</b> · 共 ${book.pages} 页`;
    range.max = maxPos();
    range.value = pos;
    const atStart = pos <= 0, atEnd = pos >= maxPos();
    btnPrev.disabled = hitPrev.disabled = atStart;
    btnNext.disabled = hitNext.disabled = atEnd;
    preload();
  };

  /* ── 翻页：一层绕书脊旋转的元素，正面是当前页、背面是翻过去看到的那页 ── */
  const COACH_KEY = 'maridian-reader-coached';
  const hideCoach = remember => {
    if (!coach || !coach.classList.contains('is-on')) return;
    coach.classList.remove('is-on');
    coach.setAttribute('aria-hidden', 'true');
    if (remember) { try { localStorage.setItem(COACH_KEY, '1'); } catch (e) {} }
  };

  const turn = dir => {
    /* 手机上快速连点时，不丢掉动画期间的输入，也不让多个 GSAP
       翻页同时改 pos。最多预排 4 页，防止连点把队列拖得太长。 */
    if (busy) {
      queuedTurns = Math.max(-4, Math.min(4, queuedTurns + dir));
      return;
    }
    const target = pos + dir;
    if (target < 0 || target > maxPos()) {
      queuedTurns = 0;
      return;
    }
    hideCoach(true);          // 翻过一次就说明学会了
    busy = true;

    const continueQueuedTurn = () => {
      if (!queuedTurns) return;
      const nextDir = Math.sign(queuedTurns);
      queuedTurns -= nextDir;
      requestAnimationFrame(() => turn(nextDir));
    };

    if (prefersReducedMotion.matches) {
      pos = target;
      render();
      busy = false;
      continueQueuedTurn();
      return;
    }

    let frontI, backI, underSlot, underI;
    if (dir > 0) {
      frontI = rightIdx(pos);
      backI  = single() ? target : leftIdx(target);
      underSlot = pgR; underI = single() ? rightIdx(target) : rightIdx(target);
    } else {
      frontI = single() ? pos : leftIdx(pos);
      backI  = single() ? target : rightIdx(target);
      underSlot = single() ? pgR : pgL; underI = single() ? rightIdx(target) : leftIdx(target);
    }

    faceF.src = url(frontI) || '';
    faceB.src = url(backI) || '';
    faceF.style.visibility = url(frontI) ? '' : 'hidden';
    faceB.style.visibility = url(backI) ? '' : 'hidden';
    // 翻页元素盖住的那一格，先换成翻完之后应该露出的页
    setImg(underSlot, underI);

    flip.classList.add('is-on');
    flip.classList.toggle('to-left', dir > 0);
    flip.classList.toggle('to-right', dir < 0);
    gsap.fromTo(flip, { rotateY: 0 }, {
      rotateY: dir > 0 ? -180 : 180,
      duration: 0.72,
      ease: 'power2.inOut',
      onComplete: () => {
        pos = target;
        flip.classList.remove('is-on');
        gsap.set(flip, { rotateY: 0 });
        render();
        busy = false;
        continueQueuedTurn();
      },
    });
  };

  /* ── 拖拽翻页 ── */
  let drag = null;
  const onDown = e => {
    if (busy || e.button === 1 || e.button === 2) return;
    const r = stageBook.getBoundingClientRect();
    const half = single() ? 1 : 2;
    const dir = (e.clientX - r.left) > r.width / half ? 1 : -1;
    if (single() && (e.clientX - r.left) < r.width / 2) return;   // 窄屏左半边不接管
    if (pos + dir < 0 || pos + dir > maxPos()) return;
    drag = { x0: e.clientX, dir, w: r.width / (single() ? 1 : 2), moved: 0, started: false };
  };
  const onMove = e => {
    if (!drag) return;
    const dx = e.clientX - drag.x0;
    drag.moved = Math.abs(dx);
    if (!drag.started) {
      if (drag.moved < 8) return;
      drag.started = true;
      hideCoach(true);
      // 起手时才装配翻页元素，避免每次点击都闪一下
      const d = drag.dir;
      const frontI = d > 0 ? rightIdx(pos) : (single() ? pos : leftIdx(pos));
      const backI  = d > 0 ? (single() ? pos + 1 : leftIdx(pos + 1)) : (single() ? pos - 1 : rightIdx(pos - 1));
      faceF.src = url(frontI) || ''; faceB.src = url(backI) || '';
      flip.classList.add('is-on');
      flip.classList.toggle('to-left', d > 0);
      flip.classList.toggle('to-right', d < 0);
    }
    const p = Math.min(1, Math.max(0, (drag.dir > 0 ? -dx : dx) / drag.w));
    gsap.set(flip, { rotateY: drag.dir > 0 ? -180 * p : 180 * p });
    drag.p = p;
  };
  const onUp = () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.started) return;
    flip.classList.remove('is-on');
    gsap.set(flip, { rotateY: 0 });
    if ((d.p || 0) > 0.28) turn(d.dir);
  };
  stageBook.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  hitPrev.addEventListener('click', () => turn(-1));
  hitNext.addEventListener('click', () => turn(1));
  btnPrev.addEventListener('click', () => turn(-1));
  btnNext.addEventListener('click', () => turn(1));
  range.addEventListener('input', () => { if (busy) return; pos = Number(range.value); render(); });

  /* ── 刊物切换 ── */
  const showBook = key => {
    queuedTurns = 0;
    busy = false;
    gsap.killTweensOf(flip);
    flip.classList.remove('is-on');
    gsap.set(flip, { rotateY: 0 });
    book = BOOKS.find(b => b.key === key) || BOOKS[0];
    pos = 0;
    tabsBox.querySelectorAll('.cs-rd-tab').forEach(b => b.classList.toggle('is-active', b.dataset.book === book.key));
    render();
  };
  BOOKS.forEach(b => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-rd-tab';
    btn.dataset.book = b.key;
    btn.innerHTML = `${b.name}<small>${b.sub}</small>`;
    btn.addEventListener('click', () => showBook(b.key));
    tabsBox.appendChild(btn);
  });

  /* ── 开关 ── */
  const open = (key, options = {}) => {
    showBook(key);
    rd.classList.add('is-open');
    rd.setAttribute('aria-hidden', 'false');
    lenis.stop();
    if (!options.fromHistory && !readerHistoryActive) {
      const baseState = history.state && typeof history.state === 'object' ? history.state : {};
      history.pushState({ ...baseState, caseReader: key }, '', location.href);
      readerHistoryActive = true;
    } else if (options.fromHistory) {
      readerHistoryActive = true;
    }
    let seen = false;
    try { seen = localStorage.getItem(COACH_KEY) === '1'; } catch (e) {}
    if (coach && !seen) {
      coach.classList.add('is-on');
      coach.setAttribute('aria-hidden', 'false');
      // 兜底：就算一直不动，8 秒后也让它退开，别永远挡着封面
      setTimeout(() => hideCoach(false), 8000);
    }
  };
  const close = (options = {}) => {
    hideCoach(false);
    queuedTurns = 0;
    busy = false;
    gsap.killTweensOf(flip);
    flip.classList.remove('is-on');
    gsap.set(flip, { rotateY: 0 });
    rd.classList.remove('is-open');
    rd.setAttribute('aria-hidden', 'true');
    lenis.start();
    const shouldStepBack = !options.fromHistory && readerHistoryActive && history.state?.caseReader;
    readerHistoryActive = false;
    if (shouldStepBack) history.back();
  };
  rd.querySelector('.cs-rd-close').addEventListener('click', close);
  document.querySelectorAll('[data-open-book]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); open(el.dataset.openBook); });
  });
  document.addEventListener('keydown', e => {
    if (!rd.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft')  turn(-1);
  });
  /* 阅读器是页内层，手机从左边缘右滑时应先关掉它，
     不应直接回到个人网站首页。 */
  window.addEventListener('popstate', event => {
    const historyBook = event.state?.caseReader;
    if (historyBook) {
      if (!rd.classList.contains('is-open')) open(historyBook, { fromHistory: true });
      return;
    }
    if (rd.classList.contains('is-open')) close({ fromHistory: true });
  });
  window.addEventListener('resize', () => { if (rd.classList.contains('is-open')) render(); });

  /* ── 滚到封面区时，三枚「翻阅整本」胶囊依次闪一下 ──
     不依赖 hover，没把鼠标移上去的人也能注意到这里可以点。 */
  const badges = [...document.querySelectorAll('.cs-journal-badge')];
  const journals = document.querySelector('.cs-journals');
  if (journals && badges.length) {
    ScrollTrigger.create({
      trigger: journals,
      start: 'top 72%',
      once: true,
      onEnter: () => {
        if (prefersReducedMotion.matches) return;
        badges.forEach((b, i) => setTimeout(() => {
          b.classList.add('is-cue');
          setTimeout(() => b.classList.remove('is-cue'), 1600);
        }, 260 + i * 180));
      },
    });
  }
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
      // 用 center 而不是 top/bottom：翻面区间对视口中线左右对称，
      // 进度 0（正面）和进度 1（反面）都发生在单页基本完整可见的时候。
      // 原来写 top 68% → bottom 42%，进度 1 时单页顶部已经滚出屏幕 188px，
      // 于是「翻到反面」和「翻回正面」都看不到，只剩中间 90° 那一帧一直在眼前。
      // 区间长度 = 44% 视口高，短屏上会等比缩短，不会像百分比端点那样退化成 0。
      start: 'center 72%',
      end: 'center 28%',
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

  const grouped = '.cs-card, .cs-stat, .cs-hub-node, .cs-spec, .cs-phase, .cs-deliver, .cs-doc, .cs-flow-step, .cs-shift-goals li, .cs-facet, .cs-plate, .is-outcome .cs-lesson';
  document.querySelectorAll(grouped).forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 22, duration: .65, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
    });
  });
}

/* ─────────────────────────────────────────
   页内导航 — 按正文板块自动生成
   板块标题取自各段的 .cs-num（「01 — 项目背景」），
   过长的可在 section 上用 data-toc 覆盖。
───────────────────────────────────────── */
function initToc() {
  const body = document.querySelector('.cs-body');
  if (!body) return;

  const sections = [...body.querySelectorAll('.cs-section, .cs-deck')];
  if (sections.length < 3) return;

  const nav = document.createElement('nav');
  nav.className = 'cs-toc';
  nav.setAttribute('aria-label', '页面内导航');

  const ol = document.createElement('ol');
  const items = sections.map((sec, i) => {
    if (!sec.id) sec.id = `sec-${String(i + 1).padStart(2, '0')}`;

    const raw = sec.querySelector('.cs-num')?.textContent.trim() || '';
    const parts = raw.split('—').map(s => s.trim());
    const num = parts[0] || String(i + 1).padStart(2, '0');
    const label = sec.dataset.toc || parts[1] || '';

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${sec.id}`;
    a.title = label;
    a.innerHTML = `<i>${num}</i><span>${label}</span>`;
    li.appendChild(a);
    ol.appendChild(li);

    a.addEventListener('click', e => {
      e.preventDefault();
      const y = sec.getBoundingClientRect().top + scroller.scrollTop - 72;
      lenis.scrollTo(y);
      history.replaceState(null, '', `#${sec.id}`);
    });

    return { sec, li, a };
  });

  nav.appendChild(ol);
  document.querySelector('.site').appendChild(nav);

  // 标题常显 or 仅序号：按「目录右边缘」与「正文左边缘」的实际空隙判定。
  // 正文容器宽度以后再调，这里会自动跟着变，不需要维护断点。
  const fitToc = () => {
    if (window.innerWidth < 1024) return;
    nav.classList.add('is-wide');                       // 先按完整宽度量一次
    const sec = sections[0];
    const contentLeft = sec.getBoundingClientRect().left
                      + parseFloat(getComputedStyle(sec).paddingLeft);
    if (nav.getBoundingClientRect().right + 16 > contentLeft) {
      nav.classList.remove('is-wide');
    }
  };
  fitToc();
  window.addEventListener('resize', fitToc);
  window.addEventListener('load', fitToc);
  document.fonts?.ready.then(fitToc);

  const setActive = idx => items.forEach(({ li, a }, i) => {
    const on = i === idx;
    li.classList.toggle('is-active', on);
    on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
  });
  setActive(0);

  // 只在「目录整体压在浅色正文上」时显示。
  // 目录是浅底深字，落到深色的首屏或收尾段上会看不清，
  // 所以显隐边界按目录自身高度算，而不是用固定百分比。
  const RAIL_TOP = 132;
  const pad = 24;
  ScrollTrigger.create({
    trigger: body,
    start: () => `top ${RAIL_TOP - pad}px`,
    end:   () => `bottom ${RAIL_TOP + nav.offsetHeight + pad}px`,
    invalidateOnRefresh: true,
    onToggle: self => nav.classList.toggle('is-visible', self.isActive),
  });

  // 当前板块高亮：相邻区间首尾相接，不会出现无高亮的空档
  items.forEach(({ sec }, i) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: self => { if (self.isActive) setActive(i); },
    });
  });
}

/* ─────────────────────────────────────────
   导航配色：深色 hero → 浅色正文 → 深色收尾
───────────────────────────────────────── */
function initNavTheme() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const reveal = document.querySelector('[data-scrub-video]');
  const body = document.querySelector('.cs-body');
  const closing = document.querySelector('.cs-closing');

  if (reveal) ScrollTrigger.create({
    trigger: reveal, start: 'top 60px', end: 'bottom 60px',
    onEnter:     () => nav.dataset.theme = 'light',
    onEnterBack: () => nav.dataset.theme = 'light',
    onLeaveBack: () => nav.dataset.theme = 'dark',
  });
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
   复制提示
───────────────────────────────────────── */
let toastEl, toastTimer;
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'cs-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 非安全上下文或权限被拒时的兜底
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/* ─────────────────────────────────────────
   页尾：项目总结 / 联系方式 / 问问 AI
───────────────────────────────────────── */
const CONTACT = {
  email: {
    value: 'bh141425@gmail.com',
    href:  'mailto:bh141425@gmail.com?subject=' + encodeURIComponent('聊聊设计合作'),
    cta:   '写邮件',
  },
  phone: {
    value: '131 0633 3009',
    href:  'tel:+8613106333009',
    cta:   '拨打',
  },
};

// 提示词里带上本页链接，AI 才能真的去读作品
const ASK_PROMPT = `我正在评估 Maridian（${location.origin}）是否适合我们的品牌设计 / 视觉设计岗位。`
  + `请查看他的作品集网站，告诉我：他的设计能力覆盖哪些方面、最适合什么阶段和什么类型的公司、`
  + `如果录用他我实际能得到什么。请具体一些，引用他的案例和经历。`;

// 只放能把提问带过去的入口。豆包 / 混元 / Kimi 不识别查询参数，
// 点进去是空白对话框，体验反而更差，所以不放。
// Gemini 走 Google AI 模式（udm=50，本身就是 Gemini 驱动）；
// Grok 走 x.com 的 grok 入口，参数名是 text 不是 q。
const AI_TARGETS = [
  { name: 'ChatGPT',  icon: 'openai',   url: 'https://chatgpt.com/?q=' },
  { name: 'DeepSeek', icon: 'deepseek', url: 'https://chat.deepseek.com/?q=' },
  { name: 'Gemini',   icon: 'gemini',   url: 'https://www.google.com/search?udm=50&q=' },
  { name: 'Grok',     icon: 'grok',     url: 'https://x.com/i/grok?text=' },
];

function initOutro() {
  const outro = document.querySelector('.cs-outro');
  if (!outro) return;

  /* ── 联系方式：邮箱 / 电话 切换 ── */
  const valueEl = outro.querySelector('[data-contact-value]');
  const ctaEl   = outro.querySelector('[data-contact-cta]');
  const copyEl  = outro.querySelector('[data-contact-copy]');
  let mode = 'email';

  const renderContact = () => {
    const c = CONTACT[mode];
    valueEl.textContent = c.value;
    ctaEl.href = c.href;
    ctaEl.querySelector('span:first-child').textContent = c.cta;
    outro.querySelectorAll('[data-contact]').forEach(b =>
      b.classList.toggle('is-active', b.dataset.contact === mode));
  };

  outro.querySelectorAll('[data-contact]').forEach(b => {
    b.addEventListener('click', () => { mode = b.dataset.contact; renderContact(); });
  });
  renderContact();

  copyEl?.addEventListener('click', async () => {
    const ok = await copyText(CONTACT[mode].value);
    toast(ok ? `已复制${mode === 'email' ? '邮箱' : '电话'}：${CONTACT[mode].value}` : '复制失败，请手动选择');
  });

  /* ── 问问 AI ── */
  const row = outro.querySelector('[data-ai-row]');
  if (row) {
    AI_TARGETS.forEach(t => {
      const a = document.createElement('a');
      a.className = 'cs-ai-btn';
      a.href = t.url + encodeURIComponent(ASK_PROMPT);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = `用 ${t.name} 了解 Maridian`;
      a.setAttribute('aria-label', `用 ${t.name} 了解 Maridian`);
      a.innerHTML = `<i aria-hidden="true" style="--ai-icon:url(../assets/ai/${t.icon}.svg)"></i>`;
      a.addEventListener('click', async () => {
        const ok = await copyText(ASK_PROMPT);
        if (ok) toast('提示词已带上，也已复制到剪贴板');
      });
      row.appendChild(a);
    });
  }

  /* ── 项目总结：贴着按钮的 popover，不锁滚动、不做全屏遮罩 ── */
  const panel = outro.querySelector('[data-summary-panel]');
  const trigger = outro.querySelector('[data-summary-open]');
  if (!panel || !trigger) return;

  let panelOpen = false;
  const setPanel = on => {
    panelOpen = on;
    trigger.setAttribute('aria-expanded', String(on));
    if (on) {
      panel.hidden = false;
      // 面板向上展开，高度上限 = 按钮上沿到固定导航下沿之间的空间
      const navBottom = document.getElementById('nav')?.getBoundingClientRect().bottom || 0;
      const room = trigger.getBoundingClientRect().top - navBottom - 28;
      panel.style.setProperty('--cs-summary-max', `${Math.max(220, Math.round(room))}px`);
      requestAnimationFrame(() => panel.classList.add('is-open'));
    } else {
      panel.classList.remove('is-open');
      // 等淡出结束再移出无障碍树
      setTimeout(() => { if (!panelOpen) panel.hidden = true; }, 350);
    }
  };

  trigger.addEventListener('click', () => setPanel(!panelOpen));
  panel.querySelector('.cs-summary-close')?.addEventListener('click', () => { setPanel(false); trigger.focus(); });

  document.addEventListener('click', e => {
    if (!panelOpen) return;
    if (!panel.contains(e.target) && !trigger.contains(e.target)) setPanel(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panelOpen) { setPanel(false); trigger.focus(); }
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
initSeal();
initScrubVideo();
initDeck();
initMobileAutoRails();
initLine();
initTocMap();
initReader();
initPageDemo();
initFlip();
initLayoutCompare();
initHub();
initCounters();
initGantt();
initTimeline();
initReveal();
initToc();
initNavTheme();
initLightbox();
initOutro();
initCanvasBorders();
initClock();

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  requestAnimationFrame(restoreCaseScroll);
});
window.addEventListener('resize', () => ScrollTrigger.refresh());

/* lazy 图是滚动到一半才到货的，只要它改变了文档高度，
   ScrollTrigger 之前量下来的 start/end 就全部偏掉——翻面块会卡在侧面转不回来。
   所有 <img> 都写了 width/height 预留了位置，这里再兜一层：
   任何图片加载完成后合并成一次 refresh（load 事件不冒泡，用捕获）。 */
let refreshTimer;
document.addEventListener('load', e => {
  if (e.target.tagName !== 'IMG') return;
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
}, true);

document.fonts?.ready.then(() => ScrollTrigger.refresh());
