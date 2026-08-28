(() => {
  'use strict';

  const root = document.getElementById('os63');
  const windows = document.getElementById('window-layer');
  const sticky = document.getElementById('sticky-note');
  const albums = document.getElementById('albums');
  const quickSettings = document.getElementById('quick-settings');
  const homePopover = document.getElementById('home-popover');
  const brightness = document.getElementById('brightness');
  const brightnessOutput = document.getElementById('brightness-output');
  const slidersButton = document.querySelector('.sliders-button');
  const homeButton = document.querySelector('.home-button');
  const albumData = [
    ['Dark Arts', 'aespa', 'linear-gradient(145deg,#111,#3a3c60 48%,#ec5360)'],
    ['FOCUS', 'Hearts2Hearts', 'linear-gradient(145deg,#f4b5ca,#c7d8f2 52%,#5d91cb)'],
    ['花苞当日出', 'Capper', 'linear-gradient(145deg,#43230e,#d99439 48%,#16130e)'],
    ['Seoul City', 'JENNIE', 'linear-gradient(145deg,#251017,#b11230 48%,#09090c)'],
  ];
  const appDetails = {
    launcher: { title: 'App Center', icon: '▦', kind: 'launcher', size: 'wide' },
    'about-system': { title: 'About This System', icon: '◈', kind: 'about', size: 'regular' },
    'agent-chat': { title: 'Agent Chat', icon: '✦', kind: 'agent', size: 'regular' },
    timeline: { title: 'Timeline', icon: '◫', kind: 'timeline', size: 'regular' },
    slides: { title: 'Slides', icon: '▤', kind: 'slides', size: 'wide' },
    settings: { title: 'Settings', icon: '⚙', kind: 'settings', size: 'regular' },
    halftone: { title: 'Halftone', icon: '◌', kind: 'halftone', size: 'regular' },
    resume: { title: 'Resume', icon: '▤', kind: 'resume', size: 'regular' },
    finder: { title: 'Finder', icon: '▣', kind: 'finder', size: 'regular' },
    calculator: { title: 'Calculator', icon: '⌘', kind: 'calculator', size: 'small' },
    notes: { title: 'Notes', icon: '✎', kind: 'notes', size: 'regular' },
    'mdx-viewer': { title: 'MDX Viewer', icon: '⌘', kind: 'mdx', size: 'wide' },
    preview: { title: 'Preview', icon: '▧', kind: 'preview', size: 'regular' },
    document: { title: 'Document', icon: '▱', kind: 'document', size: 'regular' },
    github: { title: 'GitHub', icon: '⌘', kind: 'github', size: 'regular' },
  };
  let zIndex = 30;
  let listeningIndex = 0;

  function escapeHTML(value) {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
  }

  function updateClock() {
    const now = new Date();
    const menuDate = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
    const menuTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
    document.getElementById('menu-time').textContent = `${menuDate}  ${menuTime}`;
    const parts = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now).reduce((map, item) => ({ ...map, [item.type]: item.value }), {});
    const day = document.getElementById('clock-day');
    day.childNodes[0].textContent = parts.weekday.toUpperCase();
    day.querySelector('small').textContent = `${parts.month}/${parts.day}`;
    document.getElementById('clock-time').textContent = `${parts.hour}:${parts.minute}:${parts.second}`;
  }

  function setBrightness(value) {
    const safeValue = Math.max(45, Math.min(100, Number(value) || 100));
    root.style.setProperty('--desktop-dim', String((100 - safeValue) / 100 * .66));
    brightness.value = String(safeValue);
    brightnessOutput.value = `${safeValue}%`;
    brightnessOutput.textContent = `${safeValue}%`;
    document.querySelectorAll('[data-brightness-input]').forEach(input => { input.value = String(safeValue); });
    document.querySelectorAll('.setting-control output').forEach(output => { output.value = `${safeValue}%`; output.textContent = `${safeValue}%`; });
    try { localStorage.setItem('atom63-brightness', String(safeValue)); } catch { /* optional persistence */ }
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('atom63-theme', theme); } catch { /* optional persistence */ }
  }

  function closePopovers() {
    quickSettings.hidden = true;
    homePopover.hidden = true;
    slidersButton.setAttribute('aria-expanded', 'false');
    homeButton.setAttribute('aria-expanded', 'false');
  }

  function togglePopover(popover, trigger) {
    const willOpen = popover.hidden;
    closePopovers();
    popover.hidden = !willOpen;
    trigger.setAttribute('aria-expanded', String(willOpen));
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

  function saveNote() { try { localStorage.setItem('atom63-note', sticky.value); } catch { /* optional persistence */ } }
  function loadPreferences() {
    try {
      sticky.value = localStorage.getItem('atom63-note') || '';
      setBrightness(localStorage.getItem('atom63-brightness') || 100);
      setTheme(localStorage.getItem('atom63-theme') || 'violet');
    } catch { sticky.value = ''; setBrightness(100); }
  }

  function appContent(kind) {
    if (kind === 'launcher') return `<div class="app-grid">${Object.entries(appDetails).filter(([id]) => !['launcher', 'github'].includes(id)).map(([id, app]) => `<button data-launch="${id}"><i class="app-icon">${app.icon}</i><b>${app.title}</b><span>Open application</span></button>`).join('')}</div>`;
    if (kind === 'about') return `<section class="about-system"><span class="system-glyph">◈</span><h2>OS63</h2><p>ATOM63 desktop environment</p><dl><div><dt>Version</dt><dd>2026.08</dd></div><div><dt>Status</dt><dd><i></i> All systems operational</dd></div><div><dt>Interaction</dt><dd>Windows, widgets, dock, and quick settings</dd></div></dl></section>`;
    if (kind === 'agent') return `<section class="agent-chat"><div class="agent-thread"><article><b>ATOM63 Agent</b><p>Hi — this is the desktop assistant. Ask about the system, projects, or tools.</p></article></div><form class="agent-form"><input aria-label="Message Agent Chat" placeholder="Message the agent…" /><button>Send</button></form></section>`;
    if (kind === 'timeline') return `<section class="timeline"><article><time>2018</time><div><b>Visual foundations</b><p>Built the language for systems, products, and stories.</p></div></article><article><time>2021</time><div><b>Design engineering</b><p>Began connecting interaction detail directly to implementation.</p></div></article><article><time>2024</time><div><b>Motion systems</b><p>Scaled identity, interface, and motion across digital surfaces.</p></div></article><article><time>Now</time><div><b>ATOM63</b><p>A place to explore work as an operating system.</p></div></article></section>`;
    if (kind === 'slides') return `<section class="slides"><div class="slide-stage" data-slide="0"><span>01 / 03</span><h2>Interfaces can<br />carry a story.</h2><p>System thinking, engineering precision, and motion.</p></div><div class="slide-controls"><button data-slide-direction="-1">← Previous</button><button data-slide-direction="1">Next →</button></div></section>`;
    if (kind === 'settings') return `<section class="settings-panel"><div class="settings-heading"><h2>Settings</h2><p>Personalize this desktop.</p></div><label class="setting-control" for="window-brightness"><span>Brightness</span><output>100%</output><input id="window-brightness" data-brightness-input type="range" min="45" max="100" value="100" /></label><div class="setting-themes"><b>Appearance</b><div>${['violet', 'rose', 'lime', 'night'].map(theme => `<button data-theme="${theme}">${theme}</button>`).join('')}</div></div><div class="setting-status"><span>Accessibility</span><b>Reduced motion follows your device preference.</b></div></section>`;
    if (kind === 'halftone') return `<section class="halftone"><canvas width="520" height="260" aria-label="Interactive halftone canvas"></canvas><label>Dot density <input type="range" data-halftone-density min="8" max="28" value="15" /></label><p>Move the control to redraw the pattern.</p></section>`;
    if (kind === 'resume') return `<section class="resume"><div><span>YOU ZHANG</span><h2>Design Engineer</h2><p>Los Angeles, CA · Microsoft</p></div><hr /><section><b>Practice</b><p>I work across design systems, visual identity, interaction, and front-end execution.</p></section><section><b>Focus</b><p>Scalable visual systems that make complex products feel clear and alive.</p></section><button data-print-resume>Print resume</button></section>`;
    if (kind === 'finder') return `<div class="files"><button class="file-row" data-launch="timeline"><i>▰</i><div><b>Case studies</b><small>Selected work and project timelines</small></div></button><button class="file-row" data-launch="notes"><i>▰</i><div><b>Sticky notes</b><small>Notes, drafts, and sketches</small></div></button><button class="file-row" data-launch="mdx-viewer"><i>▰</i><div><b>My shelf</b><small>Books, films, and music</small></div></button><button class="file-row" data-launch="preview"><i>▰</i><div><b>Photos</b><small>Personal archive</small></div></button></div>`;
    if (kind === 'calculator') return `<div class="calculator"><output>0</output>${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(value => `<button data-calc="${value}">${value}</button>`).join('')}</div>`;
    if (kind === 'notes') return `<div class="note-sheet" contenteditable="true" role="textbox" aria-label="Note editor">Build a desktop from small, useful details.<br />Keep the interaction tactile.<br />Leave room for the story to continue.</div>`;
    if (kind === 'mdx') return `<article class="mdx-document"><small>MY SHELF / 01</small><h2>Tools should leave room for curiosity.</h2><p>A small collection of ideas, references, books, and experiments that continually shape the work.</p><ul><li>Designing Design — Kenya Hara</li><li>Ways of Seeing — John Berger</li><li>Creative Selection — Ken Kocienda</li></ul></article>`;
    if (kind === 'preview') return `<section class="preview-grid">${Array.from({ length: 8 }, (_, index) => `<button aria-label="Open photo ${index + 1}" style="--photo:${index}"><span>PHOTO ${String(index + 1).padStart(2, '0')}</span></button>`).join('')}</section>`;
    if (kind === 'document') return `<article class="document"><small>DOCUMENT</small><h2>Design system field notes</h2><p>Every tool here is designed to be opened, explored, and closed like a compact working desktop.</p><button data-launch="notes">Open notes →</button></article>`;
    if (kind === 'github') return `<div class="messages"><article class="message"><b>5248 contributions</b><p>15 day streak · 6 month overview</p></article><article class="message"><b>atom63</b><p>Recent activity would appear here in the live desktop.</p></article></div>`;
    return '';
  }

  function bringToFront(windowEl) { zIndex += 1; windowEl.style.zIndex = String(zIndex); }
  function makeDraggable(windowEl) {
    const bar = windowEl.querySelector('.window-titlebar');
    let startX = 0; let startY = 0; let originX = 0; let originY = 0; let dragging = false;
    bar.addEventListener('pointerdown', event => {
      if (event.target.closest('button') || windowEl.classList.contains('is-maximized')) return;
      dragging = true; bringToFront(windowEl);
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
    bar.addEventListener('pointerup', finish); bar.addEventListener('pointercancel', finish);
  }

  function evaluateCalculation(expression) {
    const normalized = expression.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-');
    const tokens = normalized.match(/\d*\.?\d+|[+\-*/]/g);
    if (!tokens || !tokens.length || tokens.join('') !== normalized) throw new Error('Invalid expression');
    let result = Number(tokens[0]);
    for (let index = 1; index < tokens.length; index += 2) {
      const operator = tokens[index]; const operand = Number(tokens[index + 1]);
      if (!Number.isFinite(operand)) throw new Error('Invalid expression');
      if (operator === '+') result += operand;
      if (operator === '-') result -= operand;
      if (operator === '*') result *= operand;
      if (operator === '/') result /= operand;
    }
    if (!Number.isFinite(result)) throw new Error('Invalid result');
    return Number(result.toFixed(10)).toString();
  }

  function runCalculator(button) {
    const output = button.closest('.calculator').querySelector('output'); const value = button.dataset.calc;
    if (value === 'C') { output.textContent = '0'; return; }
    if (value === '±') { output.textContent = String(Number(output.textContent) * -1); return; }
    if (value === '%') { output.textContent = String(Number(output.textContent) / 100); return; }
    if (value === '=') { try { output.textContent = evaluateCalculation(output.textContent); } catch { output.textContent = 'Error'; } return; }
    output.textContent = output.textContent === '0' || output.textContent === 'Error' ? value : output.textContent + value;
  }

  function drawHalftone(canvas, density) {
    const context = canvas.getContext('2d'); const width = canvas.width; const height = canvas.height; const spacing = Number(density);
    context.clearRect(0, 0, width, height); context.fillStyle = '#eaf7ff'; context.fillRect(0, 0, width, height);
    for (let y = spacing / 2; y < height; y += spacing) for (let x = spacing / 2; x < width; x += spacing) {
      const ratio = Math.sin(x / 80) * .25 + Math.cos(y / 55) * .22 + .48;
      context.beginPath(); context.fillStyle = `hsl(${210 + ratio * 88} 70% ${25 + ratio * 30}%)`;
      context.arc(x, y, Math.max(1, ratio * spacing * .46), 0, Math.PI * 2); context.fill();
    }
  }

  function initWindowInteractions(win) {
    win.querySelectorAll('[data-window-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.windowAction;
      if (action === 'close') win.remove();
      if (action === 'minimize') win.hidden = true;
      if (action === 'maximize') win.classList.toggle('is-maximized');
    }));
    win.querySelectorAll('[data-launch]').forEach(button => button.addEventListener('click', () => openApp(button.dataset.launch)));
    win.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
    win.querySelectorAll('[data-calc]').forEach(button => button.addEventListener('click', () => runCalculator(button)));
    win.querySelectorAll('[data-brightness-input]').forEach(input => { input.value = brightness.value; input.addEventListener('input', () => setBrightness(input.value)); });
    const agentForm = win.querySelector('.agent-form');
    if (agentForm) agentForm.addEventListener('submit', event => {
      event.preventDefault(); const input = agentForm.querySelector('input'); const message = input.value.trim(); if (!message) return;
      const reply = document.createElement('article'); reply.innerHTML = `<b>ATOM63 Agent</b><p>${escapeHTML(`I received: “${message}” — this desktop keeps the interaction local and responsive.`)}</p>`;
      win.querySelector('.agent-thread').append(reply); input.value = '';
    });
    const stage = win.querySelector('.slide-stage');
    if (stage) {
      const slides = [['Interfaces can<br />carry a story.', 'System thinking, engineering precision, and motion.'], ['Build the feeling<br />into the system.', 'A detail only matters when it makes the whole clearer.'], ['Make room<br />for play.', 'The best tool is useful before it is impressive.']]; let slideIndex = 0;
      win.querySelectorAll('[data-slide-direction]').forEach(button => button.addEventListener('click', () => {
        slideIndex = (slideIndex + Number(button.dataset.slideDirection) + slides.length) % slides.length; stage.dataset.slide = String(slideIndex);
        stage.querySelector('span').textContent = `${String(slideIndex + 1).padStart(2, '0')} / 03`; stage.querySelector('h2').innerHTML = slides[slideIndex][0]; stage.querySelector('p').textContent = slides[slideIndex][1];
      }));
    }
    const canvas = win.querySelector('.halftone canvas');
    if (canvas) { const density = win.querySelector('[data-halftone-density]'); drawHalftone(canvas, density.value); density.addEventListener('input', () => drawHalftone(canvas, density.value)); }
    win.querySelector('[data-print-resume]')?.addEventListener('click', () => window.print());
  }

  function openApp(id) {
    const app = appDetails[id]; if (!app) return; closePopovers();
    const existing = windows.querySelector(`[data-app-window="${id}"]`);
    if (existing) { existing.hidden = false; bringToFront(existing); return; }
    const win = document.createElement('section'); win.className = `app-window app-window--${app.size}`; win.dataset.appWindow = id;
    const number = windows.querySelectorAll('.app-window').length;
    win.style.left = `${Math.min(76 + number * 28, Math.max(12, window.innerWidth - 590))}px`; win.style.top = `${Math.min(76 + number * 22, Math.max(43, window.innerHeight - 400))}px`;
    win.innerHTML = `<div class="window-frame"><header class="window-titlebar"><div class="traffic"><button data-window-action="close" aria-label="Close ${escapeHTML(app.title)}"></button><button data-window-action="minimize" aria-label="Minimize ${escapeHTML(app.title)}"></button><button data-window-action="maximize" aria-label="Maximize ${escapeHTML(app.title)}"></button></div><strong class="window-title">${escapeHTML(app.title)}</strong><i class="window-spacer"></i></header><div class="window-content">${appContent(app.kind)}</div></div>`;
    windows.append(win); bringToFront(win); makeDraggable(win); initWindowInteractions(win); win.addEventListener('pointerdown', () => bringToFront(win));
  }

  function bindControls() {
    document.querySelectorAll('.dock [data-app]').forEach(button => button.addEventListener('click', () => openApp(button.dataset.app)));
    homeButton.addEventListener('click', () => togglePopover(homePopover, homeButton)); slidersButton.addEventListener('click', () => togglePopover(quickSettings, slidersButton));
    quickSettings.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
    quickSettings.querySelector('[data-launch="settings"]').addEventListener('click', () => openApp('settings'));
    homePopover.querySelectorAll('[data-launch]').forEach(button => button.addEventListener('click', () => openApp(button.dataset.launch)));
    homePopover.querySelector('[data-action="reset"]').addEventListener('click', () => { sticky.value = ''; saveNote(); windows.replaceChildren(); closePopovers(); });
    brightness.addEventListener('input', () => setBrightness(brightness.value)); sticky.addEventListener('input', saveNote);
    document.querySelector('[data-action="github"]').addEventListener('click', () => openApp('github'));
    document.querySelector('[data-action="shuffle"]').addEventListener('click', event => { event.stopPropagation(); listeningIndex = (listeningIndex + 1) % albumData.length; renderAlbums(); });
    document.querySelector('[data-action="listening"]').addEventListener('click', () => { listeningIndex = (listeningIndex + 1) % albumData.length; renderAlbums(); });
    document.querySelector('[data-action="weather"]').addEventListener('click', () => { const temp = document.getElementById('weather-temp'); temp.textContent = temp.textContent === '96' ? '36' : '96'; });
    document.addEventListener('click', event => { if (!event.target.closest('.quick-settings,.home-popover,.sliders-button,.home-button')) closePopovers(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closePopovers(); });
  }

  loadPreferences(); bindControls(); renderAlbums(); updateClock(); window.setInterval(updateClock, 1000);
})();
