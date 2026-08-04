(() => {
  const clock = document.getElementById('clock');
  const cards = Array.from(document.querySelectorAll('[data-orbit-card]'));
  const orbit = document.querySelector('[data-reading-orbit]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopMotion = window.matchMedia('(min-width: 769px)');
  let rafId = 0;
  let startTime = performance.now();

  function updateClock() {
    if (!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function clearOrbitStyles() {
    cards.forEach((card) => {
      card.style.transform = '';
      card.style.opacity = '';
      card.style.zIndex = '';
    });
  }

  function canAnimateOrbit() {
    return orbit && cards.length && !reducedMotion.matches && desktopMotion.matches;
  }

  function renderOrbit(now) {
    if (!canAnimateOrbit()) {
      rafId = 0;
      clearOrbitStyles();
      return;
    }

    const rect = orbit.getBoundingClientRect();
    const radius = Math.min(rect.width * 0.42, rect.height * 0.64);
    const centerYOffset = radius + rect.height * 0.1 - rect.height / 2;
    const elapsed = (now - startTime) / 1000;
    const spin = elapsed * 0.115;

    cards.forEach((card, index) => {
      const baseAngle = (index / cards.length) * Math.PI * 2 - Math.PI / 2;
      const angle = baseAngle + spin;
      const x = Math.cos(angle) * radius;
      const y = centerYOffset + Math.sin(angle) * radius;
      const depth = (Math.sin(angle) + 1) / 2;
      const scale = 0.97 + depth * 0.04;
      const opacity = 0.9 + depth * 0.1;
      const rotate = angle * 180 / Math.PI + 90;

      card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(10 + Math.round(depth * 80));
    });

    rafId = requestAnimationFrame(renderOrbit);
  }

  function startOrbit() {
    cancelAnimationFrame(rafId);
    rafId = 0;
    if (!canAnimateOrbit()) {
      clearOrbitStyles();
      return;
    }
    startTime = performance.now();
    rafId = requestAnimationFrame(renderOrbit);
  }

  updateClock();
  setInterval(updateClock, 1000);
  startOrbit();

  window.addEventListener('resize', startOrbit);
  reducedMotion.addEventListener?.('change', startOrbit);
  desktopMotion.addEventListener?.('change', startOrbit);
})();
