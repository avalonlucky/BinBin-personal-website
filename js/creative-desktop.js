(() => {
  const lock = document.querySelector('[data-lock-screen]');
  const desktop = document.querySelector('[data-desktop]');
  const unlock = document.querySelector('[data-unlock]');
  const stage = document.querySelector('[data-stage]');
  const clock = document.querySelector('[data-lock-time]');
  const date = document.querySelector('[data-lock-date]');
  const windows = [...document.querySelectorAll('[data-window]')];
  let topZ = 20;

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
    let lastTap = 0;
    const trigger = event => {
      const now = Date.now();
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      if (!isCoarse && event.type === 'click' && now - lastTap < 260) return;
      if (event.type === 'dblclick' || isCoarse || button.closest('.desktop-dock')) openWindow(button.dataset.open);
      lastTap = now;
    };
    button.addEventListener('click', trigger);
    button.addEventListener('dblclick', event => {
      event.preventDefault();
      openWindow(button.dataset.open);
    });
  });

  windows.forEach(win => {
    win.addEventListener('pointerdown', () => bringToFront(win));
    win.querySelector('[data-close]')?.addEventListener('click', () => closeWindow(win));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const preview = document.querySelector('[data-preview-modal]');
    if (!preview.hidden) { preview.hidden = true; return; }
    const open = windows.filter(win => !win.hidden).sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))[0];
    closeWindow(open);
  });

  const themeToggle = document.querySelector('[data-theme-toggle]');
  const themes = ['', 'paper', 'violet'];
  themeToggle.addEventListener('click', () => {
    const index = themes.indexOf(desktop.dataset.theme || '');
    const next = themes[(index + 1) % themes.length];
    if (next) desktop.dataset.theme = next; else delete desktop.dataset.theme;
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
  document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
    previewImage.src = button.dataset.preview;
    previewImage.alt = button.querySelector('img')?.alt || '过程档案图片';
    preview.hidden = false;
    preview.querySelector('[data-preview-close]').focus();
  }));
  document.querySelector('[data-preview-close]').addEventListener('click', () => preview.hidden = true);
  preview.addEventListener('click', event => { if (event.target === preview) preview.hidden = true; });

  const chessBoard = document.querySelector('.chess-board');
  if (chessBoard) {
    const pieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜', '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
    while (pieces.length < 64) pieces.push('');
    pieces.forEach(piece => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.textContent = piece;
      cell.setAttribute('aria-label', piece ? `棋子 ${piece}` : '空格');
      cell.addEventListener('click', () => cell.classList.toggle('is-selected'));
      chessBoard.append(cell);
    });
  }

  document.querySelectorAll('.synth-board button').forEach(key => {
    key.addEventListener('click', () => key.classList.toggle('is-active'));
  });

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
