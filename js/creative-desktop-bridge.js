(() => {
  const desktop = document.querySelector('[data-desktop]');
  const iconGrid = document.querySelector('.os-icons');
  const icons = [...document.querySelectorAll('.os-icons .os-icon[data-open]')];
  const isCoarsePointer = matchMedia('(pointer: coarse)').matches;
  const modalByApp = {
    works: 'caseHubModal',
    notes: 'stickiesModal',
    about: 'collectionModal',
    archive: 'previewModal',
    notebook: 'notebookModal',
    chess: 'chessModal',
    toolkit: 'pk01Modal',
    photos: 'collectionModal'
  };
  const dragHandles = '.cm-head,.pv-head,.nb-titlebar,.chm-bar,.ch-head,.cs-header,#stickiesHeader,#pk01Card > div:first-child';
  let selected = null;
  let topZ = 100;
  let cascade = 0;

  if (desktop) desktop.hidden = false;

  function frameFor(modal) {
    return modal?.firstElementChild || null;
  }

  function focusWindow(modal) {
    const frame = frameFor(modal);
    if (!frame) return;
    topZ += 1;
    modal.style.zIndex = String(topZ);
  }

  function placeWindow(modal) {
    const frame = frameFor(modal);
    if (!frame || innerWidth <= 720) return;
    const rect = frame.getBoundingClientRect();
    const offset = (cascade++ % 5) * 20;
    const left = Math.max(18, Math.min(innerWidth - rect.width - 18, (innerWidth - rect.width) / 2 + offset));
    const top = Math.max(46, Math.min(innerHeight - rect.height - 18, (innerHeight - rect.height) / 2 + offset));
    frame.style.left = `${left}px`;
    frame.style.top = `${top}px`;
    frame.style.right = 'auto';
    frame.style.bottom = 'auto';
  }

  function makeDraggable(modal) {
    if (!modal || modal.dataset.dragReady || isCoarsePointer) return;
    const frame = frameFor(modal);
    if (!frame) return;
    const handles = [...frame.querySelectorAll(dragHandles)];
    handles.forEach(handle => {
      handle.style.touchAction = 'none';
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('button,a,input,textarea,select')) return;
        focusWindow(modal);
        const rect = frame.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        handle.setPointerCapture(event.pointerId);
        const move = moveEvent => {
          const nextLeft = Math.max(0, Math.min(innerWidth - 80, rect.left + moveEvent.clientX - startX));
          const nextTop = Math.max(32, Math.min(innerHeight - 48, rect.top + moveEvent.clientY - startY));
          frame.style.left = `${nextLeft}px`;
          frame.style.top = `${nextTop}px`;
          frame.style.right = 'auto';
          frame.style.bottom = 'auto';
        };
        const end = () => {
          handle.removeEventListener('pointermove', move);
          handle.removeEventListener('pointerup', end);
          handle.removeEventListener('pointercancel', end);
        };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', end);
        handle.addEventListener('pointercancel', end);
      });
    });
    frame.addEventListener('pointerdown', () => focusWindow(modal));
    modal.dataset.dragReady = 'true';
  }

  function activate(icon) {
    if (!icon) return;
    selected?.classList.remove('is-selected');
    selected = icon;
    icon.classList.add('is-selected');
    const app = icon.dataset.open;
    window.__openApp?.(app);
    requestAnimationFrame(() => {
      const modal = document.getElementById(modalByApp[app]);
      if (!modal) return;
      placeWindow(modal);
      makeDraggable(modal);
      focusWindow(modal);
    });
  }

  icons.forEach(icon => {
    icon.addEventListener('click', () => activate(icon));
    icon.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(icon);
      }
    });
  });

  iconGrid?.addEventListener('pointerdown', event => event.stopPropagation());

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = [...document.querySelectorAll('.app-modal.open,.case-writeup.open')]
      .sort((a, b) => Number(a.style.zIndex || 0) - Number(b.style.zIndex || 0))
      .pop();
    if (!open) return;
    open.classList.remove('open');
    open.style.display = 'none';
    if (open.id === 'pk01Modal') window.__closeSynth?.();
  });

  window.addEventListener('resize', () => {
    if (innerWidth <= 720) return;
    document.querySelectorAll('.app-modal.open').forEach(modal => {
      const frame = frameFor(modal);
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      if (rect.right > innerWidth || rect.bottom > innerHeight || rect.left < 0 || rect.top < 32) placeWindow(modal);
    });
  });
})();
