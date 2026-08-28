(() => {
  const STORAGE = 'ms-os-v1';
  const WALLS = [
    { id: 'ribbons', src: 'assets/desktop/wallpapers/ribbons.webp', name: 'Ribbons' },
    { id: 'lake', src: 'assets/desktop/wallpapers/lake.webp', name: 'Lake' },
    { id: 'dunes', src: 'assets/desktop/wallpapers/dunes.webp', name: 'Dunes' },
    { id: 'forest', src: 'assets/desktop/wallpapers/forest.webp', name: 'Forest' },
    { id: 'city', src: 'assets/desktop/wallpapers/city.webp', name: 'City' },
    { id: 'bloom', src: 'assets/desktop/wallpapers/bloom.webp', name: 'Bloom' },
    { id: 'field', src: 'assets/desktop/wallpapers/field.webp', name: 'Field' }
  ];
  const ACCENTS = [
    { id: 'aqua', color: '#0a84ff' },
    { id: 'violet', color: '#bf5af2' },
    { id: 'orange', color: '#ff9f0a' },
    { id: 'green', color: '#30d158' },
    { id: 'graphite', color: '#8e8e93' }
  ];
  const INTERVALS = { off: 0, '15s': 15000, '30s': 30000, '1m': 60000 };

  const defaults = { mode: 'dark', accent: 'aqua', wall: 'ribbons', carousel: '30s' };
  const load = () => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE) || '{}') }; }
    catch { return { ...defaults }; }
  };
  const save = state => localStorage.setItem(STORAGE, JSON.stringify(state));
  let state = load();

  const lock = document.querySelector('[data-lock-screen]');
  const desktop = document.querySelector('[data-desktop]');
  const wallA = document.querySelector('[data-wall-a]');
  const wallB = document.querySelector('[data-wall-b]');
  let frontIsA = true;
  let carouselTimer = 0;
  let wallIndex = Math.max(0, WALLS.findIndex(w => w.id === state.wall));

  function applyTheme() {
    let mode = state.mode;
    if (mode === 'auto') mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.accent = state.accent;
  }

  function setWall(id, { fade = true } = {}) {
    const wall = WALLS.find(w => w.id === id) || WALLS[0];
    state.wall = wall.id;
    wallIndex = WALLS.findIndex(w => w.id === wall.id);
    const incoming = frontIsA ? wallB : wallA;
    const outgoing = frontIsA ? wallA : wallB;
    incoming.style.backgroundImage = `url("${wall.src}")`;
    if (!fade) {
      incoming.classList.add('is-front');
      outgoing.classList.remove('is-front');
      frontIsA = !frontIsA;
      return;
    }
    incoming.classList.add('is-front');
    outgoing.classList.remove('is-front');
    frontIsA = !frontIsA;
    document.querySelectorAll('.os-walls button').forEach(b => b.classList.toggle('is-on', b.dataset.wall === wall.id));
  }

  function startCarousel() {
    clearInterval(carouselTimer);
    const ms = INTERVALS[state.carousel] || 0;
    if (!ms) return;
    carouselTimer = setInterval(() => {
      wallIndex = (wallIndex + 1) % WALLS.length;
      setWall(WALLS[wallIndex].id);
      save(state);
    }, ms);
  }

  function tickClocks() {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
    const dateLong = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(now);
    const dateShort = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
    document.querySelectorAll('[data-lock-time],[data-os-time]').forEach(el => { el.textContent = time; });
    document.querySelectorAll('[data-lock-date]').forEach(el => { el.textContent = dateLong; });
    document.querySelectorAll('[data-os-date]').forEach(el => { el.textContent = dateShort; });
    const clockBig = document.querySelector('[data-widget-clock]');
    if (clockBig) clockBig.textContent = time;
    const clockDay = document.querySelector('[data-widget-day]');
    if (clockDay) clockDay.textContent = dateShort;
  }

  function enterDesktop() {
    desktop.hidden = false;
    requestAnimationFrame(() => lock.classList.add('is-gone'));
  }
  function lockScreen() {
    lock.classList.remove('is-gone');
    closeMenus();
    document.querySelector('[data-settings]')?.classList.remove('open');
  }

  const isCoarse = () => window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 760px)').matches;
  function openApp(name) {
    document.querySelectorAll('.os-icon.is-selected').forEach(el => el.classList.remove('is-selected'));
    document.querySelector(`.os-icon[data-open="${name}"]`)?.classList.add('is-selected');
    document.querySelectorAll('.os-dock button').forEach(b => b.classList.toggle('is-open', b.dataset.open === name));
    if (name === 'settings') {
      document.querySelector('[data-settings]')?.classList.add('open');
      return;
    }
    window.__openApp?.(name);
  }

  document.querySelectorAll('[data-open]').forEach(btn => {
    const launch = e => { e.preventDefault(); openApp(btn.dataset.open); };
    if (btn.classList.contains('os-icon')) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.os-icon.is-selected').forEach(el => el.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        if (isCoarse()) launch(e);
      });
      btn.addEventListener('dblclick', launch);
    } else {
      btn.addEventListener('click', launch);
    }
  });

  document.querySelector('[data-unlock]')?.addEventListener('click', enterDesktop);
  lock?.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    enterDesktop();
  });

  const appleBtn = document.querySelector('[data-apple]');
  const appleMenu = document.querySelector('[data-apple-menu]');
  function closeMenus() { appleMenu?.classList.remove('open'); appleBtn?.setAttribute('aria-expanded', 'false'); }
  appleBtn?.addEventListener('click', e => {
    e.stopPropagation();
    const open = appleMenu.classList.toggle('open');
    appleBtn.setAttribute('aria-expanded', String(open));
  });
  appleMenu?.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', closeMenus);
  document.querySelector('[data-lock]')?.addEventListener('click', lockScreen);
  document.querySelector('[data-open-settings]')?.addEventListener('click', () => openApp('settings'));
  document.querySelector('[data-settings-close]')?.addEventListener('click', () => document.querySelector('[data-settings]').classList.remove('open'));
  document.querySelector('[data-settings]')?.addEventListener('click', e => {
    if (e.target.matches('[data-settings]')) e.currentTarget.classList.remove('open');
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const settings = document.querySelector('[data-settings].open');
    if (settings) { settings.classList.remove('open'); return; }
    if (appleMenu?.classList.contains('open')) { closeMenus(); return; }
  });

  /* Settings UI */
  const wallsBox = document.querySelector('[data-wall-grid]');
  if (wallsBox) {
    wallsBox.innerHTML = WALLS.map(w => `<button type="button" data-wall="${w.id}" title="${w.name}"><img src="${w.src}" alt="${w.name}"></button>`).join('');
    wallsBox.addEventListener('click', e => {
      const b = e.target.closest('[data-wall]');
      if (!b) return;
      setWall(b.dataset.wall);
      save(state);
    });
  }
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => { state.mode = btn.dataset.mode; applyTheme(); save(state); syncChoices(); });
  });
  document.querySelectorAll('[data-accent]').forEach(btn => {
    btn.addEventListener('click', () => { state.accent = btn.dataset.accent; applyTheme(); save(state); syncChoices(); });
  });
  document.querySelector('[data-carousel]')?.addEventListener('change', e => {
    state.carousel = e.target.value;
    save(state);
    startCarousel();
  });
  function syncChoices() {
    document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('is-on', b.dataset.mode === state.mode));
    document.querySelectorAll('[data-accent]').forEach(b => b.classList.toggle('is-on', b.dataset.accent === state.accent));
    document.querySelectorAll('.os-walls button').forEach(b => b.classList.toggle('is-on', b.dataset.wall === state.wall));
    const sel = document.querySelector('[data-carousel]');
    if (sel) sel.value = state.carousel;
  }

  /* Dock magnification */
  const dock = document.querySelector('[data-dock]');
  if (dock && !window.matchMedia('(pointer: coarse)').matches) {
    const items = [...dock.querySelectorAll('button')];
    dock.addEventListener('mousemove', e => {
      items.forEach(item => {
        const r = item.getBoundingClientRect();
        const dist = Math.abs(e.clientX - (r.left + r.width / 2));
        const t = Math.max(0, 1 - dist / 90);
        const scale = 1 + 0.55 * Math.sin(t * Math.PI / 2);
        item.style.transform = `translateY(${-10 * (scale - 1)}px) scale(${scale})`;
      });
    });
    dock.addEventListener('mouseleave', () => items.forEach(i => { i.style.transform = ''; }));
  }

  applyTheme();
  wallA.style.backgroundImage = `url("${(WALLS[wallIndex] || WALLS[0]).src}")`;
  wallA.classList.add('is-front');
  syncChoices();
  startCarousel();
  tickClocks();
  setInterval(tickClocks, 15000);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
})();
