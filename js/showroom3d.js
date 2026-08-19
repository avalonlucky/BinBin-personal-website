/* ============================================================
   展厅 3D — 按最终布局把展厅在浏览器里搭出来
   ============================================================
   为什么值得做 3D：这是一个空间项目，平面截图讲不清「站在里面
   是什么感觉」。平面图能表达关系，但表达不了体量和光。

   **布局依据是用户手绘的最终布局草图，不是那张 11400 立面大样图。**
   立面图是第一版，后来改过：第一版把内容全排在一面背墙上，
   最终版是一个四面都有内容的房间，客户案例墙整个搬出了展厅
   （搬到前台正对大门的弧形墙上）。草图只定位置关系、不定尺寸，
   房间开间沿用 CAD，内容宽度按草图比例换算。

   几个刻意的约束：
   1. Three.js 只在这一节快滚到时才去下（≈166KB gzip）。
      没滚到、或者压根不看这一节的人，一个字节都不用付。
   2. 不劫持滚轮。滚轮永远归页面，视角只用拖拽改——
      在长页面里用滚轮缩放模型，用户会以为页面卡住了。
   3. WebGL 起不来就什么都不做，展厅平面图继续留在原地兜底。
   4. 不加载任何外部模型贴图。墙面内容用 CanvasTexture 现画，
      改布局只改 ROOM / ZONES 两个常量。

   **相机站在房间里面，只转不绕。** 四面墙都有东西，绕着房子转的
   轨道相机永远看不到进门那面墙；站在里面转头才是这个空间真实的
   看法，也不会出现镜头穿墙。
   ============================================================ */

