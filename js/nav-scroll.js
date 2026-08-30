(function () {
  const nav = document.getElementById('nav');
  const scroller = document.querySelector('main.page');
  if (!nav || !scroller) return;

  let previous = scroller.scrollTop;
  let ticking = false;

  const update = () => {
    const current = scroller.scrollTop;
    const delta = current - previous;

    if (current <= 24 || delta < -6) {
      nav.classList.remove('is-scroll-hidden');
    } else if (delta > 6 && !nav.matches(':focus-within')) {
      nav.classList.add('is-scroll-hidden');
    }

    previous = current;
    ticking = false;
  };

  scroller.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  nav.addEventListener('pointerenter', () => nav.classList.remove('is-scroll-hidden'));
})();
