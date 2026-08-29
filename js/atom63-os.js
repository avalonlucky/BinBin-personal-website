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
    'about-system': { title: 'About This System', icon: '◈', description: 'System information and Meridian OS details', kind: 'about', size: 'regular', width: 520, height: 380 },
    'agent-chat': { title: 'Agent Chat', icon: '✦', description: 'Chat with A63', kind: 'agent', size: 'tall', width: 500, height: 700 },
    timeline: { title: 'Timeline', icon: '◫', description: "Browse Meridian's work, notes, and milestones", kind: 'timeline', size: 'wide', width: 840, height: 700 },
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

  function settingChoice(label, key, options) {
    return `<section class="settings-row"><div><b>${label}</b></div><div class="settings-segment" data-setting-choice="${key}">${options.map(([value, text], index) => `<button data-setting-value="${value}" aria-pressed="${index === 0}">${text}</button>`).join('')}</div></section>`;
  }

  function settingRange(label, key, min, max, value, suffix) {
    return `<label class="settings-row settings-range"><span><b>${label}</b><output data-setting-output="${key}">${value}${suffix}</output></span><input data-setting-range="${key}" data-setting-suffix="${suffix}" type="range" min="${min}" max="${max}" value="${value}" /></label>`;
  }

  function finderItems() {
    const items = [
      ['timeline', '▣', 'Case studies', 'Selected work', 'folder'],
      ['notes', '✎', 'Notes', 'Local notes', 'application'],
      ['mdx-viewer', '⌘', 'My shelf', 'References', 'document'],
      ['preview', '▧', 'Photos', 'Personal archive', 'folder'],
      ['resume', '▤', 'Resume.pdf', 'PDF document', 'document'],
    ];
    return items.map(([id, icon, name, meta, type]) => `<button data-finder-item data-launch="${id}" data-name="${name}" data-meta="${meta}" data-type="${type}"><i>${icon}</i><b>${name}</b><span>${meta}</span></button>`).join('');
  }

  function appContent(kind) {
    if (kind === 'launcher') return `<div class="app-center-header"><b>All apps</b><span>Meridian OS applications</span></div><div class="app-grid">${Object.entries(appDetails).filter(([id]) => !['launcher', 'github'].includes(id)).map(([id, app]) => `<button data-launch="${id}"><i class="app-icon">${app.icon}</i><b>${app.title}</b><span>${app.description}</span></button>`).join('')}</div>`;
    if (kind === 'about') return `<section class="about-system source-about"><span class="system-glyph">M</span><h2>Meridian OS</h2><p>Designed by Meridian</p><dl><div><dt>Version</dt><dd>Meridian OS 2026.08</dd></div><div><dt>Display</dt><dd>Desktop portfolio</dd></div><div><dt>Status</dt><dd><i></i> Available</dd></div></dl><p class="about-footnote">A collection of work, utilities, and small experiments.</p></section>`;
    if (kind === 'agent') return `<section class="agent-chat"><div class="agent-thread"><article><b>Meridian Agent</b><p>Hi — this is the desktop assistant. Ask about the system, projects, or tools.</p></article></div><form class="agent-form"><input aria-label="Message Agent Chat" placeholder="Message the agent…" /><button>Send</button></form></section>`;
    if (kind === 'timeline') return `<section class="timeline"><article><time>2016</time><div><b>Brand foundations</b><p>Built visual systems for brands, products, and business communication.</p></div></article><article><time>2021</time><div><b>B-end visual systems</b><p>Connected complex product information with clear visual expression.</p></div></article><article><time>2024</time><div><b>AI workflow</b><p>Integrated AI into daily design and production workflows.</p></div></article><article><time>Now</time><div><b>Meridian</b><p>A place to explore work and the stories beyond the main portfolio.</p></div></article></section>`;
    if (kind === 'slides') return `<section class="slides"><div class="slide-stage" data-slide="0"><span>01 / 03</span><h2>Interfaces can<br />carry a story.</h2><p>System thinking, engineering precision, and motion.</p></div><div class="slide-controls"><button data-slide-direction="-1">← Previous</button><button data-slide-direction="1">Next →</button></div></section>`;
    if (kind === 'settings') return `<section class="settings-app" data-settings-app>
      <header class="settings-toolbar"><span></span><div><button data-settings-history="undo" aria-label="Undo" disabled>↶</button><button data-settings-history="redo" aria-label="Redo" disabled>↷</button><button data-settings-reset>Reset</button></div></header>
      <div class="settings-scroll"><div class="settings-inner">
        <div class="settings-tabs" role="tablist"><button role="tab" aria-selected="true" data-settings-tab="appearance">Appearance</button><button role="tab" aria-selected="false" data-settings-tab="system">System</button><button role="tab" aria-selected="false" data-settings-tab="about">About</button></div>
        <section class="settings-page" data-settings-panel="appearance">
          ${settingChoice('Mode', 'mode', [['light','Light'],['dark','Dark'],['system','System']])}
          ${settingChoice('OS', 'os', [['system','System'],['macos','macOS'],['windows','Windows']])}
          ${settingChoice('Theme', 'theme', [['violet','Violet'],['rose','Rose'],['lime','Lime'],['night','Night']])}
          ${settingChoice('Brand', 'brand', [['blue','Blue'],['purple','Purple'],['orange','Orange'],['green','Green']])}
          ${settingChoice('Surface', 'surface', [['glass','Glass'],['solid','Solid'],['soft','Soft']])}
          ${settingChoice('Surface tint', 'surfaceTint', [['cool','Cool'],['neutral','Neutral'],['warm','Warm']])}
          ${settingRange('Type scale', 'typeScale', 90, 115, 100, '%')}
          ${settingRange('Radius', 'radius', 70, 140, 100, '%')}
          ${settingChoice('Font', 'font', [['geist','Geist'],['mono','Mono'],['system','System']])}
          ${settingChoice('Icon theme', 'iconTheme', [['classic','Classic'],['minimal','Minimal'],['color','Color']])}
          <hr />
          <section class="wallpaper-setting"><div><b>Wallpaper</b><span>Choose a desktop image or let Meridian OS shuffle.</span></div><div class="wallpaper-actions"><button data-wallpaper="default">Default</button><button data-wallpaper="none">None</button><button data-wallpaper="shuffle">Shuffle</button></div></section>
        </section>
        <section class="settings-page" data-settings-panel="system" hidden><article class="settings-card"><h3>Developer Settings</h3><label class="settings-switch"><span><b>Debug Mode</b><small>Show window and interaction diagnostics.</small></span><input type="checkbox" data-setting-toggle="debug" /><i></i></label><hr /><div class="settings-shortcut"><span>Keyboard shortcut</span><kbd>Ctrl</kbd><b>+</b><kbd>Shift</kbd><b>+</b><kbd>D</kbd></div></article></section>
        <section class="settings-page" data-settings-panel="about" hidden><article class="settings-card about-settings"><div><span class="settings-about-icon">M</span><p><b>Meridian Space</b><small>Side B · 2026</small></p></div></article><article class="settings-card credits-card"><h3>Credits</h3><p>Designed and developed by Meridian</p><hr /><p>Creative desktop experience</p><hr /><p>© 2026 Meridian. All rights reserved.</p></article></section>
      </div></div>
    </section>`;
    if (kind === 'halftone') return `<section class="halftone-empty"><span>◌</span><h2>Halftone Studio is queued up</h2><p>Image import, dot controls, previews, and exports are coming soon.</p></section>`;
    if (kind === 'resume') return `<section class="resume resume-viewer"><header><span>RESUME.PDF</span><button data-print-resume>Save to PDF</button></header><article><div class="resume-head"><span>MERIDIAN</span><h2>Brand &amp; B-end Visual Designer</h2><p>10 years of design experience</p></div><hr /><section><b>Profile</b><p>Brand and B-end visual designer working across visual systems, product communication, and implementation.</p></section><section><b>Experience</b><p><strong>Full product-line ownership</strong><br />Building scalable visual systems and leading delivery from concept to launch.</p></section><section><b>Practice</b><p>Brand systems · B-end visual design · AI workflows · Design delivery</p></section></article></section>`;
    if (kind === 'finder') return `<section class="finder source-finder" data-finder>
      <header class="finder-toolbar"><div><button data-finder-sidebar aria-label="Show Sidebar">☰</button><span class="toolbar-group"><button data-finder-nav="back" aria-label="Go Back">←</button><button data-finder-nav="forward" aria-label="Go Forward">→</button><button data-finder-nav="up" aria-label="Go Up One Level">↑</button></span></div><b data-finder-path>/Home</b><div><button data-finder-view="grid" class="is-active" aria-label="Grid View">▦</button><button data-finder-view="list" aria-label="List View">☷</button><button data-finder-inspector aria-label="Inspector">ⓘ</button></div></header>
      <aside data-finder-sidebar-panel><b>Favorites</b><button data-finder-location="home">⌂ Home</button><button data-finder-location="documents">▤ Documents</button><button data-launch="timeline">▣ Case studies</button><button data-launch="notes">✎ Notes</button><button data-launch="preview">▧ Photos</button><b>Locations</b><button data-launch="resume">▤ Resume</button></aside>
      <main class="finder-main" data-finder-area><div class="finder-items" data-finder-items>${finderItems()}</div><footer data-finder-status>5 items</footer></main>
      <aside class="finder-inspector" data-finder-inspector-panel hidden><header><div><b>Inspector</b><span>Selected item metadata and quick actions.</span></div><button data-finder-inspector-close>×</button></header><div data-finder-inspector-content><p>Select a file or folder to inspect its metadata.</p></div></aside>
    </section>`;
    if (kind === 'calculator') return `<div class="calculator"><output>0</output>${['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='].map(value => `<button data-calc="${value}">${value}</button>`).join('')}</div>`;
    if (kind === 'notes') return `<section class="notes-app source-notes" data-notes-app><header><button data-note-new>＋ New</button><label><span>⌕</span><input data-note-search aria-label="Search notes" placeholder="Search notes" /></label><button data-note-delete aria-label="Delete note" disabled>⌫</button></header><aside data-note-list role="listbox" aria-label="Notes"></aside><article data-note-editor></article></section>`;
    if (kind === 'mdx') return `<article class="mdx-document"><small>MY SHELF / 01</small><h2>Tools should leave room for curiosity.</h2><p>A small collection of ideas, references, books, and experiments that continually shape the work.</p><ul><li>Designing Design — Kenya Hara</li><li>Ways of Seeing — John Berger</li><li>Creative Selection — Ken Kocienda</li></ul></article>`;
    if (kind === 'preview') return `<section class="preview-app"><header><b>Photos</b><span>8 items</span></header><div class="preview-grid">${Array.from({ length: 8 }, (_, index) => `<button data-preview-photo="${index}" aria-label="Open photo ${index + 1}" style="--photo:${index}"><span>PHOTO ${String(index + 1).padStart(2, '0')}</span></button>`).join('')}</div><p data-preview-caption>Select a photo to inspect it.</p></section>`;
    if (kind === 'document') return `<article class="document"><small>DOCUMENT</small><h2>Design system field notes</h2><p>Every tool here is designed to be opened, explored, and closed like a compact working desktop.</p><button data-launch="notes">Open notes →</button></article>`;
    if (kind === 'github') return `<div class="messages"><article class="message"><b>5248 contributions</b><p>15 day streak · 6 month overview</p></article><article class="message"><b>atom63</b><p>Recent activity would appear here in the live desktop.</p></article></div>`;
    return '';
  }

  function setActiveApp(id) {
    const menu = document.getElementById('active-app-menu');
    const app = appDetails[id];
    if (!menu || !app) return;
    const groups = id === 'finder' ? ['Finder', 'File', 'Edit', 'View', 'Go'] : [app.title, 'File', 'Edit', 'Window', 'Help'];
    menu.innerHTML = groups.map((label, index) => `<button data-app-menu="${index === 0 ? 'app' : label.toLowerCase()}">${escapeHTML(label)}</button>`).join('');
    menu.hidden = false;
  }

  function bringToFront(windowEl) {
    zIndex += 1;
    windowEl.style.zIndex = String(zIndex);
    setActiveApp(windowEl.dataset.appWindow);
  }
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

  const defaultAppearance = {
    mode: 'light', os: 'system', theme: 'violet', brand: 'blue', surface: 'glass',
    surfaceTint: 'cool', typeScale: 100, radius: 100, font: 'geist', iconTheme: 'classic', debug: false,
  };

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* persistence is optional */ }
  }

  function readAppearance() {
    return { ...defaultAppearance, ...readJSON('atom63-appearance', {}) };
  }

  function applyAppearance(state) {
    const resolvedMode = state.mode === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : state.mode;
    root.dataset.mode = resolvedMode;
    root.dataset.osStyle = state.os;
    root.dataset.surface = state.surface;
    root.dataset.surfaceTint = state.surfaceTint;
    root.dataset.iconTheme = state.iconTheme;
    root.dataset.debug = String(Boolean(state.debug));
    root.style.setProperty('--os-font-scale', String(Number(state.typeScale) / 100));
    root.style.setProperty('--os-radius-scale', String(Number(state.radius) / 100));
    const fonts = { geist: 'Geist, Arial, sans-serif', mono: '"Geist Mono", monospace', system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' };
    root.style.setProperty('--os-font-family', fonts[state.font] || fonts.geist);
    const brands = { blue: '#0dbcf0', purple: '#8667ef', orange: '#ff8b2c', green: '#27b775' };
    root.style.setProperty('--os-brand', brands[state.brand] || brands.blue);
    setTheme(state.theme || 'violet');
  }

  function setupSettings(win) {
    const app = win.querySelector('[data-settings-app]');
    if (!app) return;
    let state = readAppearance();
    const undo = [];
    const redo = [];
    const refresh = () => {
      app.querySelectorAll('[data-setting-choice]').forEach(group => {
        const key = group.dataset.settingChoice;
        group.querySelectorAll('[data-setting-value]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.settingValue === String(state[key]))));
      });
      app.querySelectorAll('[data-setting-range]').forEach(input => {
        const key = input.dataset.settingRange;
        input.value = String(state[key]);
        const output = app.querySelector(`[data-setting-output="${key}"]`);
        if (output) output.textContent = `${state[key]}${input.dataset.settingSuffix || ''}`;
      });
      const debug = app.querySelector('[data-setting-toggle="debug"]');
      if (debug) debug.checked = Boolean(state.debug);
      app.querySelector('[data-settings-history="undo"]').disabled = undo.length === 0;
      app.querySelector('[data-settings-history="redo"]').disabled = redo.length === 0;
    };
    const commit = next => {
      undo.push({ ...state });
      redo.length = 0;
      state = { ...state, ...next };
      writeJSON('atom63-appearance', state);
      applyAppearance(state);
      refresh();
    };
    app.querySelectorAll('[data-setting-value]').forEach(button => button.addEventListener('click', () => commit({ [button.closest('[data-setting-choice]').dataset.settingChoice]: button.dataset.settingValue })));
    app.querySelectorAll('[data-setting-range]').forEach(input => input.addEventListener('change', () => commit({ [input.dataset.settingRange]: Number(input.value) })));
    app.querySelectorAll('[data-setting-range]').forEach(input => input.addEventListener('input', () => {
      const output = app.querySelector(`[data-setting-output="${input.dataset.settingRange}"]`);
      if (output) output.textContent = `${input.value}${input.dataset.settingSuffix || ''}`;
    }));
    app.querySelector('[data-setting-toggle="debug"]')?.addEventListener('change', event => commit({ debug: event.currentTarget.checked }));
    app.querySelectorAll('[data-settings-history]').forEach(button => button.addEventListener('click', () => {
      const source = button.dataset.settingsHistory === 'undo' ? undo : redo;
      const target = button.dataset.settingsHistory === 'undo' ? redo : undo;
      if (!source.length) return;
      target.push({ ...state });
      state = source.pop();
      writeJSON('atom63-appearance', state);
      applyAppearance(state);
      refresh();
    }));
    app.querySelector('[data-settings-reset]')?.addEventListener('click', () => commit({ ...defaultAppearance }));
    app.querySelectorAll('[data-wallpaper]').forEach(button => button.addEventListener('click', () => setWallpaper(button.dataset.wallpaper)));
    refresh();
  }

  const defaultNotes = [
    { id: 'desktop-details', title: 'Desktop details', body: 'Build a desktop from small, useful details.\n\nKeep every interaction tactile, clear, and closeable.', updated: Date.now() },
    { id: 'things-to-keep', title: 'Things to keep', body: 'The story is never finished.\n\nLeave room for the next useful thing.', updated: Date.now() - 86400000 },
  ];

  function setupNotes(win) {
    const app = win.querySelector('[data-notes-app]');
    if (!app) return;
    let notes = readJSON('atom63-notes', defaultNotes).map(note => ({ ...note }));
    let selectedId = readJSON('atom63-note-selected', notes[0]?.id || null);
    let query = '';
    const list = app.querySelector('[data-note-list]');
    const editor = app.querySelector('[data-note-editor]');
    const deleteButton = app.querySelector('[data-note-delete]');
    const persist = () => { writeJSON('atom63-notes', notes); writeJSON('atom63-note-selected', selectedId); };
    const prettyDate = timestamp => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(timestamp);
    const render = () => {
      const filtered = notes.filter(note => `${note.title} ${note.body}`.toLowerCase().includes(query));
      list.innerHTML = filtered.length ? filtered.map(note => `<button role="option" aria-selected="${note.id === selectedId}" data-note-id="${escapeHTML(note.id)}"><b>${escapeHTML(note.title || 'Untitled')}</b><span>${escapeHTML(note.body || 'No additional text')}</span><small>◷ ${prettyDate(note.updated)}</small></button>`).join('') : `<div class="notes-empty"><b>No notes</b><span>Create a note or change your search.</span></div>`;
      const selected = notes.find(note => note.id === selectedId);
      deleteButton.disabled = !selected;
      editor.innerHTML = selected ? `<input data-note-title-input aria-label="Note title" value="${escapeHTML(selected.title)}" /><textarea data-note-body-input aria-label="Note body">${escapeHTML(selected.body)}</textarea><footer>Edited ${prettyDate(selected.updated)}</footer>` : `<div class="notes-no-selection"><b>No note selected</b><span>Create a local note to start writing.</span><button data-note-create-empty>New note</button></div>`;
      list.querySelectorAll('[data-note-id]').forEach(button => button.addEventListener('click', () => { selectedId = button.dataset.noteId; persist(); render(); }));
      const title = editor.querySelector('[data-note-title-input]');
      const body = editor.querySelector('[data-note-body-input]');
      const update = () => {
        const note = notes.find(item => item.id === selectedId);
        if (!note) return;
        note.title = title.value;
        note.body = body.value;
        note.updated = Date.now();
        persist();
      };
      title?.addEventListener('input', update);
      title?.addEventListener('blur', () => { if (!title.value.trim()) { title.value = 'Untitled'; update(); } render(); });
      body?.addEventListener('input', update);
      editor.querySelector('[data-note-create-empty]')?.addEventListener('click', createNote);
    };
    function createNote() {
      const id = `note-${Date.now()}`;
      notes.unshift({ id, title: 'Untitled', body: '', updated: Date.now() });
      selectedId = id;
      persist();
      render();
      editor.querySelector('[data-note-body-input]')?.focus();
    }
    app.querySelector('[data-note-new]').addEventListener('click', createNote);
    deleteButton.addEventListener('click', () => {
      notes = notes.filter(note => note.id !== selectedId);
      selectedId = notes[0]?.id || null;
      persist();
      render();
    });
    app.querySelector('[data-note-search]').addEventListener('input', event => { query = event.currentTarget.value.trim().toLowerCase(); render(); });
    list.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      const ids = Array.from(list.querySelectorAll('[data-note-id]')).map(item => item.dataset.noteId);
      if (!ids.length) return;
      event.preventDefault();
      const current = Math.max(0, ids.indexOf(selectedId));
      selectedId = ids[(current + (event.key === 'ArrowDown' ? 1 : -1) + ids.length) % ids.length];
      persist(); render();
      list.querySelector(`[data-note-id="${CSS.escape(selectedId)}"]`)?.focus();
    });
    render();
  }

  function setupFinder(win) {
    const app = win.querySelector('[data-finder]');
    if (!app) return;
    const items = app.querySelector('[data-finder-items]');
    const inspector = app.querySelector('[data-finder-inspector-panel]');
    const content = app.querySelector('[data-finder-inspector-content]');
    const sidebar = app.querySelector('[data-finder-sidebar-panel]');
    let selected = null;
    const setView = view => {
      items.classList.toggle('is-list', view === 'list');
      app.querySelectorAll('[data-finder-view]').forEach(control => control.classList.toggle('is-active', control.dataset.finderView === view));
    };
    app.querySelectorAll('[data-finder-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.finderView)));
    app.querySelector('[data-finder-sidebar]')?.addEventListener('click', () => { sidebar.hidden = !sidebar.hidden; app.classList.toggle('finder-sidebar-hidden', sidebar.hidden); });
    const toggleInspector = force => { inspector.hidden = typeof force === 'boolean' ? !force : !inspector.hidden; app.classList.toggle('finder-inspector-open', !inspector.hidden); };
    app.querySelector('[data-finder-inspector]')?.addEventListener('click', () => toggleInspector());
    app.querySelector('[data-finder-inspector-close]')?.addEventListener('click', () => toggleInspector(false));
    const inspectItem = item => {
      selected = item;
      app.querySelectorAll('[data-finder-item]').forEach(node => node.classList.toggle('is-selected', node === item));
      content.innerHTML = `<div class="finder-preview-icon">${item.querySelector('i').textContent}</div><h3>${escapeHTML(item.dataset.name)}</h3><dl><div><dt>Kind</dt><dd>${escapeHTML(item.dataset.type)}</dd></div><div><dt>Location</dt><dd>/Home</dd></div><div><dt>Description</dt><dd>${escapeHTML(item.dataset.meta)}</dd></div></dl><footer><button data-finder-close-inspector>Close</button><button data-finder-open-selected>Open</button></footer>`;
      content.querySelector('[data-finder-close-inspector]').addEventListener('click', () => toggleInspector(false));
      content.querySelector('[data-finder-open-selected]').addEventListener('click', () => openApp(item.dataset.launch));
    };
    app.querySelectorAll('[data-finder-item]').forEach(item => {
      item.addEventListener('click', event => { event.stopPropagation(); inspectItem(item); });
      item.addEventListener('dblclick', () => openApp(item.dataset.launch));
    });
    const context = createMenu('finder-context-menu');
    const showFinderMenu = (event, item) => {
      event.preventDefault(); event.stopPropagation();
      selected = item || null;
      context.innerHTML = item ? `<button data-finder-command="open">Open</button><button data-finder-command="info">Get Info</button><hr /><button data-finder-command="copy">Copy Name</button>` : `<button data-finder-command="grid"><span>View as Icons</span><b>${items.classList.contains('is-list') ? '' : '✓'}</b></button><button data-finder-command="list"><span>View as List</span><b>${items.classList.contains('is-list') ? '✓' : ''}</b></button>`;
      placeMenu(context, event.clientX, event.clientY);
    };
    app.querySelectorAll('[data-finder-item]').forEach(item => item.addEventListener('contextmenu', event => showFinderMenu(event, item)));
    app.querySelector('[data-finder-area]').addEventListener('contextmenu', event => { if (!event.target.closest('[data-finder-item]')) showFinderMenu(event, null); });
    context.addEventListener('click', async event => {
      const command = event.target.closest('[data-finder-command]')?.dataset.finderCommand;
      if (!command) return;
      if (command === 'open' && selected) openApp(selected.dataset.launch);
      if (command === 'info' && selected) { inspectItem(selected); toggleInspector(true); }
      if (command === 'copy' && selected) { try { await navigator.clipboard.writeText(selected.dataset.name); } catch { /* clipboard can be blocked on file URLs */ } }
      if (command === 'grid' || command === 'list') setView(command);
      context.hidden = true;
    });
  }

  function initWindowInteractions(win) {
    win.querySelectorAll('[data-window-action]').forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.windowAction;
      if (action === 'close') win.remove();
      if (action === 'minimize') win.hidden = true;
      if (action === 'maximize') win.classList.toggle('is-maximized');
    }));
    win.querySelectorAll('[data-launch]:not([data-finder-item])').forEach(button => button.addEventListener('click', () => openApp(button.dataset.launch)));
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
      const reply = document.createElement('article'); reply.innerHTML = `<b>Meridian Agent</b><p>${escapeHTML(`I received: “${message}” — this desktop keeps the interaction local and responsive.`)}</p>`;
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
    win.querySelectorAll('[data-preview-photo]').forEach(button => button.addEventListener('click', () => {
      win.querySelector('[data-preview-caption]').textContent = `PHOTO ${String(Number(button.dataset.previewPhoto) + 1).padStart(2, '0')} · Desktop archive`;
      win.querySelectorAll('[data-preview-photo]').forEach(item => item.classList.toggle('is-active', item === button));
    }));
    win.querySelector('[data-print-resume]')?.addEventListener('click', () => window.print());
    setupSettings(win);
    setupNotes(win);
    setupFinder(win);
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

  function createMenu(className) {
    const existing = root.querySelector(`.${className}`);
    if (existing) return existing;
    const menu = document.createElement('section');
    menu.className = `os-menu ${className}`;
    menu.hidden = true;
    menu.setAttribute('role', 'menu');
    root.append(menu);
    return menu;
  }

  function placeMenu(menu, x, y) {
    menu.hidden = false;
    menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - menu.offsetWidth - 8))}px`;
    menu.style.top = `${Math.max(42, Math.min(y, window.innerHeight - menu.offsetHeight - 8))}px`;
  }

  const wallpapers = {
    default: '',
    geometric: 'linear-gradient(132deg,#ff9a63 0 20%,#f5c5da 20% 42%,#7f52e5 42% 68%,#13b7de 68%)',
    fluid: 'radial-gradient(circle at 28% 24%,#ffe9ec 0 13%,transparent 34%),linear-gradient(145deg,#ff9663,#dc54cf 44%,#5b15da 74%,#05bfe2)',
    landscape: 'linear-gradient(180deg,#71a6d2 0 48%,#b8d1ba 48% 58%,#476f5d 58% 76%,#223b35 76%)',
    sky: 'radial-gradient(circle at 74% 18%,#fff8c2 0 4%,transparent 5%),linear-gradient(#7595c7,#e3b6ce 61%,#75658c)',
    galaxy: 'radial-gradient(circle at 68% 34%,#f2b4ff 0 4%,#7633ab 18%,transparent 43%),linear-gradient(135deg,#090d25,#241050 55%,#090c20)',
    nebula: 'radial-gradient(ellipse at 35% 60%,#08b2d7 0 7%,#7247c0 32%,transparent 61%),linear-gradient(120deg,#0c1024,#21054a)',
    minimal: 'linear-gradient(135deg,#d6e3ef,#9db6cf)',
    texture: 'repeating-linear-gradient(45deg,#aca18f 0 2px,#b9ad9b 2px 5px)',
    floral: 'radial-gradient(circle at 20% 30%,#ffc1cf 0 6%,transparent 7%),radial-gradient(circle at 70% 65%,#f5a7c7 0 8%,transparent 9%),linear-gradient(135deg,#c8dba5,#71936f)',
    retro: 'linear-gradient(180deg,#22184d 0 55%,#e860aa 56% 58%,#161245 59%),repeating-linear-gradient(90deg,transparent 0 60px,#3ef1e533 61px 62px)',
    archived: 'linear-gradient(135deg,#8b7666,#d0baa6 42%,#5d6d78)',
    none: '#9aa5b1',
  };
  let wallpaperTimer = 0;

  function setWallpaper(name) {
    window.clearInterval(wallpaperTimer);
    wallpaperTimer = 0;
    if (name === 'shuffle') {
      const names = Object.keys(wallpapers).filter(key => !['default', 'none'].includes(key));
      let index = Math.floor(Math.random() * names.length);
      setWallpaper(names[index]);
      wallpaperTimer = window.setInterval(() => { index = (index + 1) % names.length; setWallpaperVisual(names[index]); }, 12000);
      try { localStorage.setItem('atom63-wallpaper', 'shuffle'); } catch { /* optional persistence */ }
      return;
    }
    setWallpaperVisual(name);
    try { localStorage.setItem('atom63-wallpaper', name); } catch { /* optional persistence */ }
  }

  function setWallpaperVisual(name) {
    const layer = root.querySelector('.wallpaper');
    const isDefault = name === 'default' || !wallpapers[name];
    root.classList.toggle('has-custom-wallpaper', !isDefault);
    layer.style.setProperty('--custom-wallpaper', isDefault ? '' : wallpapers[name]);
    root.dataset.wallpaper = isDefault ? 'default' : name;
  }

  function desktopMenuMarkup() {
    const category = (label, description, entries) => `<div class="os-submenu-row"><button><span>${label}<small>${description}</small></span><b>›</b></button><div class="os-submenu">${entries.map(([name, value]) => `<button data-wallpaper="${value}">${name}</button>`).join('')}</div></div>`;
    return `<div class="os-submenu-row"><button><span>Add Widget</span><b>›</b></button><div class="os-submenu"><button data-widget-show="profile">Profile</button><button data-widget-show="local-time">Local Time</button></div></div><hr />
      <div class="os-submenu-row"><button><span>Change Wallpaper</span><b>›</b></button><div class="os-submenu wallpaper-menu"><button data-wallpaper="none">None</button><button data-wallpaper="shuffle">Shuffle</button><hr />
        ${category('Abstract','Geometric, fluid, and generative art',[['Geometric','geometric'],['Fluid','fluid']])}
        ${category('Nature','Landscapes, skies, and natural scenes',[['Landscape','landscape'],['Sky','sky']])}
        ${category('Space','Galaxies, nebulae, stars, and planets',[['Galaxy','galaxy'],['Nebula','nebula']])}
        ${category('Minimal','Clean surfaces and subtle gradients',[['Soft gradient','minimal']])}
        ${category('Texture','Materials, fabrics, surfaces, and macro detail',[['Woven','texture']])}
        ${category('Floral','Flowers, botanicals, and garden scenes',[['Botanical','floral']])}
        ${category('Retro','Vaporwave, pixel art, and early-web aesthetics',[['Vaporwave','retro']])}
        ${category('Archived','Legacy wallpapers from earlier versions',[['Meridian Classic','archived']])}
      </div></div><hr /><button data-desktop-dark><span>Dark Mode</span><b>${root.dataset.mode === 'dark' ? '✓' : ''}</b></button><hr /><button data-launch="settings">Settings</button><button data-desktop-refresh>Refresh</button>`;
  }

  function ensureRefreshDialog() {
    let dialog = root.querySelector('.refresh-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('section');
    dialog.className = 'refresh-dialog';
    dialog.hidden = true;
    dialog.innerHTML = `<div role="alertdialog" aria-modal="true" aria-labelledby="refresh-title"><span class="refresh-icon">↻</span><h2 id="refresh-title">Refresh Desktop</h2><p>This will reset Meridian OS desktop layout, window state, dock pins, and recent items. Host app data and personalization settings are left untouched.</p><footer><button data-refresh-cancel>Cancel</button><button data-refresh-confirm>Refresh</button></footer></div>`;
    root.append(dialog);
    dialog.querySelector('[data-refresh-cancel]').addEventListener('click', () => { dialog.hidden = true; });
    dialog.querySelector('[data-refresh-confirm]').addEventListener('click', () => {
      ['atom63-widget-positions', 'atom63-wallpaper', 'atom63-dock-hidden'].forEach(key => localStorage.removeItem(key));
      window.location.reload();
    });
    return dialog;
  }

  function setupDesktopContextMenu() {
    const menu = createMenu('desktop-context-menu');
    root.addEventListener('contextmenu', event => {
      if (event.target.closest('.app-window,.dock,.home-popover,.quick-settings,.refresh-dialog,.os-menu')) return;
      event.preventDefault();
      menu.innerHTML = desktopMenuMarkup();
      placeMenu(menu, event.clientX, event.clientY);
    });
    menu.addEventListener('click', event => {
      const action = event.target.closest('button');
      if (!action) return;
      if (action.dataset.wallpaper) setWallpaper(action.dataset.wallpaper);
      if (action.dataset.widgetShow) {
        const widget = root.querySelector(`[data-widget="${action.dataset.widgetShow}"]`);
        if (widget) widget.hidden = false;
      }
      if (action.dataset.launch) openApp(action.dataset.launch);
      if (action.hasAttribute('data-desktop-dark')) {
        const state = readAppearance();
        state.mode = root.dataset.mode === 'dark' ? 'light' : 'dark';
        writeJSON('atom63-appearance', state); applyAppearance(state);
      }
      if (action.hasAttribute('data-desktop-refresh')) ensureRefreshDialog().hidden = false;
      if (!action.closest('.os-submenu-row') || action.dataset.wallpaper || action.dataset.widgetShow) menu.hidden = true;
    });
    try { setWallpaper(localStorage.getItem('atom63-wallpaper') || 'default'); } catch { setWallpaper('default'); }
  }

  function setupWidgetDragging() {
    const stored = readJSON('atom63-widget-positions', {});
    root.querySelectorAll('[data-widget]').forEach(widget => {
      const id = widget.dataset.widget;
      if (stored[id]) widget.style.transform = `translate(${stored[id].x}px, ${stored[id].y}px)`;
      const handle = widget.querySelector('.widget-top');
      let drag = null;
      handle.addEventListener('pointerdown', event => {
        if (event.target.closest('button,a,input')) return;
        const point = stored[id] || { x: 0, y: 0 };
        drag = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, x: point.x, y: point.y };
        widget.classList.add('is-dragging');
        handle.setPointerCapture(event.pointerId);
      });
      handle.addEventListener('pointermove', event => {
        if (!drag || drag.pointer !== event.pointerId) return;
        const next = { x: drag.x + event.clientX - drag.startX, y: drag.y + event.clientY - drag.startY };
        widget.style.transform = `translate(${next.x}px, ${next.y}px)`;
        stored[id] = next;
      });
      const stop = event => {
        if (!drag || drag.pointer !== event.pointerId) return;
        drag = null; widget.classList.remove('is-dragging'); writeJSON('atom63-widget-positions', stored);
      };
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  }

  function setupDockContextMenu() {
    const menu = createMenu('dock-context-menu');
    let activeId = '';
    document.querySelectorAll('.dock [data-app]').forEach(button => button.addEventListener('contextmenu', event => {
      event.preventDefault(); event.stopPropagation(); activeId = button.dataset.app;
      const app = appDetails[activeId];
      const open = windows.querySelector(`[data-app-window="${activeId}"]`);
      menu.innerHTML = `<button data-dock-command="open">${open && !open.hidden ? 'Minimize' : 'Open'}</button><button data-dock-command="overview">Show All Windows</button><hr /><button data-dock-command="pin">Keep in Dock <b>✓</b></button><button data-dock-command="options">Options...</button>${open ? `<hr /><button data-dock-command="quit">Quit ${escapeHTML(app.title)}</button>` : ''}`;
      placeMenu(menu, event.clientX, event.clientY);
    }));
    menu.addEventListener('click', event => {
      const command = event.target.closest('[data-dock-command]')?.dataset.dockCommand;
      const win = windows.querySelector(`[data-app-window="${activeId}"]`);
      if (command === 'open') { if (win && !win.hidden) win.hidden = true; else openApp(activeId); }
      if (command === 'overview') root.classList.toggle('is-overview');
      if (command === 'options') openApp('settings');
      if (command === 'quit') win?.remove();
      menu.hidden = true;
    });
  }

  function setupActiveAppMenus() {
    const bar = document.getElementById('active-app-menu');
    const menu = createMenu('application-menu');
    bar.addEventListener('click', event => {
      const trigger = event.target.closest('[data-app-menu]');
      if (!trigger) return;
      const group = trigger.dataset.appMenu;
      const active = Array.from(windows.querySelectorAll('.app-window:not([hidden])')).sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex))[0];
      const id = active?.dataset.appWindow;
      if (!id) return;
      const disabled = label => `<button disabled>${label}</button>`;
      const common = {
        app: `<button data-app-command="about">About ${escapeHTML(appDetails[id].title)}</button><hr /><button data-app-command="settings">Settings...</button><hr /><button data-app-command="quit">Quit ${escapeHTML(appDetails[id].title)}</button>`,
        file: id === 'finder' ? `${disabled('New Folder')}<button data-app-command="open-selected" disabled>Open</button><hr />${disabled('Close ⌘W')}` : `<button data-app-command="close">Close ⌘W</button>`,
        edit: `${disabled('Undo ⌘Z')}${disabled('Redo ⇧⌘Z')}<hr />${disabled('Cut ⌘X')}${disabled('Copy ⌘C')}${disabled('Paste ⌘V')}${disabled('Select All ⌘A')}`,
        view: `<button data-app-command="finder-grid"><span>as Icons</span><b>✓</b></button><button data-app-command="finder-list">as List</button><hr /><button data-app-command="finder-sidebar">Show Sidebar ⌘S</button><button data-app-command="finder-inspector">Show Inspector ⌥⌘I</button>`,
        go: `<button data-app-command="finder-back">Back ⌘[</button><button data-app-command="finder-forward">Forward ⌘]</button><button data-app-command="finder-up">Enclosing Folder ⌘↑</button><hr /><button data-app-command="finder-home">Home ⇧⌘H</button><button data-app-command="finder-documents">Documents</button>`,
        window: `<button data-app-command="minimize">Minimize</button><button data-app-command="zoom">Zoom</button><hr /><button data-app-command="overview">Show All Windows</button>`,
        help: `<button data-app-command="help">Meridian OS Help</button>`,
      };
      menu.innerHTML = common[group] || common.help;
      const bounds = trigger.getBoundingClientRect();
      placeMenu(menu, bounds.left, bounds.bottom + 4);
    });
    menu.addEventListener('click', event => {
      const command = event.target.closest('[data-app-command]')?.dataset.appCommand;
      const active = Array.from(windows.querySelectorAll('.app-window:not([hidden])')).sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex))[0];
      if (!command || !active) return;
      const finder = active.querySelector('[data-finder]');
      if (command === 'about' || command === 'help') openApp('about-system');
      if (command === 'settings') openApp('settings');
      if (command === 'quit' || command === 'close') active.remove();
      if (command === 'minimize') active.hidden = true;
      if (command === 'zoom') active.classList.toggle('is-maximized');
      if (command === 'overview') root.classList.toggle('is-overview');
      if (command === 'finder-grid' || command === 'finder-list') finder?.querySelector(`[data-finder-view="${command.endsWith('grid') ? 'grid' : 'list'}"]`)?.click();
      if (command === 'finder-sidebar') finder?.querySelector('[data-finder-sidebar]')?.click();
      if (command === 'finder-inspector') finder?.querySelector('[data-finder-inspector]')?.click();
      if (command === 'finder-home' || command === 'finder-documents') {
        const path = finder?.querySelector('[data-finder-path]'); if (path) path.textContent = command === 'finder-home' ? '/Home' : '/Home/Documents';
      }
      menu.hidden = true;
    });
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
    document.addEventListener('click', event => {
      if (!event.target.closest('.quick-settings,.home-popover,.sliders-button,.home-button')) closePopovers();
      if (!event.target.closest('.os-menu,.active-app-menu')) document.querySelectorAll('.os-menu').forEach(menu => { menu.hidden = true; });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closePopovers(); document.querySelectorAll('.os-menu').forEach(menu => { menu.hidden = true; }); }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        const state = readAppearance(); state.debug = !state.debug; writeJSON('atom63-appearance', state); applyAppearance(state);
      }
    });
    setupDesktopContextMenu();
    setupWidgetDragging();
    setupDockContextMenu();
    setupActiveAppMenus();
  }

  loadPreferences(); applyAppearance(readAppearance()); bindControls(); updateClock(); window.setInterval(updateClock, 1000);
})();
