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
    ['f6-lobby.webp', '前台 · 序章与定格', '品牌认知与来访记忆点', '作为空间动线的起点，门面墙既是引导访客进入展厅叙事的起点，亦是来访客户打卡与商务合影的标志性背景，实现企业身份识别与二次社交传播的双重作用。'],
    ['hall-screens.webp', '展厅 · 综合概览区', '入厅首站与企业宣传大屏', '展厅入口的核心导览区，设置在访客进门第一视角，通过宣传大屏快速建立对公司的全局了解。将需要频繁迭代的综合宣传交由屏幕动态承载，保持展示内容的实时性与可维护性。'],
    ['hall-mainwall.webp', '展厅 · 核心业务与实力展区', '方案展示、背书认证、产品交互与硬件迭代', '该主墙面自右向左按业务深度依次排布：首先展示针对各行业的“解决方案”；中间重点陈列国家级专精特新、Gartner 与 DAMA 等重量级“荣誉资质”作为实力背书；随后通过可触控交互屏展示“产品与服务”，供客户实时上手体验真实系统；最左侧设置“样机展示架”，陈列历代硬件设备（含见证公司发展的早期机型），形成从软件方案、权威背书到交互体验、硬件沉淀的完整展示闭环。'],
    ['hall-tech.webp', '展厅 · 技术演进', '技术突破与产品生态的时间脉络', '这面墙用于完整展示公司的成长历程。设计上将繁杂的历史信息归纳为“底层技术研发”与“产品功能迭代”两条并行发展的主线，通过折线型发光时间轴串联各个关键年份与重大节点，帮助访客直观了解公司的技术沉淀与产品成熟过程。'],
    ['f6-network.webp', '外部走廊 · 发展规划与服务网络', '战略规划汇报与全国服务布局', '作为走出展厅后的重要过渡展示面，发展规划（左）：配置动态屏幕，满足高规格来访接待时的战略汇报需求，兼作日常业绩榜与表彰轮播窗口。服务网络（右）：发光地图形式直观标出深圳总部与全国 20+ 分支机构，印证覆盖全国的营销与技术支持体系。'],
    ['f6-history.webp', '市场部办公区 · 发展历程', '企业综合经营与成长大事件', '位于市场部核心走廊，系统记录公司从成立至今的重大历程。涵盖公司创立、乔迁新址、重要融资引入及重磅荣誉奖项等关键节点，以流线型时间轴呈现企业持续扩张与稳步成长的发展轨迹。'],
    ['f6-arc-mosaic.webp', '公共走廊 · 企业文化与客户墙', '文化理念、全行业标杆客户与合影背景', '左侧呈现使命与价值观等企业文化体系，右侧按不同行业分类展示标杆客户名录；依托开阔的弧面造型与居中品牌徽标，在建立商业信任的同时，兼具高规格商务接待的拍照合影功能。'],
    ['f6-hr.webp', '人资部 · 行为文化', '文化不写成口号，而是被翻译成可识别的行为'],
    ['f6-party.webp', '会议与党建室', '党建引领与数据安全合规阵地', '位于保密室兼党建活动阵地的主题墙面。严格按照党建规范设计，系统展示支部学习、教育培训与组织活动剪影，直观体现企业在党建引领与数据安全合规保障上的制度落地。'],
    ['f6-ipd.webp', '研发会议室', '集成产品开发管理规范与跨部门协作全景', '位于研发会议室的主题看板。系统梳理公司执行的 IPD（集成产品开发）全流程，以清晰的矩阵图表呈现从概念立项到生命周期管理的全阶段节点与各部门协作职责，作为研发团队日常评审与规范落地的视觉工具。'],
    ['f6-lab.webp', '研究院', '前沿安全研究与攻防推演可视化', '位于安全攻防实验室的主题展墙。左侧展示前沿安全实验室概况，右侧以同心椭圆结构系统推演网络攻防对抗全景，将攻击链路径与防御响应矩阵进行对称重构，直观呈现企业在底层安全研究与实战攻防层面的硬核实力。'],
    ['f5-team.webp', '五楼办公区', '核心交付架构、团队使命与三年战略规划', '位于技术服务部的综合管理全景墙。系统整合部门使命愿景、全国六大区交付组织架构、团队资质风采以及三年战略规划思路，通过模块化分区清晰展现技术服务部作为公司核心交付中枢的组织力量与专业实力。'],
    ['f5-sandbox.webp', '五楼办公区', '实训体系与技能图谱墙', '位于技术服务部的专业赋能主题墙。系统整合数据安全实训沙盘、三级进阶课程体系、技术服务知识图谱以及多维度专业认证考核标准，直观展现团队在技术交付标准化、专业化建设与人才梯队赋能上的完整体系。'],
    ['f5-env.webp', '五楼办公区', '实训环境拓扑墙', '位于五楼技术服务部的实训环境展示墙。采用系统拓扑图形式，完整还原从多通道访问、核心防护组件联动到多源异构数据库底座（大数据/国产化等）的全流程沙盘环境，直观体现公司仿真靶场的实战化支撑能力。'],
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
      caption.classList.toggle('has-detail', Boolean(view[3]));
      caption.innerHTML = `<small>${String(nearest + 1).padStart(2, '0')} / ${view[1]}</small><strong>${view[2]}</strong>${view[3] ? `<p>${view[3]}</p>` : ''}`;
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
