(() => {
  const lock = document.querySelector('[data-lock-screen]');
  const desktop = document.querySelector('[data-desktop]');
  const unlock = document.querySelector('[data-unlock]');
  const stage = document.querySelector('[data-stage]');
  const clock = document.querySelector('[data-lock-time]');
  const date = document.querySelector('[data-lock-date]');
  const windows = [...document.querySelectorAll('[data-window]')];
  let topZ = 20;
  const isCoarse = () => window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 760px)').matches;

  function tick() {
    const now = new Date();
    clock.textContent = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
    date.textContent = new Intl.DateTimeFormat('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }).format(now);
  }
  tick();
  setInterval(tick, 30_000);

  function bringToFront(win) {
    win.style.zIndex = String(++topZ);
    windows.forEach(item => item.classList.toggle('is-front', item === win));
  }

  function openWindow(name) {
    document.querySelectorAll('.desktop-icon.is-selected').forEach(item => item.classList.remove('is-selected'));
    document.querySelector(`.desktop-icon[data-open="${name}"]`)?.classList.add('is-selected');
    if (typeof window.__openApp === 'function') {
      window.__openApp(name);
      return;
    }
    const win = document.querySelector(`[data-window="${name}"]`);
    if (!win) return;
    win.hidden = false;
    bringToFront(win);
    const close = win.querySelector('[data-close]');
    close?.focus({ preventScroll: true });
  }

  function closeWindow(win) {
    if (win) win.hidden = true;
  }

  function enterDesktop() {
    desktop.hidden = false;
    requestAnimationFrame(() => lock.classList.add('is-gone'));
  }

  unlock.addEventListener('click', enterDesktop);
  lock.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') enterDesktop();
  });

  document.querySelectorAll('[data-open]').forEach(button => {
    const launch = event => {
      event.preventDefault();
      if (button.classList.contains('desktop-icon')) {
        document.querySelectorAll('.desktop-icon.is-selected').forEach(item => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
      }
      openWindow(button.dataset.open);
    };
    if (button.classList.contains('desktop-icon')) {
      button.addEventListener('click', event => {
        event.preventDefault();
        document.querySelectorAll('.desktop-icon.is-selected').forEach(item => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
        if (isCoarse()) launch(event);
      });
      button.addEventListener('dblclick', launch);
    } else {
      button.addEventListener('click', launch);
    }
  });

  windows.forEach(win => {
    win.addEventListener('pointerdown', () => bringToFront(win));
    win.querySelector('[data-close]')?.addEventListener('click', () => closeWindow(win));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const lightbox = document.querySelector('.ios-lightbox.open');
    if (lightbox) { lightbox.remove(); return; }
    const writeup = document.querySelector('.case-writeup.open');
    if (writeup) { writeup.classList.remove('open'); return; }
    const modal = [...document.querySelectorAll('.app-modal.open')].pop();
    if (modal) { modal.classList.remove('open'); modal.style.display = 'none'; return; }
    const preview = document.querySelector('[data-preview-modal]');
    if (preview && !preview.hidden) { preview.hidden = true; return; }
    const open = windows.filter(win => !win.hidden).sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))[0];
    closeWindow(open);
  });

  const themes = ['', 'paper', 'violet'];
  const cycleTheme = () => {
    const index = themes.indexOf(desktop.dataset.theme || '');
    const next = themes[(index + 1) % themes.length];
    if (next) desktop.dataset.theme = next; else delete desktop.dataset.theme;
  };
  document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
    toggle.addEventListener('click', cycleTheme);
  });

  let parallaxFrame = 0;
  stage.addEventListener('pointermove', event => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const shift = Math.round((event.clientX / window.innerWidth - .5) * 20);
    cancelAnimationFrame(parallaxFrame);
    parallaxFrame = requestAnimationFrame(() => stage.style.setProperty('--wall-shift', `${shift}px`));
  });

  const preview = document.querySelector('[data-preview-modal]');
  const previewImage = document.querySelector('[data-preview-image]');
  if (preview && previewImage) {
    document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
      previewImage.src = button.dataset.preview;
      previewImage.alt = button.querySelector('img')?.alt || '过程档案图片';
      preview.hidden = false;
      preview.querySelector('[data-preview-close]').focus();
    }));
    preview.querySelector('[data-preview-close]')?.addEventListener('click', () => preview.hidden = true);
    preview.addEventListener('click', event => { if (event.target === preview) preview.hidden = true; });
  }

  if (!window.matchMedia('(pointer: coarse)').matches) {
    windows.forEach(win => {
      const handle = win.querySelector('[data-window-handle]');
      let drag = null;
      handle.addEventListener('pointerdown', event => {
        if (event.target.closest('button')) return;
        bringToFront(win);
        const rect = win.getBoundingClientRect();
        drag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
        handle.setPointerCapture(event.pointerId);
      });
      handle.addEventListener('pointermove', event => {
        if (!drag) return;
        const maxX = Math.max(12, window.innerWidth - win.offsetWidth - 12);
        const maxY = Math.max(52, window.innerHeight - win.offsetHeight - 12);
        win.style.left = `${Math.min(maxX, Math.max(12, drag.left + event.clientX - drag.x))}px`;
        win.style.top = `${Math.min(maxY, Math.max(52, drag.top + event.clientY - drag.y))}px`;
        win.style.right = 'auto';
      });
      const stop = () => { drag = null; };
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  }
})();
