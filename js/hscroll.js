/* ============================================================
   HSCROLL — 窄屏把同级重复结构改成横向
   全站共用（首页 / 关于 / 作品详情页都加载这一个文件）。

   用法：
     <div data-hscroll>            默认「滑动」模式：原生 overflow-x + scroll-snap
       <div class="…" data-hscroll-track> … 项 … </div>
     </div>

     <div data-hscroll="pin">      「钉住」模式：把纵向滚动借给横向，走完才还回去
     <div data-hscroll="flow">     「流动」模式：区块自然上滑，同时让卡片横向推进
     需要 GSAP + ScrollTrigger；缺任一则自动退回滑动模式。

   桌面端（>768px）完全不介入，样式与结构维持原样。
   ============================================================ */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init() {
    const wraps = [...document.querySelectorAll('[data-hscroll]')];
    if (!wraps.length) return;

    const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    if (!hasGsap) { simpleOnly(wraps); return; }

    gsap.matchMedia().add('(max-width: 768px)', () => {
      // Array.map 会额外传入 index；直接传 build 会让第二项起的 index
      // 被误当成 forceSwipe，从而意外退回手动滑动模式。
      const made = wraps.map(wrap => build(wrap)).filter(Boolean);
      return () => made.forEach(m => m.cleanup());
    });
  }

  /* 没有 GSAP 时（理论上不会发生）只跑滑动模式，用 matchMedia 自己管开关 */
  function simpleOnly(wraps) {
    const mq = window.matchMedia('(max-width: 768px)');
    let made = [];
    const sync = () => {
      made.forEach(m => m.cleanup());
      made = mq.matches ? wraps.map(w => build(w, true)).filter(Boolean) : [];
    };
    mq.addEventListener('change', sync);
    sync();
  }

  /* 进度点要按「实际排在轨道上的项」算，不是 DOM 子元素数：
     思维导图那类用 display:contents 把中间容器摊掉了，真正的项在更深一层。 */
  function flexItems(el) {
    return [...el.children].flatMap(c => {
      const d = getComputedStyle(c).display;
      if (d === 'none') return [];
      return d === 'contents' ? flexItems(c) : [c];
    });
  }

  function build(wrap, forceSwipe) {
    const track = wrap.querySelector('[data-hscroll-track]');
    if (!track) return null;

    let dots = wrap.parentElement.querySelector(':scope > .hscroll-dots');
    if (!dots) {
      dots = document.createElement('div');
      dots.className = 'hscroll-dots';
      flexItems(track).forEach(() => dots.appendChild(document.createElement('i')));
      track.parentNode.insertBefore(dots, track.nextSibling);
    }
    const pips = [...dots.children];
    const n = pips.length;

    const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth + 16);
    if (distance() <= 0) { dots.remove(); return null; }

    const mode = wrap.dataset.hscroll;
    const isFlow = mode === 'flow' && !forceSwipe && !reduceMotion.matches;
    const isPin = mode === 'pin' && !forceSwipe && !reduceMotion.matches;

    /* ── 流动模式：纵向页面照常滚动，卡片随区块经过视口时横向推进。
       不 pin，也不生成额外占位，适合手机作品详情页的短卡片组。 ── */
    if (isFlow) {
      const tween = gsap.to(track, { x: () => -distance(), ease: 'none' });
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'top 92%',
        end: 'bottom 8%',
        scrub: 0.45,
        invalidateOnRefresh: true,
        animation: tween,
        onUpdate: self => {
          const i = Math.min(n - 1, Math.round(self.progress * (n - 1)));
          pips.forEach((p, k) => p.classList.toggle('is-on', k === i));
        },
      });
      pips[0]?.classList.add('is-on');

      return {
        cleanup: () => {
          st.kill();
          tween.kill();
          gsap.set(track, { clearProps: 'x' });
          dots.remove();
        },
      };
    }

    /* ── 滑动模式：交给浏览器原生滚动，JS 只更新圆点 ── */
    if (!isPin) {
      const onScroll = () => {
        const max = wrap.scrollWidth - wrap.clientWidth;
        const i = max <= 0 ? 0 : Math.min(n - 1, Math.round(wrap.scrollLeft / max * (n - 1)));
        pips.forEach((p, k) => p.classList.toggle('is-on', k === i));
      };
      wrap.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return { cleanup: () => { wrap.removeEventListener('scroll', onScroll); dots.remove(); } };
    }

    /* ── 钉住模式：区块固定在视口，纵向滚动被换算成横向位移 ── */
    // 每张卡分到约 0.62 屏的竖滑，读得完再走下一张；末尾再留一段
    // 停住，最后一张完整停在导航下方后才把滚动交还给页面。
    const hold = () => Math.min(240, Math.max(160, window.innerHeight * 0.24));
    const navBottom = () => Math.ceil(document.querySelector('#nav')?.getBoundingClientRect().bottom || 64) + 10;
    const slide = () => Math.max(distance(), Math.round(n * window.innerHeight * 0.62));
    const apply = progress => {
      const travel = distance();
      const horizontalProgress = travel <= 0
        ? 1
        : Math.min(1, progress * (slide() + hold()) / slide());
      gsap.set(track, { x: -travel * horizontalProgress });
      const i = Math.min(n - 1, Math.round(horizontalProgress * (n - 1)));
      pips.forEach((p, k) => p.classList.toggle('is-on', k === i));
    };
    const st = ScrollTrigger.create({
      trigger: wrap,
      refreshPriority: 100 - (Number(wrap.dataset.pinOrder) || 50),
      start: () => `top ${navBottom()}px`,
      end: () => '+=' + (slide() + hold()),
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: self => apply(self.progress),
      onRefresh: self => apply(self.progress),
    });
    apply(0);

    // 钉住后 ScrollTrigger 会把元素包进 .pin-spacer。钉的位置在导航下方，
    // 元素上方留出一条空隙——深色区块会从这条空隙里透出页面的浅色底。
    // 把区块自己的底色刷到占位层上，接缝就看不出来了。
    const spacer = wrap.parentElement;
    const isClear = value => !value || /rgba?\(0,\s*0,\s*0,\s*0\)|transparent/.test(value);
    let bg = getComputedStyle(wrap).backgroundColor;
    if (isClear(bg)) {
      const host = wrap.closest('section, .cs-section, .cs-deck, .cs-body');
      if (host) bg = getComputedStyle(host).backgroundColor;
    }
    const painted = spacer?.classList.contains('pin-spacer') && !isClear(bg);
    if (painted) spacer.style.background = bg;

    return {
      cleanup: () => {
        if (painted) spacer.style.background = '';
        st.kill();
        gsap.set(track, { clearProps: 'x' });
        dots.remove();
      },
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
