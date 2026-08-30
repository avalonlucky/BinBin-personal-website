(() => {
  const box = document.getElementById('about-capability-cloud');
  if (!box || !window.Matter) return;

  const LABELS = [
    '品牌视觉', '营销物料', 'AI Agent 工作流', '展会设计', 'VI 设计', '海报设计',
    '插画与内刊设计', '画册设计', '单页设计', '十年设计经验', 'AI', '跨部门',
    '不设限', '打通链路', '易拉宝设计', '直播设计', '跨部门合作'
  ];
  const PALETTE = [
    ['#ff6a00', '#ffffff'], ['#635bff', '#ffffff'], ['#10a37f', '#ffffff'],
    ['#2563eb', '#ffffff'], ['#5b21b6', '#ffffff'], ['#96bf48', '#ffffff'],
    ['#0f151d', '#fff9f6'], ['#03363d', '#ffffff'], ['#34a853', '#ffffff'],
    ['#e9ebee', '#2b2f36'], ['#3a2718', '#ffffff'], ['#f2a35c', '#422a10']
  ];
  const ANGLES = [-14, 8, -8, 12, -6, 10, -10, 7, -12, 9, -7, 11, -9, 6, -13, 8, -5];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { Engine, Composite, Bodies } = Matter;
  let frame = 0;
  let engine = null;
  let resizeTimer = 0;

  function card(index, count) {
    const x = count > 1 ? 8 + (index / (count - 1)) * 84 : 50;
    const y = -(150 + index * 70);
    const colors = PALETTE[index % PALETTE.length];
    return { x: `${x.toFixed(1)}%`, y: `${y.toFixed(0)}%`, angle: ANGLES[index % ANGLES.length], bg: colors[0], fg: colors[1] };
  }

  function percent(value, total) {
    return typeof value === 'string' && value.endsWith('%') ? total * parseFloat(value) / 100 : value;
  }

  function pill(label, background, color) {
    const element = document.createElement('div');
    element.className = 'about-capability-pill';
    element.style.background = background;
    element.style.color = color;
    element.textContent = label;
    return element;
  }

  function measure() {
    const holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;white-space:nowrap';
    document.body.appendChild(holder);
    const sizes = LABELS.map((label, index) => {
      const colors = PALETTE[index % PALETTE.length];
      const element = pill(label, colors[0], colors[1]);
      holder.appendChild(element);
      const size = { width: element.offsetWidth, height: element.offsetHeight };
      element.remove();
      return size;
    });
    holder.remove();
    return sizes;
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      engine = null;
    }
  }

  function staticLayout(sizes) {
    box.classList.add('is-static');
    LABELS.forEach((label, index) => {
      const config = card(index, LABELS.length);
      const element = document.createElement('div');
      element.className = 'about-capability-chip';
      element.style.width = `${sizes[index].width}px`;
      element.style.height = `${sizes[index].height}px`;
      const column = index % 4;
      const row = Math.floor(index / 4);
      const x = (box.clientWidth * (.08 + column * .27)) - sizes[index].width / 2;
      const y = box.clientHeight - 42 - row * 42;
      element.style.transform = `translate(${Math.max(0, x)}px, ${y}px) rotate(${config.angle}deg)`;
      element.appendChild(pill(label, config.bg, config.fg));
      box.appendChild(element);
    });
  }

  function init() {
    stop();
    box.classList.remove('is-static');
    box.replaceChildren();
    const width = box.clientWidth;
    const height = box.clientHeight;
    if (!width || !height) return;
    const sizes = measure();
    if (reduced) {
      staticLayout(sizes);
      return;
    }

    engine = Engine.create({ positionIterations: 12, velocityIterations: 8, constraintIterations: 4, enableSleeping: true });
    engine.gravity.y = 1.2;
    const wall = { isStatic: true, friction: 1 };
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, height - 25, width, 20, wall),
      Bodies.rectangle(-10, height / 2, 20, height, wall),
      Bodies.rectangle(width + 10, height / 2, 20, height, wall)
    ]);

    const bodies = [];
    const elements = [];
    LABELS.forEach((label, index) => {
      const config = card(index, LABELS.length);
      const size = sizes[index];
      const element = document.createElement('div');
      element.className = 'about-capability-chip';
      element.style.width = `${size.width}px`;
      element.style.height = `${size.height}px`;
      element.appendChild(pill(label, config.bg, config.fg));
      box.appendChild(element);
      const body = Bodies.rectangle(percent(config.x, width), percent(config.y, height), size.width, size.height, {
        friction: .3,
        restitution: .15,
        frictionAir: .015,
        density: .003,
        angle: config.angle * Math.PI / 180,
        chamfer: { radius: Math.max(1, Math.floor(Math.min(size.width, size.height) / 2) - 1) }
      });
      Composite.add(engine.world, body);
      bodies.push(body);
      elements.push(element);
    });

    const tick = () => {
      Engine.update(engine, 1000 / 60);
      bodies.forEach((body, index) => {
        const size = sizes[index];
        elements[index].style.transform = `translate(${(body.position.x - size.width / 2).toFixed(1)}px, ${(body.position.y - size.height / 2).toFixed(1)}px) rotate(${(body.angle * 180 / Math.PI).toFixed(3)}deg)`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  const start = () => requestAnimationFrame(init);
  if (document.fonts?.ready) document.fonts.ready.then(start);
  else start();

  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
  addEventListener('pagehide', stop, { once: true });
})();
