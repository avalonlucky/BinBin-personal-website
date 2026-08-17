/* 产品单页案例：四幕式叙事交互 */
(function () {
  const story = document.querySelector('[data-ps-story]');
  if (!story) return;

  const scrollHost = document.querySelector('.page');
  const products = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sheetUrl = (product, side) => `../assets/work/ankki/sheet/${product.slug}-${side}.webp`;
  const thumbUrl = product => `../assets/work/ankki/thumb/${product.slug}-front.webp`;

  function showProductLightbox(index) {
    if (typeof openLightbox === 'function') openLightbox(index);
  }

  function initBeforeAfter() {
    const compare = story.querySelector('[data-ps-compare]');
    const range = compare?.querySelector('[data-ps-compare-range]');
    if (!compare || !range) return;

    const setSplit = value => compare.style.setProperty('--split', `${value}%`);
    range.addEventListener('input', () => setSplit(range.value));

    compare.querySelectorAll('[data-ps-ba-tab]').forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.dataset.psBaTab;
        compare.dataset.mode = mode;
        compare.querySelectorAll('[data-ps-ba-tab]').forEach(item => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
        });
      });
    });
  }

  function initInfoTip() {
    const button = story.querySelector('[data-ps-info]');
    const wrap = button?.closest('.ps-info-wrap');
    if (!button || !wrap) return;

    const setOpen = open => {
      wrap.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    };
    button.addEventListener('click', event => {
      event.stopPropagation();
      setOpen(!wrap.classList.contains('is-open'));
    });
    document.addEventListener('click', event => {
      if (!wrap.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function initColorSystem() {
    const lab = story.querySelector('[data-ps-system]');
    const list = lab?.querySelector('[data-ps-color-list]');
    const preview = lab?.querySelector('[data-ps-system-preview]');
    if (!lab || !list || !preview || !products.length) return;

    const image = preview.querySelector('img');
    const name = preview.querySelector('[data-ps-system-name]');
    const code = preview.querySelector('[data-ps-system-code]');
    let activeIndex = -1;
    let changeTimer = 0;

    const show = (index, animate = true) => {
      if (!products[index] || index === activeIndex) return;
      const product = products[index];
      activeIndex = index;
      window.clearTimeout(changeTimer);
      if (animate && !reducedMotion) preview.classList.add('is-changing');
      changeTimer = window.setTimeout(() => {
        image.src = sheetUrl(product, 'front');
        image.alt = `${product.name}单页正面`;
        name.textContent = product.name;
        code.textContent = `${product.code} · ${product.color.toUpperCase()}`;
        preview.style.setProperty('--product-color', product.color);
        requestAnimationFrame(() => preview.classList.remove('is-changing'));
      }, animate && !reducedMotion ? 120 : 0);
      list.querySelectorAll('.ps-color-item').forEach((button, buttonIndex) => {
        const active = buttonIndex === index;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };

    products.forEach((product, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ps-color-item';
      button.style.setProperty('--product-color', product.color);
      button.setAttribute('aria-pressed', String(index === 0));
      button.innerHTML = `<i></i><b>${product.name.replace(/^昂楷/, '')}</b><small>${product.code}</small>`;
      button.addEventListener('click', () => show(index));
      button.addEventListener('focus', () => show(index));
      list.appendChild(button);
    });

    const syncDesktop = () => {
      if (window.innerWidth <= 768) return;
      const labRect = lab.getBoundingClientRect();
      if (labRect.bottom < 0 || labRect.top > window.innerHeight) return;
      const target = window.innerHeight * .52;
      const buttons = [...list.children];
      const nearest = buttons.reduce((best, button, index) => {
        const distance = Math.abs(button.getBoundingClientRect().top + button.offsetHeight / 2 - target);
        return distance < best.distance ? { index, distance } : best;
      }, { index: activeIndex, distance: Infinity });
      show(nearest.index);
    };

    let railFrame = 0;
    list.addEventListener('scroll', () => {
      if (window.innerWidth > 768 || railFrame) return;
      railFrame = requestAnimationFrame(() => {
        railFrame = 0;
        const center = list.getBoundingClientRect().left + list.clientWidth / 2;
        const buttons = [...list.children];
        const nearest = buttons.reduce((best, button, index) => {
          const rect = button.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - center);
          return distance < best.distance ? { index, distance } : best;
        }, { index: activeIndex, distance: Infinity });
        show(nearest.index);
      });
    }, { passive: true });

    let scrollFrame = 0;
    scrollHost?.addEventListener('scroll', () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        syncDesktop();
      });
    }, { passive: true });

    preview.addEventListener('click', () => showProductLightbox(activeIndex));
    show(0, false);
  }

  function initScrollFlip() {
    const section = story.querySelector('[data-ps-flip-story]');
    const card = section?.querySelector('[data-ps-scroll-flip]');
    const steps = [...(section?.querySelectorAll('[data-ps-flip-side]') || [])];
    if (!section || !card || steps.length < 2) return;

    let side = 'front';
    const setSide = next => {
      side = next;
      const back = next === 'back';
      card.classList.toggle('is-back', back);
      card.setAttribute('aria-pressed', String(back));
      steps.forEach(step => step.classList.toggle('is-active', step.dataset.psFlipSide === next));
    };

    card.addEventListener('click', () => setSide(side === 'front' ? 'back' : 'front'));

    if (typeof ScrollTrigger !== 'undefined') {
      steps.forEach(step => {
        const next = step.dataset.psFlipSide;
        ScrollTrigger.create({
          trigger: step,
          start: 'top 58%',
          end: 'bottom 42%',
          onEnter: () => setSide(next),
          onEnterBack: () => setSide(next),
        });
      });
    }
    setSide('front');
  }

  function initArchive() {
    const wall = story.querySelector('[data-ps-archive-wall]');
    if (!wall || !products.length) return;

    let cursor = 0;
    [4, 4, 5].forEach(count => {
      const row = document.createElement('div');
      row.className = 'ps-archive-row';
      products.slice(cursor, cursor + count).forEach(product => {
        const index = products.indexOf(product);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ps-archive-sheet';
        button.setAttribute('aria-label', `放大查看${product.name}`);
        button.innerHTML = `<img src="${thumbUrl(product)}" alt="${product.name}单页正面" width="420" height="543" loading="lazy" decoding="async">`;
        button.addEventListener('click', () => showProductLightbox(index));
        row.appendChild(button);
      });
      cursor += count;
      wall.appendChild(row);
    });
  }

  function initTimelineDrag() {
    const timeline = story.querySelector('[data-hscroll="desktop"]');
    if (!timeline) return;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    timeline.addEventListener('pointerdown', event => {
      if (window.innerWidth <= 768 || event.target.closest('button, a')) return;
      dragging = true;
      startX = event.clientX;
      startScroll = timeline.scrollLeft;
      timeline.setPointerCapture(event.pointerId);
      timeline.classList.add('is-dragging');
    });
    timeline.addEventListener('pointermove', event => {
      if (!dragging) return;
      timeline.scrollLeft = startScroll - (event.clientX - startX);
    });
    const stop = () => {
      dragging = false;
      timeline.classList.remove('is-dragging');
    };
    timeline.addEventListener('pointerup', stop);
    timeline.addEventListener('pointercancel', stop);
  }

  function initProgress() {
    const bar = story.querySelector('[data-ps-progress-bar]');
    const label = story.querySelector('[data-ps-current]');
    const chapters = [...story.querySelectorAll('[data-ps-section]')];
    if (!bar || !label || !chapters.length || !scrollHost) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const hostRect = scrollHost.getBoundingClientRect();
      const storyRect = story.getBoundingClientRect();
      const total = Math.max(1, story.offsetHeight - scrollHost.clientHeight);
      const passed = Math.min(total, Math.max(0, hostRect.top - storyRect.top));
      bar.style.transform = `scaleX(${(passed / total).toFixed(4)})`;

      const readingLine = hostRect.top + scrollHost.clientHeight * .38;
      let active = chapters[0];
      chapters.forEach(chapter => {
        if (chapter.getBoundingClientRect().top <= readingLine) active = chapter;
      });
      const number = active.querySelector('.cs-num')?.textContent.split('—')[0].trim() || '';
      label.textContent = `${number} · ${active.dataset.toc || ''}`;
      label.classList.toggle('is-dark', active.dataset.navTheme === 'dark');
    };

    scrollHost.addEventListener('scroll', () => {
      if (!frame) frame = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  initBeforeAfter();
  initInfoTip();
  initColorSystem();
  initScrollFlip();
  initArchive();
  initTimelineDrag();
  initProgress();

  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });
})();