(() => {
  const mount = document.querySelector('[data-room]');
  const shell = document.querySelector('[data-axo]');
  if (!mount || !shell) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* ── 房间（米）── */
  const ROOM = {
    width: 11.4,      // 开间，沿用 CAD
    depth: 5.1,       // 进深，按草图 2.23:1 的长宽比反算
    height: 2.8,
    ceiling: 3.0,
  };

  // 每块内容在所属墙上的起止（米）。
  //   back / front：从西端（草图左边）算起
  //   west / east ：从背墙（草图上边）算起
  // 数值是草图上量的比例 × 房间尺寸，见 HANDOFF。
  //
  // art：贴到这块板上的真实设计稿。给了就用图，没给就用现画的示意底纹。
  // **换真图只改这一行，几何和灯光都不用动。**
  const ART_DIR = '../assets/work/culture-wall/room/';
  const ZONES = [
    { key: 'demo',     wall: 'back',  from: 1.549, to: 3.694, kind: 'screen',   label: '产品服务',         art: null },
    { key: 'awards',   wall: 'back',  from: 4.648, to: 6.752, kind: 'panel',    label: '荣誉资质',         art: null },
    { key: 'solution', wall: 'back',  from: 7.745, to: 9.851, kind: 'screen',   label: '解决方案',         art: null },
    { key: 'product',  wall: 'west',  from: 1.134, to: 3.870, kind: 'cabinet',  label: '样机展示',         art: null },
    { key: 'film',     wall: 'east',  from: 0.920, to: 3.617, kind: 'screen',   label: '宣传片',           art: null },
    { key: 'tech',     wall: 'front', from: 0.000, to: 4.886, kind: 'lightbox', label: '技术演进灯箱',     art: null },
  ];

  const ACCENT = 0x4265f5;
  const ACCENT_LIGHT = 0x8ca4ff;

  /* 每种内容离地多高、多高一块 */
  const SIZING = {
    panel:    { bottom: 0.60, height: 1.60 },
    screen:   { bottom: 0.60, height: 1.60 },
    lightbox: { bottom: 0.35, height: 2.10 },
    cabinet:  { bottom: 0.00, height: 2.00 },
  };

  /* ── 把「第几面墙 + 沿墙的位置」翻译成世界坐标 ──
     背墙法线朝 +z，进门那面朝 -z，两侧朝 ±x。
     四面墙共用一个函数，将来加一面墙不用碰别的代码。 */
  function place(z) {
    const mid = (z.from + z.to) / 2;
    const len = z.to - z.from;
    const hw = ROOM.width / 2, hd = ROOM.depth / 2;
    switch (z.wall) {
      case 'back':  return { x: mid - hw, z: -hd,       rot: 0,            len, nx: 0,  nz: 1 };
      case 'front': return { x: mid - hw, z: hd,        rot: Math.PI,      len, nx: 0,  nz: -1 };
      case 'west':  return { x: -hw,      z: mid - hd,  rot: Math.PI / 2,  len, nx: 1,  nz: 0 };
      default:      return { x: hw,       z: mid - hd,  rot: -Math.PI / 2, len, nx: -1, nz: 0 };
    }
  }

  /* ── 墙面内容用 canvas 现画，不引外部贴图 ── */
  function makeTexture(THREE, z, w, h) {
    const px = 256;
    const cv = document.createElement('canvas');
    cv.width = Math.round(px * (w / h));
    cv.height = px;
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;

    // 实景的展板是白色造型板 + 蓝色刻线，不是深色板
    c.fillStyle = '#f4f6fa';
    c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(42,86,190,.55)';
    c.lineWidth = Math.max(1, H * .012);
    c.strokeRect(H * .05, H * .05, W - H * .1, H - H * .1);

    if (z.key === 'awards') {
      // 荣誉墙：只放几块，留白拉开分量
      [[0.10, 0.14, 0.34, 0.32], [0.54, 0.14, 0.34, 0.32],
       [0.10, 0.56, 0.34, 0.30], [0.54, 0.56, 0.34, 0.30]].forEach(([x, y, w2, h2], i) => {
        c.fillStyle = i === 0 ? 'rgba(42,86,190,.30)' : 'rgba(42,86,190,.16)';
        c.fillRect(x * W, y * H, w2 * W, h2 * H);
      });
    } else if (z.kind === 'lightbox') {
      // 技术演进灯箱：一条横向时间轴
      c.fillStyle = 'rgba(42,86,190,.35)';
      c.fillRect(0, H * 0.46, W, H * 0.02);
      for (let i = 0; i < 7; i++) {
        const x = W * (0.08 + i * 0.14);
        c.fillStyle = 'rgba(42,86,190,.75)';
        c.beginPath();
        c.arc(x, H * 0.47, H * 0.022, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(42,86,190,.20)';
        c.fillRect(x - W * 0.045, H * (i % 2 ? 0.56 : 0.24), W * 0.09, H * 0.16);
      }
    } else if (z.kind === 'cabinet') {
      // 灯光柜：分层的搁板
      for (let i = 0; i < 4; i++) {
        c.fillStyle = `rgba(42,86,190,${0.14 + i * 0.04})`;
        c.fillRect(W * 0.12, H * (0.08 + i * 0.23), W * 0.76, H * 0.14);
      }
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
      return false;                       // 拉不到就安静退场，平面图继续用
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    } catch {
      return false;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1b2033);
    // 站在一个 11 米的房间里不该有雾，去掉

    const camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.05, 60);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const hw = ROOM.width / 2, hd = ROOM.depth / 2;

    /* ── 房间外壳 ──
       材质全部照实景照定，不是凭空调的氛围色：
       墙是白色科技造型板，地是蓝灰环氧自流平，
       吊顶是深色铝格栅 + 白灯带，墙顶一圈蓝色灯槽。
       上一版整间是灰蓝盒子，跟真实空间完全不像。 */
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xeceef3, roughness: .78, metalness: .02, side: THREE.BackSide,
    });
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM.width, ROOM.ceiling, ROOM.depth), shellMat);
    box.position.set(0, ROOM.ceiling / 2, 0);
    scene.add(box);

    // 地面：蓝灰自流平，磨得比较亮，有一点映
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
      new THREE.MeshStandardMaterial({ color: 0x4f5470, roughness: .40, metalness: .26 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.002;
    scene.add(floor);

    // 吊顶：深色铝格栅。实景里它是整间最暗的一块，
    // 白墙才跳得出来——顶也做成白的会糊成一片。
    const ceilTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = 8; cv.height = 256;
      const c = cv.getContext('2d');
      c.fillStyle = '#262b3a'; c.fillRect(0, 0, 8, 256);
      c.fillStyle = '#5b6480';
      for (let i = 0; i < 256; i += 8) c.fillRect(0, i, 8, 4);
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 26);
      return t;
    })();
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
      new THREE.MeshStandardMaterial({ color: 0xffffff, map: ceilTex, roughness: .9 }));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = ROOM.ceiling - .002;
    scene.add(ceil);

    // 吊顶上的白灯带：三条顺着房间长向
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xf2f6ff });
    [-1.35, 0, 1.35].forEach(z => {
      const st = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width - .6, .1), stripMat);
      st.rotation.x = Math.PI / 2;
      st.position.set(0, ROOM.ceiling - .012, z);
      scene.add(st);
    });

    // 墙顶一圈蓝色灯槽——实景里最有辨识度的一笔
    const coveMat = new THREE.MeshBasicMaterial({ color: 0x2f7bff });
    [[ROOM.width, 0, -hd + .02, 0],
     [ROOM.width, 0, hd - .02, Math.PI],
     [ROOM.depth, -hw + .02, 0, Math.PI / 2],
     [ROOM.depth, hw - .02, 0, -Math.PI / 2]].forEach(([len, x, z, rot]) => {
      const cove = new THREE.Mesh(new THREE.PlaneGeometry(len, .07), coveMat);
      cove.position.set(x, ROOM.ceiling - .10, z);
      cove.rotation.y = rot;
      scene.add(cove);
    });
    // 离吊顶太近会在顶上洗出一块亮蓝斑，放到墙腰的高度
    const coveLight = new THREE.PointLight(0x3f86ff, 7, 15, 1.6);
    coveLight.position.set(0, ROOM.ceiling - .75, 0);
    scene.add(coveLight);

    // 墙脚一圈压暗的踢脚，替代做不起的接触阴影
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0xd2d6e0, roughness: .85 });
    [[ROOM.width, 0, -hd + .012, 0],
     [ROOM.width, 0, hd - .012, Math.PI],
     [ROOM.depth, -hw + .012, 0, Math.PI / 2],
     [ROOM.depth, hw - .012, 0, -Math.PI / 2]].forEach(([len, x, z, rot]) => {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(len, .11), skirtMat);
      s.position.set(x, .055, z);
      s.rotation.y = rot;
      scene.add(s);
    });

    // 棱线：暗部里没有这几条线，墙和吊顶会糊成一片
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x8f97ad, transparent: true, opacity: .35 });
    const seg = (a, b) => {
      const g = new THREE.BufferGeometry().setFromPoints(
        [new THREE.Vector3(...a), new THREE.Vector3(...b)]);
      scene.add(new THREE.Line(g, edgeMat));
    };
    const C = ROOM.ceiling;
    const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    corners.forEach(([x, z], i) => {
      const [nx, nz] = corners[(i + 1) % 4];
      seg([x, C, z], [nx, C, nz]);          // 顶角
      seg([x, 0, z], [nx, 0, nz]);          // 墙脚
      seg([x, 0, z], [x, C, z]);            // 立缝
    });

    /* ── 六块内容 ── */
    const panels = [];
    const spots = [];

    ZONES.forEach((z, i) => {
      const p = place(z);
      const size = SIZING[z.kind];
      const cy = size.bottom + size.height / 2;

      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: .82,
        metalness: .04,
        emissive: new THREE.Color(ACCENT_LIGHT),
        emissiveIntensity: 0,
        map: makeTexture(THREE, z, p.len, size.height),
      });

      // 真稿是异步到的，先挂示意底纹，加载完再换——不留白板
      if (z.art) {
        new THREE.TextureLoader().load(ART_DIR + z.art, tex => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          const boardAR = p.len / size.height;
          const imgAR = tex.image.width / tex.image.height;
          if (imgAR > boardAR) {
            tex.repeat.set(boardAR / imgAR, 1);
            tex.offset.set((1 - boardAR / imgAR) / 2, 0);
          } else {
            tex.repeat.set(1, imgAR / boardAR);
            tex.offset.set(0, (1 - imgAR / boardAR) / 2);
          }
          mat.map = tex;
          mat.needsUpdate = true;
        });
      }

      // 灯光柜是落地的柜子，不是贴墙的板，厚度给足
      const thick = z.kind === 'cabinet' ? .46 : .08;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(p.len, size.height, thick), mat);
      panel.position.set(
        p.x + p.nx * (thick / 2 + .012),
        cy,
        p.z + p.nz * (thick / 2 + .012));
      panel.rotation.y = p.rot;
      panel.userData.zone = i;
      scene.add(panel);
      panels.push(panel);

      // 一圈灯槽
      const edge = new THREE.Mesh(
        new THREE.PlaneGeometry(p.len + .1, size.height + .1),
        new THREE.MeshBasicMaterial({ color: 0x2f7bff, transparent: true, opacity: 0 }));
      edge.position.set(p.x + p.nx * .008, cy, p.z + p.nz * .008);
      edge.rotation.y = p.rot;
      scene.add(edge);
      panel.userData.edge = edge;

      // 电视那几块：板上再压一块真正的屏
      if (z.kind === 'screen') {
        const sw = Math.min(1.5, p.len * .74), sh = sw * .5625;
        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(sw, sh),
          new THREE.MeshBasicMaterial({ color: 0x1a2740 }));
        screen.position.set(
          p.x + p.nx * (thick + .03),
          cy + .12,
          p.z + p.nz * (thick + .03));
        screen.rotation.y = p.rot;
        scene.add(screen);
        panel.userData.screen = screen;
      }

      // 每块内容一盏射灯，从吊顶打下来
      const spot = new THREE.SpotLight(0xeaf0ff, 0, 9, Math.PI / 6, .55, 1.2);
      spot.position.set(p.x + p.nx * 1.25, ROOM.ceiling - .08, p.z + p.nz * 1.25);
      spot.target.position.set(p.x, cy, p.z);
      scene.add(spot, spot.target);
      spots.push(spot);

      const fixture = new THREE.Mesh(
        new THREE.CylinderGeometry(.07, .09, .1, 14),
        new THREE.MeshStandardMaterial({ color: 0x2a3242, roughness: .6 }));
      fixture.position.set(p.x + p.nx * 1.25, ROOM.ceiling - .05, p.z + p.nz * 1.25);
      scene.add(fixture);
    });

    /* ── 基础照明 ── */
    scene.add(new THREE.HemisphereLight(0xeaf0ff, 0x3c4160, 1.5));
    scene.add(new THREE.AmbientLight(0xffffff, .55));
    // 白墙 + 蓝灯槽已经够亮，中心补光只留一点压地面的反射
    const wash = new THREE.PointLight(0xdfe8ff, 3.0, 12, 2);
    wash.position.set(0, 1.6, 0);
    scene.add(wash);

    /* ── 相机：站在房间里，只转不绕 ──
       yaw = 0 面朝背墙（-z）。左右拖转 yaw（不夹逼，能整圈转过去
       看进门那面墙），上下拖转 pitch（夹逼，不至于翻过头）。 */
    // 默认沿房间长轴看过去：站在西端，朝东望。
    // 这个房间 11.4 × 5.1，很长很浅——
    //   第一版站正中面对背墙，背墙怼满整屏，像一面墙不像一个房间；
    //   第二版站角上斜看，地面和顶角斜切出画，像是没框好。
    // 顺着长轴看，背墙的板一块块退进去、尽头是东墙那块，
    // 两面墙同时在画面里，进深才出得来。
    const HOME_EYE = new THREE.Vector3(-hw + 1.0, 1.60, 0.55);
    const HOME_YAW = 1.30;
    const eye = HOME_EYE.clone();
    const wantEye = eye.clone();
    let yaw = HOME_YAW, pitch = -.05;
    let wantYaw = HOME_YAW, wantPitch = -.05;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const applyCamera = () => {
      camera.position.copy(eye);
      const cp = Math.cos(pitch);
      camera.lookAt(
        eye.x + Math.sin(yaw) * cp,
        eye.y + Math.sin(pitch),
        eye.z - Math.cos(yaw) * cp);
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
      wantYaw -= dx * .005;
      wantPitch = clamp(wantPitch - dy * .004, -.45, .34);
    });
    const endDrag = e => {
      if (!dragging) return;
      dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      shell.classList.remove('is-dragging');
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    /* ── 点内容选中 ── */
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

    /* ── 选中某块内容：灯亮、板发光、人走过去正对着它 ── */
    let active = 0;
    let allLights = false;
    let armed = false;

    // yaw 是连续量，转身要走最近的一边，
    // 不然从 -170° 转到 +170° 会绕一整圈回来
    const shortestYaw = (from, to) => {
      let d = (to - from) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      return from + d;
    };

    const focus = i => {
      active = i;
      if (!armed) { armed = true; return; }
      const z = ZONES[i];
      const p = place(z);
      const size = SIZING[z.kind];
      const cy = size.bottom + size.height / 2;

      // 站多远由这块内容自己的尺寸决定，不能写死。
      // 写死 2.6 米时，2.1 米宽的电视刚好，4.9 米长的灯箱直接怼满整屏。
      const vHalf = (camera.fov * Math.PI / 180) / 2;
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const need = Math.max(
        (p.len * .62) / Math.tan(hHalf),          // 横向留 24% 余量
        (size.height * .78) / Math.tan(vHalf));   // 纵向留 56%，上下要有墙
      // 再退也退不出房间：垂直于这面墙的那个方向只有这么长
      const room = (z.wall === 'west' || z.wall === 'east' ? ROOM.width : ROOM.depth) - .8;
      const stand = clamp(need, 1.9, room);

      wantEye.set(
        clamp(p.x + p.nx * stand, -hw + .55, hw - .55),
        1.55,
        clamp(p.z + p.nz * stand, -hd + .55, hd - .55));

      const dx = p.x - wantEye.x, dy = cy - 1.55, dz = p.z - wantEye.z;
      wantYaw = shortestYaw(wantYaw, Math.atan2(dx, -dz));
      wantPitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -.45, .34);
    };

    shell.__onSelect = focus;
    // initAxo() 在页面加载时就 select(0) 过一次了，那时 __onSelect 还没挂上，
    // 所以 armed 一直是 false——上一版因此把「不动镜头」用在了用户的第一次
    // 点击上，点第一下永远没反应。挂完回调立刻上膛：之后每一次都是用户点的。
    armed = true;

    const resetView = () => {
      wantEye.copy(HOME_EYE);
      wantYaw = shortestYaw(wantYaw, HOME_YAW);
      wantPitch = -.05;
    };

    /* ── 控件 ── */
    mount.insertAdjacentHTML('beforeend', `
      <div class="cs-room-ui">
        <button type="button" data-room-lights>全部点亮</button>
        <button type="button" data-room-reset>回到全景</button>
      </div>
      <p class="cs-room-hint" data-room-hint>拖动转头看四周 · 点内容走过去</p>
    `);
    const hint = mount.querySelector('[data-room-hint]');
    const lightsBtn = mount.querySelector('[data-room-lights]');
    mount.querySelector('[data-room-reset]').addEventListener('click', resetView);
    lightsBtn.addEventListener('click', () => {
      allLights = !allLights;
      lightsBtn.textContent = allLights ? '只亮当前' : '全部点亮';
      lightsBtn.classList.toggle('is-on', allLights);
    });
    el.addEventListener('pointerdown', () => hint?.classList.add('is-gone'), { once: true });

    /* ── 渲染循环，只在可见时跑 ── */
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; },
                             { threshold: 0.01 }).observe(mount);

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
    const screenOn = new THREE.Color(0x3f5fd8);
    const screenOff = new THREE.Color(0x141c2e);

    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;

      eye.lerp(wantEye, .06);
      yaw = lerp(yaw, wantYaw, .08);
      pitch = lerp(pitch, wantPitch, .08);
      applyCamera();

      panels.forEach((p, i) => {
        const on = allLights || i === active;
        p.material.emissiveIntensity = lerp(p.material.emissiveIntensity, on ? .09 : 0, .09);
        p.userData.edge.material.opacity = lerp(p.userData.edge.material.opacity, on ? .85 : .16, .09);
        spots[i].intensity = lerp(spots[i].intensity, on ? 11 : 4, .09);
        const s = p.userData.screen;
        if (s) s.material.color.lerp(on ? screenOn : screenOff, .09);
      });

      renderer.render(scene, camera);
    };

    applyCamera();
    tick();
    shell.classList.add('is-3d');

    // 头部文案跟着换：3D 起来之后这里已经不是平面图了
    const head = shell.querySelector('.cs-axo-head b');
    const headHint = shell.querySelector('[data-axo-hint]');
    if (head) head.textContent = '展厅 3D · 按最终布局搭建';
    if (headHint) headHint.textContent = '拖动转头 · 点内容或图例走过去';

    // 画布和平面图高度不一样，切换那一下文档会长一截。
    // ScrollTrigger 的 start/end 是测一次就缓存的，别留这个雷。
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
