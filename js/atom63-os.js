(() => {
  'use strict';

  const root = document.getElementById('os63');
  const windows = document.getElementById('window-layer');
  const quickSettings = document.getElementById('quick-settings');
  const homePopover = document.getElementById('home-popover');
  const lockScreen = document.getElementById('lock-screen');
  const brightness = document.getElementById('brightness');
  const brightnessOutput = document.getElementById('brightness-output');
  const slidersButton = document.querySelector('.sliders-button');
  const homeButton = document.querySelector('.home-button');
  const appDetails = {
    launcher: { title: 'App Center', icon: '▦', description: 'Open applications', kind: 'launcher', size: 'wide', width: 820, height: 610 },
    'about-system': { title: 'About This System', icon: '◈', description: 'System information and OS63 details', kind: 'about', size: 'regular', width: 520, height: 380 },
    'agent-chat': { title: 'Agent Chat', icon: '✦', description: 'Chat with A63', kind: 'agent', size: 'tall', width: 500, height: 700 },
    timeline: { title: 'Timeline', icon: '◫', description: "Browse You Zhang's work, notes, and milestones", kind: 'timeline', size: 'wide', width: 840, height: 700 },
    slides: { title: 'Slides', icon: '▤', description: 'Present and browse slide decks', kind: 'slides', size: 'wide', width: 1100, height: 760 },
    settings: { title: 'Settings', icon: '⚙', description: 'System and personalization settings', kind: 'settings', size: 'regular', width: 700, height: 600 },
    halftone: { title: 'Halftone Studio', icon: '◌', description: 'Generate graphic halftone treatments and export images', kind: 'halftone', size: 'wide', width: 880, height: 620 },
    resume: { title: 'Resume', icon: '▤', description: 'View and export resume as PDF', kind: 'resume', size: 'tall', width: 680, height: 820 },
    finder: { title: 'Finder', icon: '▣', description: 'Browse files and folders', kind: 'finder', size: 'wide', width: 900, height: 600 },
    calculator: { title: 'Calculator', icon: '⌘', description: 'Perform quick calculations', kind: 'calculator', size: 'small', width: 360, height: 520 },
    notes: { title: 'Notes', icon: '✎', description: 'Capture and edit local notes', kind: 'notes', size: 'regular', width: 760, height: 560 },
    'mdx-viewer': { title: 'Markdown Viewer', icon: '⌘', description: 'View markdown files', kind: 'mdx', size: 'tall', width: 700, height: 760 },
    preview: { title: 'Preview', icon: '▧', description: 'View images and photos', kind: 'preview', size: 'regular', width: 800, height: 600 },
    document: { title: 'Document Viewer', icon: '▱', description: 'View PDF documents', kind: 'document', size: 'tall', width: 760, height: 800 },
    github: { title: 'GitHub', icon: '⌘', kind: 'github', size: 'regular' },
  };
  let zIndex = 30;

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
    document.getElementById('lock-time').textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
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

  function loadPreferences() {
    try {
      setBrightness(localStorage.getItem('atom63-brightness') || 100);
      setTheme(localStorage.getItem('atom63-theme') || 'violet');
    } catch { setBrightness(100); }
  }

  function appContent(kind) {
    if (kind === 'launcher') return `<div class="app-center-header"><b>All apps</b><span>OS63 applications</span></div><div class="app-grid">${Object.entries(appDetails).filter(([id]) => !['launcher', 'github'].includes(id)).map(([id, app]) => `<button data-launch="${id}"><i class="app-icon">${app.icon}</i><b>${app.title}</b><span>${app.description}</span></button>`).join('')}</div>`;
    if (kind === 'about') return `<section class="about-system source-about"><span class="system-glyph">63</span><h2>OS63</h2><p>Designed by You Zhang · ATOM63</p><dl><div><dt>Version</dt><dd>OS63 2026.08</dd></div><div><dt>Display</dt><dd>Desktop portfolio</dd></div><div><dt>Status</dt><dd><i></i> Available</dd></div></dl><p class="about-footnote">A collection of work, utilities, and small experiments.</p></section>`;
    if (kind === 'agent') return `<section class="agent-chat"><div class="agent-thread"><article><b>ATOM63 Agent</b><p>Hi — this is the desktop assistant. Ask about the system, projects, or tools.</p></article></div><form class="agent-form"><input aria-label="Message Agent Chat" placeholder="Message the agent…" /><button>Send</button></form></section>`;
    if (kind === 'timeline') return `<section class="timeline"><article><time>2018</time><div><b>Visual foundations</b><p>Built the language for systems, products, and stories.</p></div></article><article><time>2021</time><div><b>Design engineering</b><p>Began connecting interaction detail directly to implementation.</p></div></article><article><time>2024</time><div><b>Motion systems</b><p>Scaled identity, interface, and motion across digital surfaces.</p></div></article><article><time>Now</time><div><b>ATOM63</b><p>A place to explore work as an operating system.</p></div></article></section>`;
    if (kind === 'slides') return `<section class="slides"><div class="slide-stage" data-slide="0"><span>01 / 03</span><h2>Interfaces can<br />carry a story.</h2><p>System thinking, engineering precision, and motion.</p></div><div class="slide-controls"><button data-slide-direction="-1">← Previous</button><button data-slide-direction="1">Next →</button></div></section>`;
    if (kind === 'settings') return `<section class="settings-panel"><div class="settings-heading"><h2>Settings</h2><p>System and personalization settings.</p></div><div class="settings-tabs" role="tablist"><button role="tab" aria-selected="true" data-settings-tab="appearance">Appearance</button><button role="tab" aria-selected="false" data-settings-tab="system">System</button><button role="tab" aria-selected="false" data-settings-tab="about">About</button></div><section data-settings-panel="appearance"><label class="setting-control" for="window-brightness"><span>Brightness</span><output>100%</output><input id="window-brightness" data-brightness-input type="range" min="45" max="100" value="100" /></label><div class="setting-themes"><b>Theme</b><div>${['violet', 'rose', 'lime', 'night'].map(theme => `<button data-theme="${theme}">${theme}</button>`).join('')}</div></div></section><section data-settings-panel="system" hidden><div class="settings-list"><div><b>Window behavior</b><span>Applications restore in their last session.</span></div><div><b>Desktop</b><span>Widget layout is saved locally.</span></div></div></section><section data-settings-panel="about" hidden><div class="settings-list"><div><b>OS63</b><span>ATOM63 desktop environment · 2026.08</span></div><div><b>Build</b><span>Static local replica</span></div></div></section><div class="setting-status"><span>Accessibility</span><b>Reduced motion follows your device preference.</b></div></section>`;
    if (kind === 'halftone') return `<section class="halftone-empty"><span>◌</span><h2>Halftone Studio is queued up</h2><p>Image import, dot controls, previews, and exports are coming soon.</p></section>`;
    if (kind === 'resume') return `<section class="resume resume-viewer"><header><span>RESUME.PDF</span><button data-print-resume>Save to PDF</button></header><article><div class="resume-head"><span>YOU ZHANG</span><h2>Design Engineer</h2><p>Los Angeles, CA · Microsoft</p></div><hr /><section><b>Profile</b><p>Design engineer working across visual systems, motion, interaction, and implementation.</p></section><section><b>Experience</b><p><strong>Microsoft</strong><br />Designing scalable interfaces and expressive product systems.</p></section><section><b>Practice</b><p>Brand systems · Design systems · Prototyping · Creative development</p></section></article></section>`;
    if (kind === 'finder') return `<section class="finder"><header class="finder-toolbar"><div><button data-finder-nav="back" aria-label="Back">←</button><button data-finder-nav="forward" aria-label="Forward">→</button><b>Desktop</b></div><div><button data-finder-view="grid" aria-label="Icon view">▦</button><button data-finder-view="list" aria-label="List view">☷</button></div></header><aside><b>Favorites</b><button data-launch="timeline">▣ Case studies</button><button data-launch="notes">▤ Notes</button><button data-launch="preview">▧ Photos</button><b>Locations</b><button data-launch="resume">▤ Resume</button></aside><div class="finder-items" data-finder-items><button data-launch="timeline"><i>▣</i><b>Case studies</b><span>Selected work</span></button><button data-launch="notes"><i>▤</i><b>Notes</b><span>Local notes</span></button><button data-launch="mdx-viewer"><i>⌘</i><b>My shelf</b><span>References</span></button><button data-launch="preview"><i>▧</i><b>Photos</b><span>Personal archive</span></button><button data-launch="resume"><i>▤</i><b>Resume.pdf</b><span>PDF document</span></button></div></section>`;
    if (kind === 'calculator') return `<div class="calculator"><output>0</output>${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(value => `<button data-calc="${value}">${value}</button>`).join('')}</div>`;
    if (kind === 'notes') return `<section class="notes-app"><header><button data-note-new>New</button><label><span>⌕</span><input data-note-search aria-label="Search notes" placeholder="Search notes" /></label></header><aside data-note-list><button class="is-selected" data-note-title="Desktop details" data-note-body="Build a desktop from small, useful details.\n\nKeep every interaction tactile, clear, and closeable.">Desktop details<small>Today</small></button><button data-note-title="Things to keep" data-note-body="The story is never finished.\n\nLeave room for the next useful thing.">Things to keep<small>Yesterday</small></button></aside><article><input data-note-title-input aria-label="Note title" value="Desktop details" /><textarea data-note-body-input aria-label="Note content">Build a desktop from small, useful details.&#10;&#10;Keep every interaction tactile, clear, and closeable.</textarea></article></section>`;
    if (kind === 'mdx') return `<article class="mdx-document"><small>MY SHELF / 01</small><h2>Tools should leave room for curiosity.</h2><p>A small collection of ideas, references, books, and experiments that continually shape the work.</p><ul><li>Designing Design — Kenya Hara</li><li>Ways of Seeing — John Berger</li><li>Creative Selection — Ken Kocienda</li></ul></article>`;
    if (kind === 'preview') return `<section class="preview-app"><header><b>Photos</b><span>8 items</span></header><div class="preview-grid">${Array.from({ length: 8 }, (_, index) => `<button data-preview-photo="${index}" aria-label="Open photo ${index + 1}" style="--photo:${index}"><span>PHOTO ${String(index + 1).padStart(2, '0')}</span></button>`).join('')}</div><p data-preview-caption>Select a photo to inspect it.</p></section>`;
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
    win.querySelectorAll('[data-settings-tab]').forEach(button => button.addEventListener('click', () => {
      win.querySelectorAll('[data-settings-tab]').forEach(tab => tab.setAttribute('aria-selected', String(tab === button)));
      win.querySelectorAll('[data-settings-panel]').forEach(panel => { panel.hidden = panel.dataset.settingsPanel !== button.dataset.settingsTab; });
    }));
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
    win.querySelectorAll('[data-finder-view]').forEach(button => button.addEventListener('click', () => {
      win.querySelector('[data-finder-items]')?.classList.toggle('is-list', button.dataset.finderView === 'list');
      win.querySelectorAll('[data-finder-view]').forEach(control => control.classList.toggle('is-active', control === button));
    }));
    const noteTitle = win.querySelector('[data-note-title-input]'); const noteBody = win.querySelector('[data-note-body-input]');
    win.querySelectorAll('[data-note-list] button').forEach(button => button.addEventListener('click', () => {
      win.querySelectorAll('[data-note-list] button').forEach(item => item.classList.toggle('is-selected', item === button));
      noteTitle.value = button.dataset.noteTitle || ''; noteBody.value = button.dataset.noteBody || '';
    }));
    win.querySelector('[data-note-new]')?.addEventListener('click', () => { noteTitle.value = 'Untitled note'; noteBody.value = ''; noteBody.focus(); });
    win.querySelector('[data-note-search]')?.addEventListener('input', event => {
      const query = event.currentTarget.value.toLowerCase();
      win.querySelectorAll('[data-note-list] button').forEach(item => { item.hidden = !item.textContent.toLowerCase().includes(query); });
    });
    win.querySelectorAll('[data-preview-photo]').forEach(button => button.addEventListener('click', () => {
      win.querySelector('[data-preview-caption]').textContent = `PHOTO ${String(Number(button.dataset.previewPhoto) + 1).padStart(2, '0')} · Desktop archive`;
      win.querySelectorAll('[data-preview-photo]').forEach(item => item.classList.toggle('is-active', item === button));
    }));
    win.querySelector('[data-print-resume]')?.addEventListener('click', () => window.print());
  }

  function openApp(id) {
    const app = appDetails[id]; if (!app) return; closePopovers();
    const existing = windows.querySelector(`[data-app-window="${id}"]`);
    if (existing) { existing.hidden = false; bringToFront(existing); return; }
    const win = document.createElement('section'); win.className = `app-window app-window--${app.size}`; win.dataset.appWindow = id;
    const number = windows.querySelectorAll('.app-window').length;
    win.style.left = `${Math.min(76 + number * 28, Math.max(12, window.innerWidth - Math.min(app.width, 590)))}px`; win.style.top = `${Math.min(76 + number * 22, Math.max(43, window.innerHeight - 400))}px`;
    win.style.width = `${Math.min(app.width, window.innerWidth - 24)}px`; win.style.height = `${Math.min(app.height, window.innerHeight - 86)}px`;
    win.innerHTML = `<div class="window-frame"><header class="window-titlebar"><div class="traffic"><button data-window-action="close" aria-label="Close ${escapeHTML(app.title)}"></button><button data-window-action="minimize" aria-label="Minimize ${escapeHTML(app.title)}"></button><button data-window-action="maximize" aria-label="Maximize ${escapeHTML(app.title)}"></button></div><strong class="window-title">${escapeHTML(app.title)}</strong><i class="window-spacer"></i></header><div class="window-content">${appContent(app.kind)}</div></div>`;
    windows.append(win); bringToFront(win); makeDraggable(win); initWindowInteractions(win); win.addEventListener('pointerdown', () => bringToFront(win));
  }

  function bindControls() {
    document.querySelectorAll('.dock [data-app]').forEach(button => button.addEventListener('click', () => openApp(button.dataset.app)));
    homeButton.addEventListener('click', () => togglePopover(homePopover, homeButton)); slidersButton.addEventListener('click', () => togglePopover(quickSettings, slidersButton));
    quickSettings.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
    quickSettings.querySelector('[data-launch="settings"]').addEventListener('click', () => openApp('settings'));
    homePopover.querySelectorAll('[data-launch]').forEach(button => button.addEventListener('click', () => openApp(button.dataset.launch)));
    homePopover.querySelector('[data-action="overview"]').addEventListener('click', () => { root.classList.toggle('is-overview'); closePopovers(); });
    homePopover.querySelector('[data-action="lock"]').addEventListener('click', () => { closePopovers(); lockScreen.hidden = false; });
    homePopover.querySelector('[data-action="reboot"]').addEventListener('click', () => window.location.reload());
    lockScreen.querySelector('[data-action="unlock"]').addEventListener('click', () => { lockScreen.hidden = true; });
    brightness.addEventListener('input', () => setBrightness(brightness.value));
    document.addEventListener('click', event => { if (!event.target.closest('.quick-settings,.home-popover,.sliders-button,.home-button')) closePopovers(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closePopovers(); });
  }

  loadPreferences(); bindControls(); updateClock(); window.setInterval(updateClock, 1000);
})();
