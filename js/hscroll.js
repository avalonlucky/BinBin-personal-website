/* ============================================================
   HSCROLL — 窄屏把同级重复结构改成横向
   全站共用（首页 / 关于 / 作品详情页都加载这一个文件）。

   用法：
     <div data-hscroll>            默认「滑动」模式：原生 overflow-x + scroll-snap
       <div class="…" data-hscroll-track> … 项 … </div>
     </div>

     <div data-hscroll="pin">      「钉住」模式：把纵向滚动借给横向，走完才还回去
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
      const made = wraps.map(build).filter(Boolean);
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

    const isPin = wrap.dataset.hscroll === 'pin' && !forceSwipe && !reduceMotion.matches;

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
    const tween = gsap.to(track, { x: () => -distance(), ease: 'none' });
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: () => `top ${(document.querySelector('#nav')?.offsetHeight || 64) + 12}px`,
      end: () => '+=' + distance(),
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.6,
      invalidateOnRefresh: true,
      animation: tween,
      onUpdate: self => {
        const i = Math.min(n - 1, Math.round(self.progress * (n - 1)));
        pips.forEach((p, k) => p.classList.toggle('is-on', k === i));
      },
    });
    pips[0]?.classList.add('is-on');

    // 钉住后 ScrollTrigger 会把元素包进 .pin-spacer。钉的位置在导航下方，
    // 元素上方留出一条空隙——深色区块会从这条空隙里透出页面的浅色底。
    // 把区块自己的底色刷到占位层上，接缝就看不出来了。
    const spacer = wrap.parentElement;
    const bg = getComputedStyle(wrap).backgroundColor;
    const painted = spacer?.classList.contains('pin-spacer') && bg && !/rgba?\(0, 0, 0, 0\)|transparent/.test(bg);
    if (painted) spacer.style.background = bg;

    return {
      cleanup: () => {
        if (painted) spacer.style.background = '';
        st.kill();
        tween.kill();
        gsap.set(track, { clearProps: 'x' });
        dots.remove();
      },
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
