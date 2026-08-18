/* ============================================================
   展厅 3D — 用真实施工图的尺寸在浏览器里把展厅搭出来
   ============================================================
   为什么值得做 3D：这是一个空间项目，平面截图讲不清「站在里面
   是什么感觉」。轴测 SVG 已经能表达关系，但表达不了体量和光。

   几个刻意的约束：
   1. Three.js 只在这一节快滚到时才去下（≈166KB gzip）。
      没滚到、或者压根不看这一节的人，一个字节都不用付。
   2. 不劫持滚轮。滚轮永远归页面，视角只用拖拽改——
      在长页面里用滚轮缩放模型，用户会以为页面卡住了。
   3. WebGL 起不来就什么都不做，轴测 SVG 继续留在原地兜底。
   4. 不加载任何外部模型贴图。墙面内容用 CanvasTexture 现画，
      尺寸全部来自施工图，改数字就改 ROOM / ZONES 两个常量。

   尺寸来源：展厅背景墙立面大样图，总长 11400mm、墙高 2800mm。
   四个展位沿墙的位置是在立面图上量出来的（见 HANDOFF）。
   ============================================================ */

(() => {
  const mount = document.querySelector('[data-room]');
  const shell = document.querySelector('[data-axo]');
  if (!mount || !shell) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* ── 真实尺寸（米） ── */
  const ROOM = {
    width: 11.4,
    height: 2.8,
    depth: 5.4,
    ceiling: 3.0,
  };

  // 每个展位沿墙的起止（米，从墙左端算起），量自立面图
  const ZONES = [
    { key: 'clients', from: 0.912, to: 3.876, label: '客户案例' },
    { key: 'awards',  from: 4.218, to: 6.270, label: '荣誉资质' },
    { key: 'screens', from: 6.498, to: 9.006, label: '电子屏'   },
    { key: 'product', from: 9.234, to: 10.830, label: '产品展示' },
  ];

  const PANEL = { bottom: 0.6, height: 1.6 };   // 展板离地 600，高 1600
  const ACCENT = 0x4265f5;
  const ACCENT_LIGHT = 0x8ca4ff;

  /* 墙左端在世界坐标里的 x（墙以原点居中） */
  const wallX = m => m - ROOM.width / 2;

  /* ── 墙面内容用 canvas 现画，不引外部贴图 ── */
  function makeTexture(THREE, kind, w, h) {
    const px = 256;
    const cv = document.createElement('canvas');
    cv.width = Math.round(px * (w / h));
    cv.height = px;
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;

    c.fillStyle = '#161a23';
    c.fillRect(0, 0, W, H);

    if (kind === 'clients') {
      // 客户墙：一整片规整的名录网格
      const cols = 6, rows = 5, pad = W * 0.05;
      const cw = (W - pad * 2) / cols, ch = (H - pad * 2) / rows;
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < cols; k++) {
          c.fillStyle = `rgba(206,216,255,${0.1 + ((r + k) % 3) * 0.045})`;
          c.fillRect(pad + k * cw + cw * 0.09, pad + r * ch + ch * 0.16,
                     cw * 0.82, ch * 0.62);
        }
      }
    } else if (kind === 'awards') {
      // 荣誉墙：少数几块，留白拉开分量
      const items = [[0.10, 0.14, 0.34, 0.32], [0.54, 0.14, 0.34, 0.32],
                     [0.10, 0.56, 0.34, 0.30], [0.54, 0.56, 0.34, 0.30]];
      items.forEach(([x, y, w2, h2], i) => {
        c.fillStyle = i === 0 ? 'rgba(206,216,255,.26)' : 'rgba(206,216,255,.15)';
        c.fillRect(x * W, y * H, w2 * W, h2 * H);
      });
    } else if (kind === 'product') {
      // 产品展示：造型端 + 一台样机的轮廓
      c.fillStyle = 'rgba(206,216,255,.13)';
      c.fillRect(W * 0.16, H * 0.12, W * 0.68, H * 0.5);
      c.fillStyle = 'rgba(206,216,255,.22)';
      c.fillRect(W * 0.3, H * 0.68, W * 0.4, H * 0.2);
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /* ── 主体 ── */
  async function build() {
    let THREE;
    try {
      THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js');
    } catch {
      return false;                       // 拉不到就安静退场，SVG 继续用
    }

    // WebGL 起不来（老机器 / 禁用硬件加速）同样退场
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    } catch {
      return false;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e15);
    scene.fog = new THREE.Fog(0x0a0e15, 30, 58);

    const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 100);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;
    mount.appendChild(renderer.domElement);

    /* ── 房间 ── */
    const room = new THREE.Group();
    scene.add(room);

    // 底色不能太黑：这是一屏要「看懂空间」的图，不是氛围渲染。
    // 第一版墙面 0x11151d，整个房间糊成一片，只剩展板在发光。
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x3d4759, roughness: .95, metalness: 0 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x272f40, roughness: .58, metalness: .2 });

    // 背墙
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.height), shellMat);
    wall.position.set(0, ROOM.height / 2, 0);
    room.add(wall);

    // 墙上方到吊顶的那一段
    const header = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.width, ROOM.ceiling - ROOM.height), shellMat);
    header.position.set(0, ROOM.height + (ROOM.ceiling - ROOM.height) / 2, 0);
    room.add(header);

    // 地面比房间深：相机站在缺掉的第四面墙外往里看，
    // 地面只到 5.4m 的话，画面下半截是一片空的，房间像浮在黑里。
    const FLOOR_DEPTH = 13;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width + 5, FLOOR_DEPTH), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, FLOOR_DEPTH / 2);
    room.add(floor);

    // 吊顶
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), shellMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, ROOM.ceiling, ROOM.depth / 2);
    room.add(ceil);

    // 两侧山墙
    [-1, 1].forEach(side => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.depth, ROOM.ceiling), shellMat);
      w.rotation.y = -side * Math.PI / 2;
      w.position.set(side * ROOM.width / 2, ROOM.ceiling / 2, ROOM.depth / 2);
      room.add(w);
    });

    // 房间的棱线：没有这几条线，地面和墙在暗部糊成一片，看不出是个盒子
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x8ca4ff, transparent: true, opacity: .42 });
    const outline = (pts) => {
      const g = new THREE.BufferGeometry().setFromPoints(
        pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
      room.add(new THREE.Line(g, edgeMat));
    };
    const hw = ROOM.width / 2, dp = ROOM.depth;
    outline([[-hw, 0, 0], [hw, 0, 0]]);                       // 墙脚
    outline([[-hw, ROOM.ceiling, 0], [hw, ROOM.ceiling, 0]]); // 顶角
    outline([[-hw, 0, 0], [-hw, ROOM.ceiling, 0]]);           // 左立缝
    outline([[hw, 0, 0], [hw, ROOM.ceiling, 0]]);             // 右立缝
    outline([[-hw, 0, 0], [-hw, 0, dp]]);                     // 左地缝
    outline([[hw, 0, 0], [hw, 0, dp]]);                       // 右地缝

    // 地面反射感：一条压暗的踢脚
    const skirt = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.width, .12),
      new THREE.MeshStandardMaterial({ color: 0x070a10, roughness: 1 }));
    skirt.position.set(0, .06, .012);
    room.add(skirt);

    /* ── 展位 ── */
    const panels = [];
    const spots = [];

    ZONES.forEach((z, i) => {
      const w = z.to - z.from;
      const cx = wallX((z.from + z.to) / 2);
      const cy = PANEL.bottom + PANEL.height / 2;

      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: .82,
        metalness: .04,
        emissive: new THREE.Color(ACCENT),
        emissiveIntensity: 0,
      });
      if (z.key !== 'screens') mat.map = makeTexture(THREE, z.key, w, PANEL.height);

      const panel = new THREE.Mesh(new THREE.BoxGeometry(w, PANEL.height, .07), mat);
      panel.position.set(cx, cy, .045);
      panel.userData.zone = i;
      room.add(panel);
      panels.push(panel);

      // 展板四周一圈灯槽
      const edge = new THREE.Mesh(
        new THREE.PlaneGeometry(w + .1, PANEL.height + .1),
        new THREE.MeshBasicMaterial({ color: ACCENT_LIGHT, transparent: true, opacity: 0 }));
      edge.position.set(cx, cy, .005);
      room.add(edge);
      panel.userData.edge = edge;

      // 电子屏那一格：三块 55 寸（1.22 × 0.69）
      if (z.key === 'screens') {
        const sw = 1.22, sh = .69, gap = (w - sw * 3) / 4;
        for (let k = 0; k < 3; k++) {
          const sx = wallX(z.from) + gap * (k + 1) + sw * (k + .5);
          const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(sw, sh),
            new THREE.MeshBasicMaterial({ color: 0x1a2740 }));
          screen.position.set(sx, cy + .3, .09);
          room.add(screen);
          panel.userData[`screen${k}`] = screen;
        }
      }

      // 产品展示区前面摆两个展台
      if (z.key === 'product') {
        [-.5, .5].forEach(off => {
          const plinth = new THREE.Mesh(
            new THREE.BoxGeometry(.5, .9, .5),
            new THREE.MeshStandardMaterial({ color: 0x141922, roughness: .8 }));
          plinth.position.set(cx + off, .45, .95);
          room.add(plinth);
        });
      }

      // 每个展位一盏射灯
      const spot = new THREE.SpotLight(0xeaf0ff, 0, 10, Math.PI / 6.4, .5, 1.3);
      spot.position.set(cx, ROOM.ceiling - .08, 1.5);
      spot.target.position.set(cx, cy, 0);
      room.add(spot, spot.target);
      spots.push(spot);

      // 吊顶上的灯具
      const fixture = new THREE.Mesh(
        new THREE.CylinderGeometry(.07, .09, .1, 16),
        new THREE.MeshStandardMaterial({ color: 0x2a3242, roughness: .6 }));
      fixture.position.set(cx, ROOM.ceiling - .05, 1.5);
      room.add(fixture);
    });

    /* ── 基础照明 ── */
    scene.add(new THREE.HemisphereLight(0xd6e0ff, 0x1c2331, 2.2));
    scene.add(new THREE.AmbientLight(0xffffff, .78));
    const fill = new THREE.DirectionalLight(0xdfe6ff, 1.15);
    fill.position.set(3, 7, 11);
    scene.add(fill);
    const wash = new THREE.PointLight(0x4265f5, 14, 26, 2);
    wash.position.set(0, 2.5, 5);
    scene.add(wash);

    /* ── 相机轨道（只用拖拽，滚轮永远归页面） ── */
    const target = new THREE.Vector3(0, 1.35, 0);
    const view = { az: 0, pol: Math.PI / 2, dist: 13.4 };
    const wanted = { ...view };
    const HOME = { ...view };

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const applyCamera = () => {
      const { az, pol, dist } = view;
      camera.position.set(
        target.x + dist * Math.sin(pol) * Math.sin(az),
        target.y + dist * Math.cos(pol),
        target.z + dist * Math.sin(pol) * Math.cos(az));
      camera.lookAt(target);
    };

    let dragging = false, lastX = 0, lastY = 0, moved = 0;
    const el = renderer.domElement;
    el.style.touchAction = 'pan-y';        // 竖向滑动仍然翻页

    el.addEventListener('pointerdown', e => {
      dragging = true; moved = 0;
      lastX = e.clientX; lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      shell.classList.add('is-dragging');
    });
    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      wanted.az = clamp(wanted.az - dx * .005, -0.62, 0.62);
      wanted.pol = clamp(wanted.pol - dy * .004, 1.24, 1.78);
    });
    const endDrag = e => {
      if (!dragging) return;
      dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      shell.classList.remove('is-dragging');
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    /* ── 点展板选中 ── */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    el.addEventListener('click', e => {
      if (moved > 6) return;                 // 拖完松手不算点击
      const r = el.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(panels, false)[0];
      if (hit) shell.__select?.(hit.object.userData.zone);
    });

    /* ── 选中某个展位：灯亮、展板发光、镜头推过去 ── */
    let active = 0;
    let allLights = false;

    let armed = false;                 // 首次 select 只记状态，不动镜头
    const focus = i => {
      active = i;
      if (!armed) { armed = true; return; }
      const z = ZONES[i];
      const cx = wallX((z.from + z.to) / 2);
      target.set(cx * .55, 1.35, 0);
      wanted.az = clamp(cx * .028, -0.62, 0.62);
      wanted.pol = Math.PI / 2;
      wanted.dist = 9.6;
    };

    shell.__onSelect = focus;

    const resetView = () => {
      target.set(0, 1.35, 0);
      Object.assign(wanted, HOME);
    };

    /* ── 控件 ── */
    mount.insertAdjacentHTML('beforeend', `
      <div class="cs-room-ui">
        <button type="button" data-room-lights>全部点亮</button>
        <button type="button" data-room-reset>回到全景</button>
      </div>
      <p class="cs-room-hint" data-room-hint>拖动可以转动视角 · 点展板查看</p>
    `);
    const hint = mount.querySelector('[data-room-hint]');
    const lightsBtn = mount.querySelector('[data-room-lights]');
    mount.querySelector('[data-room-reset]').addEventListener('click', resetView);
    lightsBtn.addEventListener('click', () => {
      allLights = !allLights;
      lightsBtn.textContent = allLights ? '只亮当前展位' : '全部点亮';
      lightsBtn.classList.toggle('is-on', allLights);
    });
    el.addEventListener('pointerdown', () => hint?.classList.add('is-gone'), { once: true });

    /* ── 渲染循环，只在可见时跑 ── */
    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; },
      { threshold: 0.01 });
    io.observe(mount);

    const resize = () => {
      const r = mount.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(mount);
    resize();

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;

      view.az   = lerp(view.az,   wanted.az,   .08);
      view.pol  = lerp(view.pol,  wanted.pol,  .08);
      view.dist = lerp(view.dist, wanted.dist, .06);
      applyCamera();

      panels.forEach((p, i) => {
        const on = allLights || i === active;
        p.material.emissiveIntensity = lerp(p.material.emissiveIntensity, on ? .22 : .05, .09);
        p.userData.edge.material.opacity = lerp(p.userData.edge.material.opacity, on ? .62 : .08, .09);
        spots[i].intensity = lerp(spots[i].intensity, on ? 26 : 10, .09);
        for (let k = 0; k < 3; k++) {
          const s = p.userData[`screen${k}`];
          if (s) s.material.color.lerp(new THREE.Color(on ? 0x3f5fd8 : 0x141c2e), .09);
        }
      });

      renderer.render(scene, camera);
    };

    applyCamera();
    tick();
    shell.classList.add('is-3d');

    // 头部文案跟着换：3D 起来之后这里已经不是轴测图了
    const head = shell.querySelector('.cs-axo-head b');
    const headHint = shell.querySelector('[data-axo-hint]');
    if (head) head.textContent = '展厅 3D · 按施工图尺寸搭建';
    if (headHint) headHint.textContent = '拖动转视角 · 点展板或图例查看';

    // 3D 画布和轴测 SVG 高度不一样，切换那一下文档会长 80 来 px。
    // 这一页目前只有首屏点灯一个 scrub，位置在这一节上面、不受影响，
    // 但 ScrollTrigger 的 start/end 是测一次就缓存的，别留这个雷。
    window.ScrollTrigger?.refresh();

    return true;
  }

  /* ── 快滚到时才去下 Three.js ── */
  const arm = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    arm.disconnect();
    build().then(ok => { if (!ok) shell.classList.add('is-3d-failed'); });
  }, { rootMargin: '600px 0px' });
  arm.observe(shell);
})();
