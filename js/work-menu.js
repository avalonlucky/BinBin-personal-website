(function () {
  const nav = document.getElementById('nav');
  const workLink = nav?.querySelector('.nav-links a:first-child');
  if (!nav || !workLink || workLink.closest('.nav-work')) return;

  const fromWork = /\/work\//.test(window.location.pathname);
  const root = fromWork ? '../' : '';
  const projects = [
    { num: '01', title: '十三款产品的视觉营销语言', meta: '产品视觉系统', href: 'work/ankki-product-sheets.html', image: 'assets/work/ankki/card-product-sheets-2026.webp' },
    { num: '02', title: '从零建立企业内刊设计体系', meta: '内刊设计', href: 'work/ankki-vision-journal.html', image: 'assets/work/vision/card-vision-2026.webp' },
    { num: '03', title: '把办公室编成有次序的参观', meta: '文化墙展厅', href: 'work/ankki-culture-wall.html', image: 'assets/work/culture-wall/card-culture-wall.webp?v=2', featured: true },
    { num: '04', title: '从预热到收官的视觉体系', meta: '线上发布会', href: 'work/ankki-livestream-launch.html', image: 'assets/work/livestream/live-scene.png' },
    { num: '05', title: '国家级特装展，从筹备到落地', meta: 'DMHC 特装展', href: 'work/ankki-dmhc-exhibition.html', image: 'assets/work/dmhc/hero.webp', featured: true }
  ];

  const item = (project, featured) => `
    <a href="${root}${project.href}">
      ${featured ? `<figure><img src="${root}${project.image}" alt="" width="640" height="420" loading="lazy"></figure>` : `<span class="nav-work-thumb"><img src="${root}${project.image}" alt="" width="180" height="120" loading="lazy"></span>`}
      <span class="nav-work-copy"><b>${project.title}</b><small>${project.meta}</small></span>
      <span class="nav-work-index">${project.num}</span>
    </a>`;

  const wrap = document.createElement('div');
  wrap.className = 'nav-work';
  workLink.classList.add('nav-work-trigger');
  workLink.setAttribute('aria-haspopup', 'true');
  workLink.setAttribute('aria-expanded', 'false');
  workLink.parentNode.insertBefore(wrap, workLink);
  wrap.appendChild(workLink);

  const menu = document.createElement('div');
  menu.className = 'nav-work-menu';
  menu.innerHTML = `
    <div class="nav-work-menu-head"><strong>精选作品</strong><span>Selected work · 05</span></div>
    <div class="nav-work-menu-grid">
      <div class="nav-work-compact">${projects.filter(project => !project.featured).map(project => item(project, false)).join('')}</div>
      <div class="nav-work-featured">${projects.filter(project => project.featured).sort((a, b) => b.num.localeCompare(a.num)).map(project => item(project, true)).join('')}</div>
    </div>`;
  nav.appendChild(menu);

  let closeTimer = 0;
  const setOpen = open => {
    window.clearTimeout(closeTimer);
    wrap.classList.toggle('is-open', open);
    nav.classList.toggle('is-work-open', open);
    workLink.setAttribute('aria-expanded', String(open));
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => setOpen(false), 140);
  };
  wrap.addEventListener('mouseenter', () => setOpen(true));
  wrap.addEventListener('mouseleave', scheduleClose);
  wrap.addEventListener('focusin', () => setOpen(true));
  wrap.addEventListener('focusout', event => { if (!wrap.contains(event.relatedTarget) && !menu.contains(event.relatedTarget)) scheduleClose(); });
  menu.addEventListener('mouseenter', () => setOpen(true));
  menu.addEventListener('mouseleave', scheduleClose);
  menu.addEventListener('focusin', () => setOpen(true));
  menu.addEventListener('focusout', event => { if (!menu.contains(event.relatedTarget) && !wrap.contains(event.relatedTarget)) scheduleClose(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setOpen(false);
      workLink.focus();
    }
  });
})();
