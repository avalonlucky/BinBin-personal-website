/* ============================================================
   展厅 3D — 不设预算的重做版
   ============================================================
   这一版不是复刻实物。用户的原话：「假如现在给你充足的预算，
   让你重新去改造这个展厅」「这是拿去给面试官看的，越高大上越好」。
   实物为了控成本，用的是均匀铺满的冷蓝灯 + 白色亚克力造型板，
   拍出来像消毒间。所以这里保留他真实的**布局和内容**，
   把**材质与光**整个换掉。

   设计上只做三件事，其余全部让路：
   1. **暗场。** 围合近黑，眼睛没有别处可去，只能看内容。
      均匀照亮是展厅设计里最省事也最廉价的做法。
   2. **光当材料用。** 不打泛光，只有三样发光体：吊顶的光槽、
      内容板自己的背发光、以及擦着内容打下来的窄光。
   3. **地面要照出东西来。** 一块能映出发光板的地面，
      是「造价高」这件事最省钱的表达——真实平面反射，不是贴图。

   技术上：three 主包必到；Reflector / 辉光是 addons，
   拉不到就自动降级成不带反射和辉光的版本，出图照旧。
   小屏主动关掉这两样（都是全屏级开销）。

   布局和分区仍然来自用户手绘的最终布局草图，见 HANDOFF。
   ============================================================ */

