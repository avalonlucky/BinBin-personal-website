(function () {
  const nav = document.getElementById('nav');
  const navLinks = Array.from(nav?.querySelectorAll('.nav-links > a') || []);
  const workLink = navLinks.find(link => link.textContent.trim() === 'Work');
  const productLink = navLinks.find(link => link.textContent.trim() === 'Product');
  if (!nav || !workLink || nav.querySelector('.nav-work')) return;

  const fromWork = /\/work\//.test(window.location.pathname);
  const root = fromWork ? '../' : '';
  const menus = [
    {
      link: workLink,
      title: '精选作品',
      label: 'Selected work · 05',
      layout: 'work',
      projects: [
        { num: '01', title: '十三款产品的视觉营销语言', meta: '产品视觉系统', href: 'work/ankki-product-sheets.html', image: 'assets/work/ankki/card-product-sheets-2026.webp' },
        { num: '02', title: '从零建立企业内刊设计体系', meta: '内刊设计', href: 'work/ankki-vision-journal.html', image: 'assets/work/vision/card-vision-2026.webp' },
        { num: '03', title: '把办公室编成有次序的参观', meta: '文化墙展厅', href: 'work/ankki-culture-wall.html', image: 'assets/work/culture-wall/card-culture-wall.webp?v=2', featured: true },
        { num: '04', title: '从预热到收官的视觉体系', meta: '线上发布会', href: 'work/ankki-livestream-launch.html', image: 'assets/work/livestream/live-scene.png' },
        { num: '05', title: '国家级特装展，从筹备到落地', meta: 'DMHC 特装展', href: 'work/ankki-dmhc-exhibition.html', image: 'assets/work/dmhc/hero.webp', featured: true }
      ]
    },
    ...(productLink ? [{
      link: productLink,
      title: '产品实践',
      label: 'Products · 03',
      layout: 'product',
      projects: [
        { num: '01', title: 'Giverny', meta: '设计协作与 AI 质检', href: 'https://mayeai.com', image: 'assets/products/giverny.webp' },
        { num: '02', title: '粿条 AI', meta: 'AI 学习与内容实践', href: 'https://www.guotiaoai.com', image: 'assets/products/guotiao-ai.webp' },
        { num: '03', title: '星织', meta: '命理与 AI 解读', href: 'https://xingzhi.app', image: 'assets/products/xingzhi.webp' }
      ]
    }] : [])
  ];

  const card = project => {
    const external = /^https?:\/\//.test(project.href);
    return `
    <a href="${external ? project.href : root + project.href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <figure><img src="${root}${project.image}" alt="" width="640" height="420" loading="lazy"></figure>
      <span class="nav-work-copy"><b>${project.title}</b><small>${project.meta}</small></span>
      <span class="nav-work-index">${project.num}</span>
    </a>`;
  };

  const compact = project => `
    <a href="${root}${project.href}">
      <span class="nav-work-thumb"><img src="${root}${project.image}" alt="" width="180" height="120" loading="lazy"></span>
      <span class="nav-work-copy"><b>${project.title}</b><small>${project.meta}</small></span>
      <span class="nav-work-index">${project.num}</span>
    </a>`;

  const controllers = [];

  menus.forEach(config => {
    const wrap = document.createElement('div');
    wrap.className = 'nav-work';
    config.link.classList.add('nav-work-trigger');
    config.link.setAttribute('aria-haspopup', 'true');
    config.link.setAttribute('aria-expanded', 'false');
    config.link.parentNode.insertBefore(wrap, config.link);
    wrap.appendChild(config.link);

    const menu = document.createElement('div');
    menu.className = `nav-work-menu nav-${config.layout}-menu`;
    const menuId = `nav-${config.layout}-menu`;
    config.link.id = `${menuId}-trigger`;
    config.link.setAttribute('aria-controls', menuId);
    const body = config.layout === 'product'
      ? `<div class="nav-product-grid">${config.projects.map(card).join('')}</div>`
      : `<div class="nav-work-menu-grid">
          <div class="nav-work-compact">${config.projects.filter(project => !project.featured).map(compact).join('')}</div>
          <div class="nav-work-featured">${config.projects.filter(project => project.featured).sort((a, b) => b.num.localeCompare(a.num)).map(card).join('')}</div>
        </div>`;
    menu.id = menuId;
    menu.setAttribute('role', 'region');
    menu.setAttribute('aria-labelledby', config.link.id);
    menu.innerHTML = `<div class="nav-work-menu-head"><strong>${config.title}</strong><span>${config.label}</span></div>${body}`;
    nav.appendChild(menu);

    let closeTimer = 0;
    const setOpen = open => {
      window.clearTimeout(closeTimer);
      if (open) controllers.forEach(controller => { if (controller.setOpen !== setOpen) controller.setOpen(false); });
      wrap.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      config.link.setAttribute('aria-expanded', String(open));
    };
    const scheduleClose = () => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => setOpen(false), 140);
    };
    controllers.push({ setOpen });

    wrap.addEventListener('mouseenter', () => setOpen(true));
    wrap.addEventListener('mouseleave', scheduleClose);
    wrap.addEventListener('focusin', () => setOpen(true));
    wrap.addEventListener('focusout', event => { if (!wrap.contains(event.relatedTarget) && !menu.contains(event.relatedTarget)) scheduleClose(); });
    menu.addEventListener('mouseenter', () => setOpen(true));
    menu.addEventListener('mouseleave', scheduleClose);
    menu.addEventListener('focusin', () => setOpen(true));
    menu.addEventListener('focusout', event => { if (!menu.contains(event.relatedTarget) && !wrap.contains(event.relatedTarget)) scheduleClose(); });
  });

  document.addEventListener('pointerdown', event => {
    if (event.target.closest('.nav-work, .nav-work-menu')) return;
    controllers.forEach(controller => controller.setOpen(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    controllers.forEach(controller => controller.setOpen(false));
    document.activeElement?.blur();
  });
})();
