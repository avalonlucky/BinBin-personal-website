(function () {
  const canvas = document.querySelector('[data-hero-title-fluid]');
  const title = canvas?.closest('h1');
  const lines = title ? [...title.querySelectorAll('span')] : [];
  if (!canvas || !title || !lines.length) return;

  const context = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const maskContext = mask.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let active = true;
  let frame = 0;

  function resize() {
    const rect = title.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    mask.width = canvas.width;
    mask.height = canvas.height;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    maskContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    const style = getComputedStyle(title);
    maskContext.clearRect(0, 0, width, height);
    maskContext.fillStyle = '#fff';
    maskContext.textAlign = 'center';
    maskContext.textBaseline = 'middle';
    maskContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if ('letterSpacing' in maskContext) maskContext.letterSpacing = style.letterSpacing;
    lines.forEach(line => {
      const lineRect = line.getBoundingClientRect();
      maskContext.fillText(line.textContent, width / 2, lineRect.top - rect.top + lineRect.height / 2);
    });
    draw(0);
    title.classList.add('is-fluid-ready');
  }

  function draw(time) {
    const seconds = reduceMotion ? 2.4 : time / 1000;
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#050607';
    context.fillRect(0, 0, width, height);

    const sweep = (Math.sin(seconds * .42) * .5 + .5) * width;
    const blue = context.createRadialGradient(sweep, height * .45, 0, sweep, height * .45, width * .42);
    blue.addColorStop(0, '#7da2ff');
    blue.addColorStop(.22, '#3268ff');
    blue.addColorStop(.48, '#063ce1');
    blue.addColorStop(.72, 'rgba(8,18,72,.85)');
    blue.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = blue;
    context.fillRect(0, 0, width, height);

    const ribbonX = width * (.52 + Math.sin(seconds * .31) * .28);
    const ribbon = context.createLinearGradient(ribbonX - width * .18, 0, ribbonX + width * .18, height);
    ribbon.addColorStop(0, 'rgba(0,0,0,0)');
    ribbon.addColorStop(.35, 'rgba(20,58,220,.2)');
    ribbon.addColorStop(.5, 'rgba(133,163,255,.95)');
    ribbon.addColorStop(.62, 'rgba(12,43,180,.35)');
    ribbon.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = ribbon;
    context.save();
    context.translate(ribbonX, height / 2);
    context.rotate(-.2 + Math.sin(seconds * .23) * .12);
    context.translate(-ribbonX, -height / 2);
    context.fillRect(ribbonX - width * .24, -height, width * .48, height * 3);
    context.restore();

    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0, width, height);
    context.globalCompositeOperation = 'source-over';
  }

  function tick(time) {
    if (active) draw(time);
    if (!reduceMotion) frame = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { threshold: .05 });
  observer.observe(title);
  document.fonts.ready.then(() => {
    resize();
    if (!reduceMotion) frame = requestAnimationFrame(tick);
  });
  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
})();