(() => {
  const mount = document.querySelector('[data-room]');
  const shell = document.querySelector('[data-axo]');
  if (!mount || !shell) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── 房间（米）──
     进深和层高比实物放大了一点：暗场需要距离才拉得开层次，
     3.6 米的吊顶也比实物的 3.0 米更像一个正经展厅。 */
  const ROOM = { width: 11.4, depth: 6.4, ceiling: 3.6 };

  const ART_DIR = '../assets/work/culture-wall/room/';
  const ZONES = [
    { key: 'demo',     wall: 'back',  from: 1.55, to: 3.70, kind: 'panel',    label: '产品服务',     en: 'PRODUCT SERVICE', art: null },
    { key: 'awards',   wall: 'back',  from: 4.65, to: 6.75, kind: 'panel',    label: '荣誉资质',     en: 'QUALIFICATION',   art: null },
    { key: 'solution', wall: 'back',  from: 7.75, to: 9.85, kind: 'panel',    label: '解决方案',     en: 'SOLUTIONS',       art: null },
    { key: 'product',  wall: 'west',  from: 1.60, to: 4.60, kind: 'cabinet',  label: '样机展示',     en: 'PROTOTYPE',       art: null },
    { key: 'film',     wall: 'east',  from: 1.40, to: 4.40, kind: 'screen',   label: '宣传片',       en: 'FILM',            art: null },
    { key: 'tech',     wall: 'front', from: 0.60, to: 3.90, kind: 'lightbox', label: '技术演进灯箱', en: 'EVOLUTION',       art: 'art-tech.webp' },
  ];

  const SIZING = {
    panel:    { bottom: 0.72, height: 1.70 },
    screen:   { bottom: 0.72, height: 1.70 },
    lightbox: { bottom: 0.55, height: 2.10 },
    cabinet:  { bottom: 0.28, height: 2.10 },
  };

  const WARM = 0xffd9a8;      // 暖侧：光槽和窄光
  const COOL = 0x6f9bff;      // 冷侧：只用在内容自己的辉光上

  /* ── 背发光洇在墙上的那圈光 ──
     一块平的加色方块在暗场里看着就是实心蓝色板，不是光。
     必须是径向渐变，边缘化掉。 */
  function makeGlowTex(THREE) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0,   'rgba(190,214,255,.95)');
    g.addColorStop(.30, 'rgba(140,180,255,.42)');
    g.addColorStop(.62, 'rgba(110,155,255,.12)');
    g.addColorStop(1,   'rgba(110,155,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ── 墙位 → 世界坐标 ── */
  function place(z) {
    const mid = (z.from + z.to) / 2, len = z.to - z.from;
    const hw = ROOM.width / 2, hd = ROOM.depth / 2;
    switch (z.wall) {
      case 'back':  return { x: mid - hw, z: -hd,      rot: 0,            len, nx: 0,  nz: 1 };
      case 'front': return { x: mid - hw, z: hd,       rot: Math.PI,      len, nx: 0,  nz: -1 };
      case 'west':  return { x: -hw,      z: mid - hd, rot: Math.PI / 2,  len, nx: 1,  nz: 0 };
      default:      return { x: hw,       z: mid - hd, rot: -Math.PI / 2, len, nx: -1, nz: 0 };
    }
  }

  /* ── 没有设计稿的那几块，画一版像样的版面顶上 ──
     深底 + 细线 + 大留白，和真稿（技术演进那张）同一个调子，
     不至于一块真稿旁边杵着几块灰方块。 */
  function makeTexture(THREE, z, w, h) {
    const H = 512, W = Math.round(H * (w / h));
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');

    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0b1426');
    g.addColorStop(1, '#07101f');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    c.strokeStyle = 'rgba(150,186,255,.30)';
    c.lineWidth = 2;
    c.strokeRect(H * .07, H * .07, W - H * .14, H - H * .14);

    const pad = H * .13;
    c.fillStyle = '#eaf1ff';
    c.font = `600 ${Math.round(H * .105)}px "PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`;
    c.textBaseline = 'top';
    c.fillText(z.label, pad, pad);
    c.fillStyle = 'rgba(150,186,255,.72)';
    c.font = `500 ${Math.round(H * .048)}px system-ui,sans-serif`;
    c.fillText(z.en, pad, pad + H * .135);
    c.fillStyle = 'rgba(120,160,255,.85)';
    c.fillRect(pad, pad + H * .215, H * .34, 3);

    const top = pad + H * .30;
    const boxW = W - pad * 2, boxH = H - top - pad * .8;

    if (z.key === 'awards') {
      const cols = 4, rows = 3, gx = boxW * .028, gy = boxH * .07;
      const cw = (boxW - gx * (cols - 1)) / cols;
      const ch = (boxH - gy * (rows - 1)) / rows;
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const first = r === 0 && k === 0;
        c.fillStyle = first ? 'rgba(255,217,168,.24)' : 'rgba(190,214,255,.11)';
        c.fillRect(pad + k * (cw + gx), top + r * (ch + gy), cw, ch);
        c.strokeStyle = first ? 'rgba(255,217,168,.7)' : 'rgba(150,186,255,.28)';
        c.lineWidth = first ? 2.4 : 1.2;
        c.strokeRect(pad + k * (cw + gx), top + r * (ch + gy), cw, ch);
      }
    } else if (z.key === 'demo') {
      c.fillStyle = 'rgba(190,214,255,.09)';
      c.fillRect(pad, top, boxW, boxH);
      c.strokeStyle = 'rgba(150,186,255,.34)'; c.lineWidth = 1.4;
      c.strokeRect(pad, top, boxW, boxH);
      c.fillStyle = 'rgba(150,186,255,.30)';
      c.fillRect(pad, top, boxW, boxH * .12);
      for (let i = 0; i < 9; i++) {
        const bh = boxH * (.16 + ((i * 37) % 53) / 100);
        c.fillStyle = i === 4 ? 'rgba(255,217,168,.75)' : 'rgba(150,186,255,.42)';
        c.fillRect(pad + boxW * (.06 + i * .102), top + boxH * .86 - bh, boxW * .062, bh);
      }
    } else if (z.key === 'solution') {
      const cx = pad + boxW * .5, cy = top + boxH * .5, R = Math.min(boxW, boxH) * .34;
      c.strokeStyle = 'rgba(150,186,255,.34)'; c.lineWidth = 1.4;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke();
        c.fillStyle = 'rgba(190,214,255,.55)';
        c.beginPath(); c.arc(x, y, R * .14, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = 'rgba(255,217,168,.85)';
      c.beginPath(); c.arc(cx, cy, R * .2, 0, Math.PI * 2); c.fill();
    } else if (z.key === 'film') {
      c.fillStyle = 'rgba(6,12,24,.9)';
      c.fillRect(pad, top, boxW, boxH);
      c.strokeStyle = 'rgba(150,186,255,.34)'; c.lineWidth = 1.4;
      c.strokeRect(pad, top, boxW, boxH);
      const cx = pad + boxW * .5, cy = top + boxH * .5, r = Math.min(boxW, boxH) * .17;
      c.fillStyle = 'rgba(255,217,168,.85)';
      c.beginPath();
      c.moveTo(cx - r * .5, cy - r * .8);
      c.lineTo(cx + r * .85, cy);
      c.lineTo(cx - r * .5, cy + r * .8);
      c.closePath(); c.fill();
    } else if (z.key === 'product') {
      for (let i = 0; i < 3; i++) {
        const y = top + boxH * (.06 + i * .32);
        c.fillStyle = 'rgba(150,186,255,.20)';
        c.fillRect(pad, y + boxH * .24, boxW, 3);
        for (let k = 0; k < 3; k++) {
          c.fillStyle = 'rgba(190,214,255,.14)';
          c.fillRect(pad + boxW * (.06 + k * .31), y, boxW * .24, boxH * .22);
        }
      }
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  /* ── 主体 ── */
  async function build() {
    let THREE;
    try {
      THREE = await import('three');
    } catch {
      try { THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js'); }
      catch { return false; }
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      return false;
    }

    // 反射和辉光都是全屏级开销，小屏一律不上
    const rich = window.innerWidth >= 820;
    let Reflector = null, EffectComposer = null, RenderPass = null, UnrealBloomPass = null;
    if (rich) {
      try {
        const mods = await Promise.all([
          import('three/addons/objects/Reflector.js'),
          import('three/addons/postprocessing/EffectComposer.js'),
          import('three/addons/postprocessing/RenderPass.js'),
          import('three/addons/postprocessing/UnrealBloomPass.js'),
        ]);
        Reflector = mods[0].Reflector;
        EffectComposer = mods[1].EffectComposer;
        RenderPass = mods[2].RenderPass;
        UnrealBloomPass = mods[3].UnrealBloomPass;
      } catch {
        Reflector = EffectComposer = RenderPass = UnrealBloomPass = null;
      }
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c);
    scene.fog = new THREE.Fog(0x05070c, 10, 28);

    const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 60);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    mount.appendChild(renderer.domElement);

    const hw = ROOM.width / 2, hd = ROOM.depth / 2, C = ROOM.ceiling;

    /* ── 围合：近黑哑光 ── */
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x14161d, roughness: .92, metalness: .04, side: THREE.BackSide,
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(ROOM.width, C, ROOM.depth), shellMat);
    box.position.y = C / 2;
    scene.add(box);

    /* ── 地面：真实平面反射 ──
       这一块是整个「造价感」的来源。拉不到 Reflector 就退成
       高金属度的深色地面：映不出东西，至少不是一块死板。 */
    if (Reflector) {
      const mirror = new Reflector(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), {
        textureWidth: 1024, textureHeight: 1024, color: 0x2a3040,
      });
      mirror.rotation.x = -Math.PI / 2;
      mirror.position.y = 0.001;
      scene.add(mirror);
      // 压一层半透明深色，把镜面压成「抛光石材」而不是「镜子」
      const veil = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
        new THREE.MeshBasicMaterial({ color: 0x0a0d14, transparent: true, opacity: .5 }));
      veil.rotation.x = -Math.PI / 2;
      veil.position.y = 0.004;
      scene.add(veil);
    } else {
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
        new THREE.MeshStandardMaterial({ color: 0x0e1118, roughness: .18, metalness: .85 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);
    }

    /* ── 吊顶：三条内嵌暖光槽 ── */
    const coffer = new THREE.MeshBasicMaterial({ color: 0xfff0dc });
    [-2.1, 0, 2.1].forEach(z => {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width - 1.6, .085), coffer);
      s.rotation.x = Math.PI / 2;
      s.position.set(0, C - .02, z);
      scene.add(s);
      const l = new THREE.PointLight(WARM, 5.5, 10, 1.8);
      l.position.set(0, C - .35, z);
      scene.add(l);
    });

    /* ── 墙脚一道暖色洗光线 ── */
    const baseMat = new THREE.MeshBasicMaterial({ color: 0xf6e2c6 });
    [[ROOM.width, 0, -hd + .015, 0], [ROOM.depth, -hw + .015, 0, Math.PI / 2],
     [ROOM.depth, hw - .015, 0, -Math.PI / 2]].forEach(([len, x, z, rot]) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(len, .014), baseMat);
      b.position.set(x, .05, z);
      b.rotation.y = rot;
      scene.add(b);
    });

    /* ── 六块内容：背发光，浮在墙前 ── */
    const panels = [];
    const spots = [];
    const glows = [];
    const glowTex = makeGlowTex(THREE);

    ZONES.forEach((z, i) => {
      const p = place(z);
      const size = SIZING[z.kind];
      const cy = size.bottom + size.height / 2;
      const off = .11;                     // 离墙的缝，光从这里洇出来

      const tex = makeTexture(THREE, z, p.len, size.height);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff, roughness: .55, metalness: .05,
        map: tex, emissiveMap: tex,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: .55,
      });
      mat.userData.emiBase = .55;

      if (z.art) {
        new THREE.TextureLoader().load(ART_DIR + z.art, t => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = renderer.capabilities.getMaxAnisotropy();
          const boardAR = p.len / size.height;
          const imgAR = t.image.width / t.image.height;
          if (imgAR > boardAR) {
            t.repeat.set(boardAR / imgAR, 1);
            t.offset.set((1 - boardAR / imgAR) / 2, 0);
          } else {
            t.repeat.set(1, imgAR / boardAR);
            t.offset.set(0, (1 - imgAR / boardAR) / 2);
          }
          mat.map = t; mat.emissiveMap = t;
          mat.emissiveIntensity = .72;
          mat.userData.emiBase = .72;      // 真稿本身够亮，压一点免得糊
          mat.needsUpdate = true;
        });
      }

      const thick = z.kind === 'cabinet' ? .34 : .07;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(p.len, size.height, thick), mat);
      panel.position.set(p.x + p.nx * (off + thick / 2), cy, p.z + p.nz * (off + thick / 2));
      panel.rotation.y = p.rot;
      panel.userData.zone = i;
      scene.add(panel);
      panels.push(panel);

      // 背后洇在墙上的一圈光
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(p.len + 1.9, size.height + 1.9),
        new THREE.MeshBasicMaterial({
          map: glowTex, color: COOL, transparent: true, opacity: .1,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
      glow.position.set(p.x + p.nx * .01, cy, p.z + p.nz * .01);
      glow.rotation.y = p.rot;
      scene.add(glow);
      glows.push(glow);

      // 板下一条暖色反光边，把板从墙上「托」起来
      const lip = new THREE.Mesh(
        new THREE.PlaneGeometry(p.len, .014),
        new THREE.MeshBasicMaterial({ color: 0xffc98a }));
      lip.position.set(p.x + p.nx * (off + thick), size.bottom - .03, p.z + p.nz * (off + thick));
      lip.rotation.y = p.rot;
      scene.add(lip);

      // 擦着板面打下来的窄光
      const spot = new THREE.SpotLight(0xfff3e4, 0, 8, Math.PI / 9, .7, 1.4);
      spot.position.set(p.x + p.nx * .75, C - .12, p.z + p.nz * .75);
      spot.target.position.set(p.x + p.nx * .2, cy + .2, p.z + p.nz * .2);
      scene.add(spot, spot.target);
      spots.push(spot);
    });

    /* ── 基础照明：只给一点。暗场靠的是「不照」 ── */
    scene.add(new THREE.HemisphereLight(0x9fb6ff, 0x0a0d14, .48));
    scene.add(new THREE.AmbientLight(0xffffff, .18));

    /* ── 辉光 ── */
    let composer = null;
    if (EffectComposer && RenderPass && UnrealBloomPass) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.44, 0.60, 0.80));
    }

    /* ── 相机：站在房间里，只转不绕 ── */
    const HOME_EYE = new THREE.Vector3(-hw + 1.75, 1.60, hd - 1.15);
    const HOME_YAW = 1.06;
    const eye = HOME_EYE.clone();
    const wantEye = eye.clone();
    let yaw = HOME_YAW, pitch = -.03;
    let wantYaw = HOME_YAW, wantPitch = -.03;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const applyCamera = () => {
      camera.position.copy(eye);
      const cp = Math.cos(pitch);
      camera.lookAt(eye.x + Math.sin(yaw) * cp, eye.y + Math.sin(pitch), eye.z - Math.cos(yaw) * cp);
    };

    let dragging = false, lastX = 0, lastY = 0, moved = 0;
    const el = renderer.domElement;
    el.style.touchAction = 'pan-y';

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
      wantPitch = clamp(wantPitch - dy * .004, -.42, .32);
    });
    const endDrag = e => {
      if (!dragging) return;
      dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      shell.classList.remove('is-dragging');
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    el.addEventListener('click', e => {
      if (moved > 6) return;
      const r = el.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(panels, false)[0];
      if (hit) shell.__select?.(hit.object.userData.zone);
    });

    /* ── 选中：走过去，正对着看 ── */
    let active = 0, allLights = false, armed = false;
    const shortestYaw = (from, to) => {
      let d = (to - from) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      return from + d;
    };

    const focus = i => {
      active = i;
      if (!armed) { armed = true; return; }
      const z = ZONES[i], p = place(z), size = SIZING[z.kind];
      const cy = size.bottom + size.height / 2;
      // 站多远由这块内容自己的尺寸决定；写死会让长板怼满整屏
      const vHalf = (camera.fov * Math.PI / 180) / 2;
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const need = Math.max((p.len * .62) / Math.tan(hHalf),
                            (size.height * .80) / Math.tan(vHalf));
      const room = (z.wall === 'west' || z.wall === 'east' ? ROOM.width : ROOM.depth) - .9;
      const stand = clamp(need, 2.0, room);
      wantEye.set(clamp(p.x + p.nx * stand, -hw + .6, hw - .6), 1.58,
                  clamp(p.z + p.nz * stand, -hd + .6, hd - .6));
      const dx = p.x - wantEye.x, dy = cy - 1.58, dz = p.z - wantEye.z;
      wantYaw = shortestYaw(wantYaw, Math.atan2(dx, -dz));
      wantPitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -.42, .32);
    };
    shell.__onSelect = focus;
    // initAxo() 加载时就 select(0) 过一次，那时回调还没挂上，
    // 所以挂完立刻上膛：之后每一次都是用户点的
    armed = true;

    const resetView = () => {
      wantEye.copy(HOME_EYE);
      wantYaw = shortestYaw(wantYaw, HOME_YAW);
      wantPitch = -.03;
    };

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

    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 }).observe(mount);

    const resize = () => {
      const r = mount.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      composer?.setSize(r.width, r.height);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(mount);
    resize();

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;

      eye.lerp(wantEye, .06);
      yaw = lerp(yaw, wantYaw, .08);
      pitch = lerp(pitch, wantPitch, .08);
      applyCamera();

      panels.forEach((p, i) => {
        const on = allLights || i === active;
        const base = p.material.userData.emiBase;
        p.material.emissiveIntensity =
          lerp(p.material.emissiveIntensity, on ? base + .30 : base * .62, .08);
        glows[i].material.opacity = lerp(glows[i].material.opacity, on ? .28 : .08, .08);
        spots[i].intensity = lerp(spots[i].intensity, on ? 9 : 2.4, .08);
      });

      (composer || renderer).render(scene, camera);
    };

    applyCamera();
    tick();
    shell.classList.add('is-3d');

    const head = shell.querySelector('.cs-axo-head b');
    const headHint = shell.querySelector('[data-axo-hint]');
    if (head) head.textContent = '展厅 3D · 不设预算的重做版';
    if (headHint) headHint.textContent = '拖动转头 · 点内容或图例走过去';

    window.ScrollTrigger?.refresh();
    return true;
  }

  const arm = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    arm.disconnect();
    build().then(ok => { if (!ok) shell.classList.add('is-3d-failed'); });
  }, { rootMargin: '600px 0px' });
  arm.observe(shell);
})();
