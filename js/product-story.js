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

    const focus = document.createElement('div');
    focus.className = 'ps-archive-focus';
    focus.hidden = true;
    focus.setAttribute('aria-live', 'polite');
    focus.innerHTML = `
      <button class="ps-archive-focus-card" type="button">
        <img alt="" width="2611" height="3378" decoding="async">
      </button>
      <div class="ps-archive-focus-controls">
        <strong data-archive-name></strong>
        <button type="button" data-archive-flip>看背面</button>
        <button type="button" data-archive-return>放回展位</button>
      </div>`;
    wall.appendChild(focus);

    const focusCard = focus.querySelector('.ps-archive-focus-card');
    const focusImage = focus.querySelector('img');
    const focusName = focus.querySelector('[data-archive-name]');
    const flipButton = focus.querySelector('[data-archive-flip]');
    const returnButton = focus.querySelector('[data-archive-return]');
    let selectedIndex = -1;
    let sourceButton = null;
    let side = 'front';
    let busy = false;

    const clearFocusTransform = () => {
      focus.style.removeProperty('transform');
      focus.style.removeProperty('will-change');
    };

    const placeFocus = animate => {
      if (selectedIndex < 0 || !sourceButton || focus.hidden) return;
      const wallRect = wall.getBoundingClientRect();
      const sourceRect = sourceButton.getBoundingClientRect();
      const mobile = window.innerWidth <= 768;
      const aspect = 2611 / 3378;
      let height = Math.min(
        window.innerHeight * (mobile ? .54 : .62),
        wall.clientHeight * (mobile ? .64 : .58),
        mobile ? 460 : 620,
      );
      let width = height * aspect;
      const maxWidth = Math.min(
        window.innerWidth * (mobile ? .8 : .38),
        wall.clientWidth * (mobile ? .82 : .42),
      );
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspect;
      }

      const controlsRoom = mobile ? 76 : 66;
      const viewportCenter = window.innerHeight * .5 - wallRect.top;
      const maxTop = Math.max(18, wall.clientHeight - height - controlsRoom - 20);
      const top = Math.min(maxTop, Math.max(20, viewportCenter - height / 2));
      const left = (wall.clientWidth - width) / 2;

      focus.style.left = `${left}px`;
      focus.style.top = `${top}px`;
      focus.style.width = `${width}px`;
      focus.style.height = `${height}px`;

      const targetRect = focus.getBoundingClientRect();
      const dx = sourceRect.left + sourceRect.width / 2 - (targetRect.left + targetRect.width / 2);
      const dy = sourceRect.top + sourceRect.height / 2 - (targetRect.top + targetRect.height / 2);
      const scale = sourceRect.height / targetRect.height;

      if (!animate || reducedMotion || typeof gsap === 'undefined') {
        clearFocusTransform();
        busy = false;
        return;
      }

      focus.style.willChange = 'transform';
      gsap.killTweensOf(focus);
      gsap.fromTo(focus, { x: dx, y: dy, scale }, {
        x: 0,
        y: 0,
        scale: 1,
        duration: .62,
        ease: 'power3.inOut',
        onComplete: () => {
          clearFocusTransform();
          busy = false;
        },
      });
    };

    const setSide = next => {
      if (selectedIndex < 0) return;
      side = next;
      const product = products[selectedIndex];
      focusImage.src = sheetUrl(product, side);
      focusImage.alt = `${product.name}单页${side === 'front' ? '正面' : '背面'}`;
      flipButton.textContent = side === 'front' ? '看背面' : '看正面';
    };

    const returnToWall = () => {
      if (selectedIndex < 0 || !sourceButton || busy) return;
      const targetButton = sourceButton;
      const slot = targetButton.closest('.ps-archive-slot');
      const focusRect = focus.getBoundingClientRect();
      const targetRect = targetButton.getBoundingClientRect();

      const finish = () => {
        focus.hidden = true;
        clearFocusTransform();
        wall.classList.remove('is-focused');
        slot?.classList.remove('is-empty');
        targetButton.classList.remove('is-away');
        selectedIndex = -1;
        sourceButton = null;
        side = 'front';
        busy = false;
        targetButton.focus({ preventScroll: true });
      };

      if (reducedMotion || typeof gsap === 'undefined') {
        finish();
        return;
      }

      busy = true;
      focus.style.willChange = 'transform';
      gsap.killTweensOf(focus);
      gsap.to(focus, {
        x: targetRect.left + targetRect.width / 2 - (focusRect.left + focusRect.width / 2),
        y: targetRect.top + targetRect.height / 2 - (focusRect.top + focusRect.height / 2),
        scale: targetRect.height / focusRect.height,
        duration: .5,
        ease: 'power3.inOut',
        onComplete: finish,
      });
    };

    const selectProduct = (button, index) => {
      if (busy || selectedIndex >= 0) return;
      const product = products[index];
      selectedIndex = index;
      sourceButton = button;
      side = 'front';
      busy = true;

      button.classList.add('is-away');
      button.closest('.ps-archive-slot')?.classList.add('is-empty');
      wall.classList.add('is-focused');
      focus.hidden = false;
      focusName.textContent = product.name;
      focusCard.setAttribute('aria-label', `将${product.name}放回展位`);
      focusImage.src = thumbUrl(product);
      focusImage.alt = `${product.name}单页正面`;
      flipButton.textContent = '看背面';

      const highResolution = new Image();
      highResolution.src = sheetUrl(product, 'front');
      highResolution.onload = () => {
        if (selectedIndex === index && side === 'front') focusImage.src = highResolution.src;
      };

      requestAnimationFrame(() => placeFocus(true));
    };

    let cursor = 0;
    [4, 4, 5].forEach(count => {
      const row = document.createElement('div');
      row.className = 'ps-archive-row';
      products.slice(cursor, cursor + count).forEach(product => {
        const index = products.indexOf(product);
        const slot = document.createElement('article');
        slot.className = 'ps-archive-slot';
        const acrylic = document.createElement('div');
        acrylic.className = 'ps-archive-acrylic';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ps-archive-sheet';
        button.setAttribute('aria-label', `从展墙查看${product.name}`);
        button.innerHTML = `<img src="${thumbUrl(product)}" alt="${product.name}单页正面" width="420" height="543" loading="lazy" decoding="async">`;
        button.addEventListener('click', () => selectProduct(button, index));
        const emptyButton = document.createElement('button');
        emptyButton.type = 'button';
        emptyButton.className = 'ps-archive-empty';
        emptyButton.setAttribute('aria-label', `将${product.name}放回展位`);
        emptyButton.textContent = '+';
        emptyButton.addEventListener('click', returnToWall);
        acrylic.appendChild(button);
        acrylic.appendChild(emptyButton);
        slot.appendChild(acrylic);
        row.appendChild(slot);
      });
      cursor += count;
      wall.appendChild(row);
    });

    focusCard.addEventListener('click', returnToWall);
    returnButton.addEventListener('click', returnToWall);
    flipButton.addEventListener('click', () => setSide(side === 'front' ? 'back' : 'front'));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && selectedIndex >= 0) returnToWall();
    });
    window.addEventListener('resize', () => placeFocus(false));
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
