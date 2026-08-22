(() => {
  const root = document.querySelector('[data-culture-tour]');
  const stage = root?.querySelector('[data-tour-stage]');
  const frameA = root?.querySelector('[data-tour-frame-a]');
  const frameB = root?.querySelector('[data-tour-frame-b]');
  const caption = root?.querySelector('[data-tour-caption]');
  const degrees = root?.querySelector('[data-tour-degrees]');
  const indexNav = root?.querySelector('[data-tour-index]');
  if (!root || !stage || !frameA || !frameB || !caption || !degrees || !indexNav) return;

  const base = '../assets/work/culture-wall/render/';
  const views = [
    ['f6-lobby.webp', '前台 · 第一印象', '先让访客知道这是谁，再邀请他走进故事'],
    ['hall-tech.webp', '展厅 · 技术演进', '把抽象的技术路径，编辑成一条可以被追踪的时间线'],
    ['hall-screens.webp', '展厅 · 动态信息', '会持续变化的内容留给屏幕，不把它固死在墙上'],
    ['hall-mainwall.webp', '展厅 · 主展墙', '用一个连续的展面，回答业务、产品、资质与信任'],
    ['hall-awards.webp', '展厅 · 荣誉资质', '主要展示专利及重量级奖项，例如 Gartner、DAMA 和专精特新等奖牌'],
    ['f6-history.webp', '走廊 · 发展历程', '记录公司成立、融资、重量级产品发布及重要奖项等重大事项'],
    ['f6-network.webp', '走廊 · 服务网络', '把组织能力放进地理尺度，让服务范围一眼可见'],
    ['f6-arc.webp', '走廊 · 弧形文化墙', '空间转弯的地方，也成为叙事转场的地方'],
    ['f6-hr.webp', '人资部 · 行为文化', '文化不写成口号，而是被翻译成可识别的行为'],
    ['f6-party.webp', '会议区 · 保密文化', '严肃的主题仍然可以拥有清晰的层级与视觉节奏'],
    ['f6-ipd.webp', '研发部 · IPD 流程', '复杂流程先被重新组织，再被放大到空间中'],
    ['f6-lab.webp', '研发部 · 攻防演练', '信息密度最高的展面，用同心结构建立阅读入口'],
    ['f5-team.webp', '五楼 · 团队与架构', '从战略、组织到认证体系，展开部门的全景'],
    ['f5-sandbox.webp', '五楼 · 实训沙盘', '把产品能力从参数表，转译成实际应用场景'],
    ['f5-env.webp', '五楼 · 实训环境', '环线的最后，让视线回到数据安全的核心系统'],
  ];

  const urls = views.map(view => new URL(base + view[0], document.baseURI).href);
  urls.forEach(url => { const image = new Image(); image.decoding = 'async'; image.src = url; });
  indexNav.innerHTML = views.map((view, i) => `<button type="button" aria-label="${String(i + 1).padStart(2, '0')} ${view[1]}">${i + 1}</button>`).join('');
  const buttons = [...indexNav.querySelectorAll('button')];
  const stepButtons = [...root.querySelectorAll('[data-tour-step]')];

  let position = 0;
  let velocity = 0;
  let dragging = false;
  let moved = false;
  let downX = 0;
  let lastX = 0;
  let lastTime = 0;
  let activeIndex = -1;
  let raf = 0;
  const sensitivity = matchMedia('(pointer: coarse)').matches ? 0.018 : 0.011;
  const wrap = value => ((value % views.length) + views.length) % views.length;

  function paint() {
    const wrapped = wrap(position);
    const current = Math.floor(wrapped);
    const next = (current + 1) % views.length;
    const mix = wrapped - current;
    if (frameA.src !== urls[current]) frameA.src = urls[current];
    if (frameB.src !== urls[next]) frameB.src = urls[next];
    frameA.style.transform = `translate3d(${-mix * 100}%,0,0)`;
    frameB.style.transform = `translate3d(${(1 - mix) * 100}%,0,0)`;
    const nearest = Math.round(wrapped) % views.length;
    if (nearest !== activeIndex) {
      activeIndex = nearest;
      const view = views[nearest];
      caption.innerHTML = `<small>${String(nearest + 1).padStart(2, '0')} / ${view[1]}</small><strong>${view[2]}</strong>`;
      buttons.forEach((button, i) => button.classList.toggle('is-active', i === nearest));
    }
    const angle = wrapped / views.length * 360;
    degrees.textContent = `${String(Math.round(angle)).padStart(3, '0')}°`;
    stage.style.setProperty('--tour-bearing', `${angle / 3.6}%`);
  }

  function coast() {
    velocity *= .92;
    if (Math.abs(velocity) < .0008) { velocity = 0; raf = 0; return; }
    position += velocity;
    paint();
    raf = requestAnimationFrame(coast);
  }

  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    cancelAnimationFrame(raf);
    raf = 0;
    dragging = true;
    moved = false;
    downX = lastX = event.clientX;
    lastTime = performance.now();
    velocity = 0;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!dragging) return;
    const now = performance.now();
    const dx = event.clientX - lastX;
    if (Math.abs(event.clientX - downX) > 5) moved = true;
    const dt = Math.max(8, now - lastTime);
    position -= dx * sensitivity;
    velocity = velocity * .55 + (-dx * sensitivity) * (16 / dt) * .45;
    lastX = event.clientX;
    lastTime = now;
    paint();
  });
  const release = event => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    stage.releasePointerCapture?.(event.pointerId);
    raf = requestAnimationFrame(coast);
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  function goTo(index) {
    cancelAnimationFrame(raf);
    const current = wrap(position);
    const target = wrap(index);
    let delta = target - current;
    if (delta > views.length / 2) delta -= views.length;
    if (delta < -views.length / 2) delta += views.length;
    const from = position;
    const to = position + delta;
    const started = performance.now();
    const animate = now => {
      const t = Math.min(1, (now - started) / 520);
      const eased = 1 - Math.pow(1 - t, 3);
      position = from + (to - from) * eased;
      paint();
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => goTo(index)));
  stepButtons.forEach(button => button.addEventListener('click', () => {
    const direction = Number(button.dataset.tourStep) || 1;
    goTo(Math.round(wrap(position)) + direction);
  }));
  stage.addEventListener('click', event => {
    if (moved || event.target.closest('button')) return;
    const rect = stage.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    if (ratio < .32) goTo(Math.round(wrap(position)) - 1);
    if (ratio > .68) goTo(Math.round(wrap(position)) + 1);
  });
  stage.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    goTo(Math.round(wrap(position)) + (event.key === 'ArrowRight' ? 1 : -1));
  });

  paint();
})();

