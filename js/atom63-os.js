(() => {
  'use strict';

  const root = document.getElementById('os63');
  const windows = document.getElementById('window-layer');
  const sticky = document.getElementById('sticky-note');
  const albums = document.getElementById('albums');
  const popovers = {
    themes: document.getElementById('theme-popover'),
    home: document.getElementById('home-popover'),
  };
  const albumData = [
    ['Dark Arts', 'aespa', 'linear-gradient(145deg,#111,#3a3c60 48%,#ec5360)'],
    ['FOCUS', 'Hearts2Hearts', 'linear-gradient(145deg,#f4b5ca,#c7d8f2 52%,#5d91cb)'],
    ['花苞当日出', 'Capper', 'linear-gradient(145deg,#43230e,#d99439 48%,#16130e)'],
    ['Seoul City', 'JENNIE', 'linear-gradient(145deg,#251017,#b11230 48%,#09090c)'],
  ];
  const appDetails = {
    launcher: { title: 'App Center', icon: '▦', kind: 'launcher' },
    finder: { title: 'Finder', icon: '▣', kind: 'finder' },
    messages: { title: 'Messages', icon: '●', kind: 'messages' },
    projects: { title: 'Projects', icon: '▰', kind: 'projects' },
    settings: { title: 'Settings', icon: '⚙', kind: 'settings' },
    gallery: { title: 'Preview', icon: '▧', kind: 'gallery' },
    profile: { title: 'Profile', icon: '◉', kind: 'profile' },
    calculator: { title: 'Calculator', icon: '⌘', kind: 'calculator' },
    notes: { title: 'Notes', icon: '✎', kind: 'notes' },
    github: { title: 'GitHub', icon: '⌘', kind: 'github' },
  };
  let zIndex = 20;
  let listeningIndex = 0;

  function escapeHTML(value) {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
  }

  function updateClock() {
    const now = new Date();
    const date = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', month: 'short', day: 'numeric' }).format(now);
    const time = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
    document.getElementById('menu-time').textContent = `${date}  ${time}`;
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(now).reduce((map, item) => ({ ...map, [item.type]: item.value }), {});
    document.getElementById('clock-day').innerHTML = `${parts.weekday.toUpperCase()}<br><small>${parts.month}/${parts.day}</small>`;
    document.getElementById('clock-time').textContent = `${parts.hour}:${parts.minute}:${parts.second}`;
  }

  function renderAlbums() {
    albums.replaceChildren(...albumData.map(([title, artist, color], index) => {
      const album = document.createElement('div');
      album.className = 'album';
      album.innerHTML = `<div class="album-cover" style="--cover:${color}"></div><b>${escapeHTML(title)}</b><span>${escapeHTML(artist)}</span>`;
      if (index === listeningIndex) album.querySelector('.album-cover').style.outline = '2px solid #64c7ef';
      return album;
    }));
  }

  function saveNote() {
    try { localStorage.setItem('atom63-note', sticky.value); } catch { /* local persistence is optional */ }
  }

  function loadNote() {
    try { sticky.value = localStorage.getItem('atom63-note') || ''; } catch { sticky.value = ''; }
  }

  function appContent(kind) {
    if (kind === 'launcher') {
      return `<div class="app-grid">${Object.entries(appDetails).filter(([id]) => id !== 'launcher' && id !== 'github').map(([id, app]) => `<button data-launch="${id}"><i class="app-icon">${app.icon}</i><b>${app.title}</b><span>Open application</span></button>`).join('')}</div>`;
    }
    if (kind === 'finder') {
      return `<div class="files"><div class="file-row"><i>▰</i><div><b>Case studies</b><small>Design work and selected projects</small></div></div><div class="file-row"><i>▰</i><div><b>Sticky notes</b><small>Notes, drafts, and sketches</small></div></div><div class="file-row"><i>▰</i><div><b>My shelf</b><small>Books, films, and music</small></div></div><div class="file-row"><i>▰</i><div><b>Photos</b><small>Personal archive</small></div></div></div>`;
    }
    if (kind === 'messages') return `<div class="messages"><article class="message"><b>ATOM63</b><p>Welcome to the desktop. Every icon is an active app surface.</p></article><article class="message"><b>System</b><p>Wallpaper, note state, panels, and windows are ready to interact with.</p></article><article class="message"><b>You Zhang</b><p>Design engineering for expressive digital systems.</p></article></div>`;
    if (kind === 'projects') return `<div class="project-stage"><div><h2>Selected work</h2><p>Spatial UI · motion systems · visual platforms</p></div></div>`;
    if (kind === 'settings') return `<div class="settings-grid"><div class="setting"><b>Appearance</b><p>Choose a theme from the menu bar.</p></div><div class="setting"><b>Wallpaper</b><p>Abstract Windows-inspired bloom.</p></div><div class="setting"><b>Desktop</b><p>Panels can be opened, moved, minimized, and closed.</p></div><div class="setting"><b>Accessibility</b><p>Reduced motion is respected automatically.</p></div></div>`;
    if (kind === 'gallery') return `<div class="gallery"><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
    if (kind === 'profile') return `<div class="messages"><article class="message"><b>You Zhang · ATOM63</b><p>Design Engineer. Building cohesive brand and product experiences across systems, motion, and code.</p></article><article class="message"><b>Location</b><p>Los Angeles, CA · Microsoft</p></article></div>`;
    if (kind === 'calculator') return `<div class="calculator"><output id="calculator-output">0</output>${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(value => `<button data-calc="${value}">${value}</button>`).join('')}</div>`;
    if (kind === 'notes') return `<div class="note-sheet" contenteditable="true" role="textbox" aria-label="Note editor">Build a desktop from small, useful details.<br/>Keep the interaction tactile.<br/>Leave room for the story to continue.</div>`;
    if (kind === 'github') return `<div class="messages"><article class="message"><b>5248 contributions</b><p>15 day streak · 6 month overview</p></article><article class="message"><b>atom63</b><p>Recent activity would appear here in the live desktop.</p></article></div>`;
    return '';
  }

  function bringToFront(windowEl) {
    zIndex += 1;
    windowEl.style.zIndex = String(zIndex);
  }

  function makeDraggable(windowEl) {
    const bar = windowEl.querySelector('.window-titlebar');
    let startX = 0; let startY = 0; let originX = 0; let originY = 0; let dragging = false;
    bar.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      dragging = true;
      bringToFront(windowEl);
      const bounds = windowEl.getBoundingClientRect();
      startX = event.clientX; startY = event.clientY; originX = bounds.left; originY = bounds.top;
      bar.setPointerCapture(event.pointerId);
    });
    bar.addEventListener('pointermove', event => {
      if (!dragging) return;
      const maxX = Math.max(10, window.innerWidth - windowEl.offsetWidth - 10);
      const maxY = Math.max(42, window.innerHeight - windowEl.offsetHeight - 72);
      windowEl.style.left = `${Math.max(10, Math.min(maxX, originX + event.clientX - startX))}px`;
      windowEl.style.top = `${Math.max(42, Math.min(maxY, originY + event.clientY - startY))}px`;
    });
    const finish = () => { dragging = false; };
    bar.addEventListener('pointerup', finish);
    bar.addEventListener('pointercancel', finish);
  }

  function openApp(id) {
    const app = appDetails[id];
    if (!app) return;
    const existing = windows.querySelector(`[data-app-window="${id}"]`);
    if (existing) { existing.hidden = false; bringToFront(existing); return; }
    const win = document.createElement('section');
    win.className = 'app-window';
    win.dataset.appWindow = id;
    const number = windows.querySelectorAll('.app-window').length;
    win.style.left = `${Math.min(76 + number * 28, Math.max(12, window.innerWidth - 590))}px`;
    win.style.top = `${Math.min(76 + number * 22, Math.max(43, window.innerHeight - 400))}px`;
    win.innerHTML = `<div class="window-frame"><header class="window-titlebar"><div class="traffic"><button data-window-action="close" aria-label="Close ${app.title}"></button><button data-window-action="minimize" aria-label="Minimize ${app.title}"></button><button data-window-action="maximize" aria-label="Maximize ${app.title}"></button></div><strong class="window-title">${escapeHTML(app.title)}</strong><i class="window-spacer"></i></header><div class="window-content">${appContent(app.kind)}</div></div>`;
    windows.append(win);
    bringToFront(win);
    makeDraggable(win);
    win.addEventListener('pointerdown', () => bringToFront(win));
  }

  function runCalculator(button) {
    const output = button.closest('.calculator').querySelector('output');
    const value = button.dataset.calc;
    if (value === 'C') { output.textContent = '0'; return; }
    if (value === '±') { output.textContent = String(Number(output.textContent) * -1); return; }
    if (value === '=') {
      try { output.textContent = String(Function(`"use strict"; return (${output.textContent.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-')})`)()); } catch { output.textContent = 'Error'; }
      return;
    }
    output.textContent = output.textContent === '0' || output.textContent === 'Error' ? value : output.textContent + value;
  }

  function togglePopover(name) {
    const shouldOpen = popovers[name].hidden;
    Object.values(popovers).forEach(element => { element.hidden = true; });
    popovers[name].hidden = !shouldOpen;
  }

  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const theme = event.target.closest('[data-theme]')?.dataset.theme;
    const dockApp = event.target.closest('[data-app]')?.dataset.app;
    const launch = event.target.closest('[data-launch]')?.dataset.launch;
    const windowAction = event.target.closest('[data-window-action]')?.dataset.windowAction;
    const calc = event.target.closest('[data-calc]');
    if (theme) { root.dataset.theme = theme; popovers.themes.hidden = true; return; }
    if (dockApp) { openApp(dockApp); return; }
    if (launch) { openApp(launch); return; }
    if (calc) { runCalculator(calc); return; }
    if (windowAction) {
      const win = event.target.closest('.app-window');
      if (windowAction === 'close') win.remove();
      if (windowAction === 'minimize') win.hidden = true;
      if (windowAction === 'maximize') win.classList.toggle('is-maximized');
      return;
    }
    if (action === 'themes' || action === 'home') { togglePopover(action); return; }
    if (action === 'reset') { sticky.value = ''; saveNote(); windows.replaceChildren(); popovers.home.hidden = true; return; }
    if (action === 'github') { openApp('github'); return; }
    if (action === 'shuffle' || action === 'listening') { listeningIndex = (listeningIndex + 1) % albumData.length; renderAlbums(); return; }
    if (action === 'weather') { const temp = document.getElementById('weather-temp'); temp.textContent = temp.textContent === '96' ? '36' : '96'; return; }
    if (!event.target.closest('.theme-popover,.home-popover')) Object.values(popovers).forEach(popover => { popover.hidden = true; });
  });

  sticky.addEventListener('input', saveNote);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { Object.values(popovers).forEach(popover => { popover.hidden = true; }); }
  });
  loadNote();
  renderAlbums();
  updateClock();
  window.setInterval(updateClock, 1000);
})();
