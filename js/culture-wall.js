/* ============================================================
   CULTURE WALL / SHOWROOM — project-specific interactions
   No pinning or artificial spacers: all motion follows real content.
   ============================================================ */

(() => {
  const root = document.body;
  if (!root.classList.contains('is-culture-wall')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = document.querySelector('.page');

  const FLOOR = {
    '6f': {
      title: '访客先理解公司，再进入业务现场',
      copy: '前厅、展厅、市场与荣誉墙组成外部参观主线；内容从“我们是谁”逐步进入“我们能解决什么问题”。',
      list: ['前台建立第一印象', '展厅集中呈现技术、产品与荣誉', '走廊把零散信息串成完整叙事'],
      image: '../assets/work/culture-wall/floorplan-6f.webp',
      alt: '六楼访客空间平面图',
      caption: '6F · 前厅与展厅是访客理解公司的入口',
      zoomTitle: '6F 访客空间平面图',
      zoomNote: '前台、展厅与办公空间的完整关系',
    },
    '5f': {
      title: '员工空间围绕研发、培训与日常协作展开',
      copy: '5F 的主要使用者是研发与内部团队。这里不复制访客叙事，而是让部门识别、培训沟通和员工日常拥有自己的内容节奏。',
      list: ['研发办公区承接部门身份', '会议与培训空间服务内部沟通', '低频展示点位服从日常使用效率'],
      image: '../assets/work/culture-wall/floorplan-5f.webp',
      alt: '五楼员工空间平面图',
      caption: '5F · 研发办公、会议培训与员工活动构成内部主线',
      zoomTitle: '5F 员工空间平面图',
      zoomNote: '研发办公、会议培训与公共区域的空间关系',
    },
  };

  const ZONE = {
    history: {
      index: '01 / 04',
      title: '技术历程先建立时间感',
      copy: '先让访客理解昂楷长期深耕数据安全，再进入具体产品，避免一上来就被专业术语挡住。',
    },
    product: {
      index: '02 / 04',
      title: '产品展示把能力变成可理解的对象',
      copy: '把抽象的产品体系放进清晰的观看层级，用实体陈列与屏幕内容承担不同信息密度。',
    },
    honor: {
      index: '03 / 04',
      title: '重要荣誉需要被分级，而不是堆满',
      copy: '代表性资质与关键节点被放在更高权重的位置，让信任证据能够在短暂停留中被看见。',
    },
    solution: {
      index: '04 / 04',
      title: '最后把技术能力带回客户问题',
      copy: '参观以解决方案和客户案例收束，让访客带着“它能解决什么”离开展厅。',
    },
  };

  const CRAFT = {
    detail: {
      title: '从弧度、尺度到基层结构都要落进图纸',
      copy: '双弧造型不是效果图中的装饰曲线。放样、收口、发光字与墙体关系，都要在施工前被确认。',
      image: '../assets/work/culture-wall/curve-detail.webp',
      alt: '双弧造型墙施工深化图',
      zoomTitle: '双弧形象墙深化图',
      zoomNote: '结构、尺寸与造型关系的施工证据',
    },
    showroom: {
      title: '有限预算优先保障展厅与入口的观看体验',
      copy: '灯箱、亚克力、发光字与电子屏集中在访客高频停留区；价值不足或与现场冲突的点位则主动取消。',
      image: '../assets/work/culture-wall/showroom-detail.webp',
      alt: '展厅重点区域施工深化图',
      zoomTitle: '展厅重点区域深化图',
      zoomNote: '客户案例、荣誉、产品陈列与电子屏的完整关系',
    },
  };

  function replaceText(target, value) {
    if (!target) return;
    if (!window.gsap || reduceMotion) {
      target.textContent = value;
      return;
    }
    gsap.to(target, {
      opacity: 0,
      y: 5,
      duration: .15,
      onComplete: () => {
        target.textContent = value;
        gsap.to(target, { opacity: 1, y: 0, duration: .25, ease: 'power2.out' });
      },
    });
  }

  function replaceImage(image, src, alt) {
    if (!image || image.getAttribute('src') === src) return;
    const apply = () => {
      image.src = src;
      image.alt = alt;
      image.onload = () => {
        if (window.gsap && !reduceMotion) gsap.to(image, { opacity: 1, scale: 1, duration: .42, ease: 'power2.out' });
        else image.style.opacity = '1';
        window.ScrollTrigger?.refresh();
      };
    };
    if (window.gsap && !reduceMotion) {
      gsap.to(image, { opacity: .16, scale: .992, duration: .18, ease: 'power1.in', onComplete: apply });
    } else {
      image.style.opacity = '.16';
      apply();
    }
  }

  function bindRovingTabs(buttons, activate) {
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(button));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        buttons[next].focus();
        activate(buttons[next]);
      });
    });
  }

  function initFloorSwitch() {
    const buttons = [...document.querySelectorAll('[data-cw-floor]')];
    const image = document.querySelector('[data-cw-floor-image]');
    const zoom = document.querySelector('[data-cw-floor-zoom]');
    const title = document.querySelector('[data-cw-floor-title]');
    const copy = document.querySelector('[data-cw-floor-copy]');
    const list = document.querySelector('[data-cw-floor-list]');
    const caption = document.querySelector('[data-cw-floor-caption]');
    if (!buttons.length || !image) return;

    const activate = button => {
      const data = FLOOR[button.dataset.cwFloor];
      if (!data || button.classList.contains('is-active')) return;
      buttons.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      replaceText(title, data.title);
      replaceText(copy, data.copy);
      if (list) {
        list.innerHTML = data.list.map(item => `<li>${item}</li>`).join('');
      }
      replaceText(caption, data.caption);
      replaceImage(image, data.image, data.alt);
      if (zoom) {
        zoom.dataset.zoom = data.image;
        zoom.dataset.zoomTitle = data.zoomTitle;
        zoom.dataset.zoomNote = data.zoomNote;
      }
    };
    bindRovingTabs(buttons, activate);
  }

  function initZoneSwitch() {
    const buttons = [...document.querySelectorAll('[data-cw-zone]')];
    const tabs = [...document.querySelectorAll('.cw-zone-tabs [data-cw-zone]')];
    const index = document.querySelector('[data-cw-zone-index]');
    const title = document.querySelector('[data-cw-zone-title]');
    const copy = document.querySelector('[data-cw-zone-copy]');
    if (!buttons.length) return;

    const activate = button => {
      const key = button.dataset.cwZone;
      const data = ZONE[key];
      if (!data) return;
      buttons.forEach(item => item.classList.toggle('is-active', item.dataset.cwZone === key));
      tabs.forEach(item => {
        const active = item.dataset.cwZone === key;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      replaceText(index, data.index);
      replaceText(title, data.title);
      replaceText(copy, data.copy);
    };
    buttons.forEach(button => button.addEventListener('click', () => activate(button)));
    bindRovingTabs(tabs, activate);
  }

  function initCraftSwitch() {
    const buttons = [...document.querySelectorAll('[data-cw-craft]')];
    const image = document.querySelector('[data-cw-craft-image]');
    const zoom = document.querySelector('[data-cw-craft-zoom]');
    const title = document.querySelector('[data-cw-craft-title]');
    const copy = document.querySelector('[data-cw-craft-copy]');
    if (!buttons.length || !image) return;

    const activate = button => {
      const data = CRAFT[button.dataset.cwCraft];
      if (!data || button.classList.contains('is-active')) return;
      buttons.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      replaceText(title, data.title);
      replaceText(copy, data.copy);
      replaceImage(image, data.image, data.alt);
      if (zoom) {
        zoom.dataset.zoom = data.image;
        zoom.dataset.zoomTitle = data.zoomTitle;
        zoom.dataset.zoomNote = data.zoomNote;
      }
    };
    bindRovingTabs(buttons, activate);
  }

  function initReveals() {
    if (!window.gsap || !window.ScrollTrigger || reduceMotion) return;
    const hero = [...document.querySelectorAll('.cw-hero > .cw-reveal')];
    gsap.fromTo(hero,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: .78, stagger: .12, ease: 'power2.out', clearProps: 'opacity,transform' });

    document.querySelectorAll('.cw-body .cw-reveal').forEach(item => {
      gsap.fromTo(item,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: .72,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
          scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        });
    });
  }

  function initProgress() {
    const bar = document.querySelector('[data-cw-progress]');
    const label = document.querySelector('[data-cw-current]');
    const sections = [...document.querySelectorAll('.cw-section')];
    if (!page || !bar || !label || !sections.length) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = Math.max(1, page.scrollHeight - page.clientHeight);
      const progress = Math.min(1, Math.max(0, page.scrollTop / max));
      const mobile = window.matchMedia('(max-width: 600px)').matches;
      bar.style.transform = mobile ? `scaleX(${progress})` : `scaleY(${progress})`;

      const marker = page.clientHeight * .42;
      let active = sections[0];
      sections.forEach(section => {
        if (section.getBoundingClientRect().top <= marker) active = section;
      });
      label.textContent = active.dataset.toc || '空间统筹';
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    page.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
  }

  initFloorSwitch();
  initZoneSwitch();
  initCraftSwitch();
  initReveals();
  initProgress();
})();
