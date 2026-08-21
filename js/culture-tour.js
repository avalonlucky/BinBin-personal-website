(() => {
  const root = document.querySelector('[data-culture-tour]');
  const stage = root?.querySelector('[data-tour-stage]');
  const room = root?.querySelector('[data-tour-room]');
  const caption = root?.querySelector('[data-tour-caption]');
  if (!root || !stage || !room || !caption) return;

  const views = [
    { yaw: 0, pitch: -3, z: 0, eyebrow: '01 / 访客进门的第一个回答', title: '你们做什么，凭什么值得信任？' },
    { yaw: 13, pitch: -2, z: 34, eyebrow: '02 / 把技术放进一条可以追踪的时间线', title: '技术演进不是年份的堆叠，是一条能被讲述的路径。' },
    { yaw: -13, pitch: -2, z: 34, eyebrow: '03 / 把变化留给屏幕', title: '会持续更新的信息，不应被固死在墙上。' },
  ];
  const buttons = [...root.querySelectorAll('[data-tour-view]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let yaw = 0;
  let pitch = -3;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startYaw = 0;
  let startPitch = 0;

  const paint = (z = 0) => {
    room.style.setProperty('--tour-yaw', `${yaw}deg`);
    room.style.setProperty('--tour-pitch', `${pitch}deg`);
    room.style.setProperty('--tour-z', `${z}px`);
  };

  const select = index => {
    const view = views[index] || views[0];
    yaw = view.yaw;
    pitch = view.pitch;
    paint(view.z);
    buttons.forEach((button, i) => button.classList.toggle('is-active', i === index));
    caption.innerHTML = `<small>${view.eyebrow}</small><strong>${view.title}</strong>`;
  };

  buttons.forEach((button, index) => button.addEventListener('click', event => {
    event.stopPropagation();
    select(index);
  }));

  stage.addEventListener('pointerdown', event => {
    if (reduced || event.target.closest('button')) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startYaw = yaw;
    startPitch = pitch;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!dragging) return;
    yaw = Math.max(-17, Math.min(17, startYaw + (event.clientX - startX) * .035));
    pitch = Math.max(-8, Math.min(4, startPitch - (event.clientY - startY) * .025));
    paint();
  });
  const release = event => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    stage.releasePointerCapture?.(event.pointerId);
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
})();