document.querySelectorAll('[data-space-switcher]').forEach(switcher => {
  const media = switcher.querySelector('[data-space-media]');
  const image = media?.querySelector('img');
  const count = media?.querySelector('span');
  const tabs = [...switcher.querySelectorAll('[data-space-tab]')];
  const kicker = switcher.querySelector('[data-space-kicker]');
  const title = switcher.querySelector('[data-space-title]');
  const reason = switcher.querySelector('[data-space-reason]');
  const role = switcher.querySelector('[data-space-role]');
  if (!media || !image || !tabs.length) return;

  const select = tab => {
    const index = tabs.indexOf(tab);
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    media.classList.add('is-changing');
    switcher.style.setProperty('--wall-accent', tab.dataset.accent || '#7896ff');
    const nextImage = new Image();
    nextImage.onload = () => {
      image.src = tab.dataset.image;
      image.alt = tab.dataset.alt || '';
      kicker.textContent = tab.dataset.kicker;
      title.textContent = tab.dataset.title;
      reason.textContent = tab.dataset.reason;
      role.textContent = tab.dataset.role;
      count.textContent = `顺时针参观 / ${String(index + 1).padStart(2, '0')}`;
      requestAnimationFrame(() => media.classList.remove('is-changing'));
    };
    nextImage.src = tab.dataset.image;
  };

  tabs.forEach(tab => tab.addEventListener('click', () => select(tab)));
});

document.querySelectorAll('.culture-map-pin').forEach(pin => {
  pin.addEventListener('click', () => {
    document.querySelectorAll('.culture-map-pin').forEach(item => item.classList.remove('is-active'));
    pin.classList.add('is-active');
  });
});
