(() => {
  const root = document.querySelector('.cs-hall');
  if (!root) return;

  const ART_ASPECT = 2611 / 3378;
  const EASE = 'power3.inOut';
  const wall = root.querySelector('.hall-wall');
  const hall = root.querySelector('.hall');
  const sheets = [...root.querySelectorAll('.hall-sheet')];
  const slots = [...root.querySelectorAll('.hall-slot')];
  const scroller = document.querySelector('.page');
  const mobileMedia = window.matchMedia('(max-width: 700px)');
  let selected = null;
  let busy = false;
  let focusedSide = 'front';
  let focusWrap = null;
  let focusArt = null;
  let hintEl = null;
  let returnFocus = null;

  const reduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const highSource = (sheet, side = 'front') => {
    const front = sheet.dataset.src;
    return side === 'back'
      ? sheet.dataset.back || front.replace(/-front\.webp(?:\?.*)?$/, '-back.webp')
      : front;
  };

  const loadHi = (src, onReady) => {
    const image = new Image();
    let complete = false;
    const ready = () => {
      if (complete) return;
      complete = true;
      onReady(src);
    };
    image.onload = ready;
    image.src = src;
    if (image.complete) ready();
  };

  const swapImage = (image, src, alt, valid, animate = true) => {
    loadHi(src, (readySrc) => {
      if (!valid()) return;
      const apply = () => {
        image.src = readySrc;
        image.alt = alt;
      };
      if (!window.gsap || reduced() || !animate) {
        apply();
        return;
      }
      gsap.to(image, {
        opacity: 0.3,
        y: 5,
        scale: 0.988,
        duration: 0.14,
        ease: 'power2.in',
        onComplete: () => {
          apply();
          gsap.to(image, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        },
      });
    });
  };

  const clearFocus = () => {
    const shouldRestoreFocus = focusWrap?.contains(document.activeElement);
    if (focusArt && window.gsap) gsap.killTweensOf(focusArt);
    focusWrap?.remove();
    hintEl?.remove();
    focusWrap = null;
    focusArt = null;
    hintEl = null;
    slots.forEach((slot) => slot.classList.remove('is-empty'));
    root.querySelectorAll('.hall-empty').forEach((element) => element.remove());
    sheets.forEach((sheet) => {
      sheet.classList.remove('is-away');
      sheet.tabIndex = 0;
    });
    root.classList.remove('is-focused');
    selected = null;
    focusedSide = 'front';
    busy = false;
    if (shouldRestoreFocus) returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
  };

  const placeFocus = (index, animate) => {
    const sheet = sheets[index];
    if (!sheet || !wall || !focusWrap || !focusArt) return;
    const wallBox = wall.getBoundingClientRect();
    const from = sheet.getBoundingClientRect();
    let height = Math.min(window.innerHeight * 0.48, 460);
    let width = height * ART_ASPECT;
    const maxW = Math.min(window.innerWidth * 0.36, wallBox.width * 0.42);
    if (width > maxW) {
      width = maxW;
      height = width / ART_ASPECT;
    }

    const infoSpace = 60;
    const preferredTop = wallBox.height * 0.46 - height / 2;
    const top = Math.max(18, Math.min(preferredTop, wallBox.height - height - infoSpace - 18));
    focusWrap.style.left = `${wallBox.width / 2 - width / 2}px`;
    focusWrap.style.top = `${top}px`;
    focusWrap.style.width = `${width}px`;
    focusArt.style.height = `${height}px`;

    if (!window.gsap || !animate || reduced()) {
      busy = false;
      return;
    }

    const to = focusArt.getBoundingClientRect();
    gsap.fromTo(
      focusArt,
      {
        x: from.left + from.width / 2 - (to.left + to.width / 2),
        y: from.top + from.height / 2 - (to.top + to.height / 2),
        scale: from.height / to.height,
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.62,
        ease: EASE,
        onComplete: () => {
          busy = false;
          focusArt?.focus({ preventScroll: true });
        },
      },
    );
  };

  const setFocusedSide = (side) => {
    if (selected === null || !focusWrap || !focusArt || side === focusedSide) return;
    focusedSide = side;
    const sheet = sheets[selected];
    const title = sheet.dataset.title;
    focusWrap.querySelectorAll('[data-hall-side]').forEach((button) => {
      const active = button.dataset.hallSide === side;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    swapImage(
      focusArt.querySelector('img'),
      highSource(sheet, side),
      `${title}单页${side === 'front' ? '正面' : '背面'}`,
      () => selected !== null && focusedSide === side,
    );
  };

  const returnWork = () => {
    if (selected === null || busy) return;
    const sheet = sheets[selected];
    if (!focusArt || !sheet || !window.gsap || reduced()) {
      clearFocus();
      return;
    }
    busy = true;
    const from = focusArt.getBoundingClientRect();
    const destination = sheet.getBoundingClientRect();
    gsap.to(focusWrap.querySelector('.hall-focus-meta'), {
      opacity: 0,
      y: -4,
      duration: 0.16,
      ease: 'power2.in',
    });
    gsap.to(focusArt, {
      x: destination.left + destination.width / 2 - (from.left + from.width / 2),
      y: destination.top + destination.height / 2 - (from.top + from.height / 2),
      scale: destination.height / from.height,
      duration: 0.52,
      ease: EASE,
      onComplete: clearFocus,
    });
  };

  const selectWork = (index) => {
    if (mobileMedia.matches || busy) return;
    if (selected === index) {
      returnWork();
      return;
    }
    if (selected !== null) return;

    busy = true;
    selected = index;
    focusedSide = 'front';
    const work = sheets[index];
    const slot = slots[index];
    const title = work.dataset.title;
    const code = work.dataset.code || `${String(index + 1).padStart(2, '0')} / 13`;
    returnFocus = work;

    root.classList.add('is-focused');
    root.style.setProperty('--hall-active', work.dataset.color || '#6ec8f5');
    slot.classList.add('is-empty');
    work.classList.add('is-away');
    work.tabIndex = -1;

    const empty = document.createElement('button');
    empty.type = 'button';
    empty.className = 'hall-empty';
    empty.setAttribute('aria-label', `将${title}放回展位`);
    empty.innerHTML = '<i>+</i>';
    empty.addEventListener('click', (event) => {
      event.stopPropagation();
      returnWork();
    });
    slot.querySelector('.hall-acrylic').append(empty);

    focusWrap = document.createElement('div');
    focusWrap.className = 'hall-focus-wrap';
    focusWrap.innerHTML = `
      <button type="button" class="hall-focus" aria-label="归档${title}">
        <img src="${work.querySelector('img').src}" alt="${title}单页正面" width="1400" height="1811" draggable="false">
      </button>
      <div class="hall-focus-meta">
        <p><strong>${title}</strong><span>${code}</span></p>
        <div class="hall-side-switch" aria-label="切换单页正反面">
          <button type="button" class="is-active" data-hall-side="front" aria-pressed="true">正面</button>
          <button type="button" data-hall-side="back" aria-pressed="false">背面</button>
        </div>
      </div>`;
    focusWrap.addEventListener('click', (event) => event.stopPropagation());
    focusArt = focusWrap.querySelector('.hall-focus');
    focusArt.addEventListener('click', returnWork);
    focusWrap.querySelectorAll('[data-hall-side]').forEach((button) => {
      button.addEventListener('click', () => setFocusedSide(button.dataset.hallSide));
    });
    wall.append(focusWrap);

    hintEl = document.createElement('p');
    hintEl.className = 'hall-hint';
    hintEl.innerHTML = '<i></i>点击任意处归档';
    wall.append(hintEl);

    swapImage(
      focusArt.querySelector('img'),
      highSource(work),
      `${title}单页正面`,
      () => selected === index && focusedSide === 'front',
      false,
    );
    requestAnimationFrame(() => placeFocus(index, true));
  };

  const createMobileExhibition = () => {
    const mobile = document.createElement('div');
    mobile.className = 'hall-mobile';
    mobile.innerHTML = `
      <div class="hall-mobile-stage" aria-live="polite">
        <button type="button" class="hall-mobile-art" aria-label="切换单页背面">
          <img src="${sheets[0].querySelector('img').src}" alt="${sheets[0].dataset.title}单页正面" width="1400" height="1811" draggable="false">
        </button>
        <div class="hall-mobile-meta">
          <p><span data-mobile-count>01 / 13</span><strong data-mobile-title>${sheets[0].dataset.title}</strong><small data-mobile-code>${sheets[0].dataset.code}</small></p>
          <div class="hall-side-switch" aria-label="切换单页正反面">
            <button type="button" class="is-active" data-mobile-side="front" aria-pressed="true">正面</button>
            <button type="button" data-mobile-side="back" aria-pressed="false">背面</button>
          </div>
        </div>
      </div>
      <ol class="hall-mobile-index"></ol>`;
    hall.append(mobile);

    const indexList = mobile.querySelector('.hall-mobile-index');
    sheets.forEach((sheet, index) => {
      const item = document.createElement('li');
      item.innerHTML = `
        <button type="button" class="hall-mobile-step" data-mobile-index="${index}" style="--product-color:${sheet.dataset.color || '#6ec8f5'}">
          <i>${String(index + 1).padStart(2, '0')}</i>
          <span>${sheet.dataset.title}</span>
          <small>${sheet.dataset.code || ''}</small>
        </button>`;
      indexList.append(item);
    });

    const stageImage = mobile.querySelector('.hall-mobile-art img');
    const artButton = mobile.querySelector('.hall-mobile-art');
    const count = mobile.querySelector('[data-mobile-count]');
    const title = mobile.querySelector('[data-mobile-title]');
    const code = mobile.querySelector('[data-mobile-code]');
    const steps = [...mobile.querySelectorAll('[data-mobile-index]')];
    const sideButtons = [...mobile.querySelectorAll('[data-mobile-side]')];
    let mobileIndex = 0;
    let mobileSide = 'front';
    let mobileToken = '';
    let scrollFrame = 0;

    const setMobileSide = (side, animate = true) => {
      if (side === mobileSide && stageImage.src.includes(highSource(sheets[mobileIndex], side).split('/').pop())) return;
      mobileSide = side;
      const sheet = sheets[mobileIndex];
      const token = `${mobileIndex}:${side}`;
      mobileToken = token;
      sideButtons.forEach((button) => {
        const active = button.dataset.mobileSide === side;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      artButton.setAttribute('aria-label', `切换到${side === 'front' ? '背面' : '正面'}`);
      swapImage(
        stageImage,
        highSource(sheet, side),
        `${sheet.dataset.title}单页${side === 'front' ? '正面' : '背面'}`,
        () => mobileToken === token,
        animate,
      );
    };

    const setMobileWork = (index, animate = true) => {
      if (!sheets[index]) return;
      mobileIndex = index;
      mobileSide = 'front';
      const sheet = sheets[index];
      root.style.setProperty('--hall-active', sheet.dataset.color || '#6ec8f5');
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${sheets.length}`;
      title.textContent = sheet.dataset.title;
      code.textContent = sheet.dataset.code || '';
      steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index));
      setMobileSide('front', animate);
    };

    const updateFromScroll = () => {
      scrollFrame = 0;
      if (!mobileMedia.matches) return;
      const viewport = scroller?.getBoundingClientRect();
      const targetY = (viewport?.top || 0) + (viewport?.height || window.innerHeight) * 0.72;
      let closest = 0;
      let distance = Infinity;
      steps.forEach((step, index) => {
        const box = step.getBoundingClientRect();
        const nextDistance = Math.abs(box.top + box.height / 2 - targetY);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = index;
        }
      });
      if (closest !== mobileIndex) setMobileWork(closest);
    };

    const scheduleUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(updateFromScroll);
    };

    steps.forEach((step, index) => {
      step.addEventListener('click', () => setMobileWork(index));
    });
    sideButtons.forEach((button) => {
      button.addEventListener('click', () => setMobileSide(button.dataset.mobileSide));
    });
    artButton.addEventListener('click', () => {
      setMobileSide(mobileSide === 'front' ? 'back' : 'front');
    });
    scroller?.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    mobileMedia.addEventListener('change', () => {
      if (mobileMedia.matches) {
        setMobileWork(mobileIndex, false);
        scheduleUpdate();
      }
    });
    setMobileWork(0, false);
    scheduleUpdate();
  };

  const initEntrance = () => {
    if (!window.gsap || !window.ScrollTrigger || reduced()) return;
    const media = gsap.matchMedia();
    media.add('(min-width: 701px)', () => {
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top 84%',
        once: true,
        onEnter: () => {
          gsap.fromTo(root.querySelectorAll('.hall-title > *'), {
            opacity: 0.35,
            y: 10,
          }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
          });
          gsap.fromTo(root.querySelectorAll('.hall-shelf'), {
            scaleX: 0,
          }, {
            scaleX: 1,
            duration: 0.72,
            stagger: 0.08,
            transformOrigin: 'left center',
            ease: 'power3.out',
          });
          gsap.fromTo(sheets, {
            opacity: 0.34,
            y: 14,
            scale: 0.97,
          }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.56,
            stagger: 0.045,
            ease: 'power2.out',
          });
        },
      });
      return () => trigger.kill();
    });
  };

  sheets.forEach((sheet, index) => {
    sheet.addEventListener('click', (event) => {
      event.stopPropagation();
      selectWork(index);
    });
  });

  document.addEventListener('click', () => {
    if (selected !== null) returnWork();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') returnWork();
  });
  window.addEventListener('resize', () => {
    if (selected !== null && !mobileMedia.matches) placeFocus(selected, false);
    if (selected !== null && mobileMedia.matches) clearFocus();
  });

  createMobileExhibition();
  initEntrance();
})();
