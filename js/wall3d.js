/* ============================================================
   单面墙 3D — 把一张施工图按真实毫米立起来
   ============================================================
   和 showroom3d.js 的分工：那个搭的是「展厅」这一个房间，
   这个搭的是「某一面墙」。前台形象墙不在展厅里，硬塞进那个
   房间是错的——所以单独一个查看器，一面墙一个。

   为什么值得做：设计稿是平的，墙是立的。招聘方想知道的是
   「这张稿子挂上去之后，站在门口看是什么比例」。把 AI 文件里
   量到的毫米直接喂给三维，比放两张图更有说服力。

   一面墙 = 一段 markup，没有第二处要改：
     <div data-wall
          data-wall-size="4050,2850"        墙宽,墙高（mm）
          data-wall-art="…/entry-logo.webp" 带透明通道的稿子
          data-wall-art-box="1092,574,1872,370"
                                            稿子左上角 x,y + 宽,高
                                            （mm，y 从墙顶往下算）
          data-wall-deco="triangles"        可选：墙面装饰
          data-wall-dims="1880:w:标识总宽|…" 可选：要标的尺寸
     >

   几个和 showroom3d 一致的约束：
   1. Three.js 懒加载，滚到跟前才下；两个查看器共用同一份缓存。
   2. 滚轮永远归页面，视角只用拖拽改。
   3. WebGL 起不来就安静退场，底下那张实景照继续顶着。
   ============================================================ */

(() => {
  const mounts = [...document.querySelectorAll('[data-wall]')];
  if (!mounts.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const mm = v => v / 1000;                 // 图上是毫米，场里是米
  const ACCENT = 0x4265f5;
  const ACCENT_LIGHT = 0x8ca4ff;

  /* ── 墙面装饰：前台那面墙顶上的三角形穿孔 ──
     实景里它是一片从上往下逐渐稀疏的白色三角，背后打光。
     这里用 canvas 现画一张带透明度的图，叠在墙上发光——
     不引外部贴图，改密度只改下面三个数。 */
  function makeDeco(THREE, kind, wMM, hMM) {
    if (kind !== 'triangles') return null;
    const cv = document.createElement('canvas');
    cv.width = 1600;
    cv.height = Math.round(1600 * (hMM / wMM));
    const c = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const PXMM = W / wMM;       // 一毫米几个像素

    const BAND = 0.40;          // 只占墙面上方这么多
    const COUNT = 720;          // 三角总数
    const SEED = 20220618;      // 固定种子：每次刷新长得一样

    let s = SEED;
    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

    for (let i = 0; i < COUNT; i++) {
      // 越往下越稀：把均匀分布压向顶部
      const y = Math.pow(rnd(), 2.3) * H * BAND;
      const x = rnd() * W;
      const fade = 1 - (y / (H * BAND));
      // 实物是 30–70mm 的小三角，不是色块
      const size = (30 + rnd() * 40) * PXMM;
      const up = rnd() > 0.42;

      c.fillStyle = `rgba(255,255,255,${(0.34 + rnd() * 0.5) * (0.16 + fade * 0.84)})`;
      c.beginPath();
      if (up) {
        c.moveTo(x, y - size * 0.58);
        c.lineTo(x + size * 0.58, y + size * 0.42);
        c.lineTo(x - size * 0.58, y + size * 0.42);
      } else {
        c.moveTo(x, y + size * 0.58);
        c.lineTo(x + size * 0.58, y - size * 0.42);
        c.lineTo(x - size * 0.58, y - size * 0.42);
      }
      c.closePath();
      c.fill();
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /* ── 墙面本身：不是一块纯色板，有烤漆板的竖向拼缝 ──
     少了这几条缝，墙就没有尺度感——看不出这面墙有四米宽。 */
  function makeWallTex(THREE, wMM, hMM, seams) {
    const cv = document.createElement('canvas');
    cv.width = 1600;
    cv.height = Math.round(1600 * (hMM / wMM));
    const c = cv.getContext('2d');
    c.fillStyle = '#eef1f6';
    c.fillRect(0, 0, cv.width, cv.height);
    c.strokeStyle = 'rgba(120,132,152,.26)';
    c.lineWidth = Math.max(1, cv.width / wMM * 6);   // 缝宽 6mm
    seams.forEach(mmX => {
      const x = (mmX / wMM) * cv.width;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, cv.height);
      c.stroke();
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /* ── 背发光的光晕：径向渐变，不能是一块方的 ── */
  function makeGlowTex(THREE) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0,   'rgba(255,255,255,.95)');
    g.addColorStop(.34, 'rgba(226,236,255,.42)');
    g.addColorStop(.68, 'rgba(200,216,255,.10)');
    g.addColorStop(1,   'rgba(190,208,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ── 尺寸标注的文字：画进 canvas 再当 sprite 贴 ── */
  function makeLabel(THREE, text) {
    const cv = document.createElement('canvas');
    const pad = 12, fs = 46;
    const c = cv.getContext('2d');
    c.font = `500 ${fs}px system-ui, sans-serif`;
    cv.width = Math.ceil(c.measureText(text).width) + pad * 2;
    cv.height = fs + pad * 2;

    const c2 = cv.getContext('2d');
    c2.fillStyle = 'rgba(5,7,10,.82)';
    // roundRect 在老一点的 Safari 上没有，缺了就退成直角——
    // 为一个圆角把整个查看器崩掉不值得
    if (c2.roundRect) {
      c2.beginPath();
      c2.roundRect(0, 0, cv.width, cv.height, 10);
      c2.fill();
    } else {
      c2.fillRect(0, 0, cv.width, cv.height);
    }
    c2.font = `500 ${fs}px system-ui, sans-serif`;
    c2.fillStyle = '#cfd9ff';
    c2.textBaseline = 'middle';
    c2.fillText(text, pad, cv.height / 2 + 1);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthTest: false,
    }));
    sp.scale.set(cv.width / 620, cv.height / 620, 1);
    sp.renderOrder = 12;
    return sp;
  }

  /* ── 主体 ── */
  async function build(el) {
    let THREE;
    try {
      THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js');
    } catch {
      return false;
    }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    } catch {
      return false;
    }

    /* 配置全部从 markup 读 */
    const [WMM, HMM] = el.dataset.wallSize.split(',').map(Number);
    const W = mm(WMM), H = mm(HMM);
    const artBox = (el.dataset.wallArtBox || '').split(',').map(Number);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e15);
    const camera = new THREE.PerspectiveCamera(42, 16 / 10, 0.05, 60);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    el.appendChild(renderer.domElement);

    /* ── 墙 ── */
    // 实景是暖白烤漆，不是纯白：纯白在 ACES 下会顶到天花板，
    // 标识和穿孔就没有对比度了。
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: .74, metalness: .02,
      map: makeWallTex(THREE, WMM, HMM, [WMM * .28, WMM * .5, WMM * .72]),
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat);
    wall.position.set(0, H / 2, 0);
    scene.add(wall);

    // 两侧向后收的翼墙：实景里这面墙是弧形收进去的。
    // 没有它，这面墙看着像一块浮在黑里的板子，读不出「空间」。
    const WING = { half: 1.35, angle: 0.46 };
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(
        new THREE.PlaneGeometry(WING.half * 2, H),
        new THREE.MeshStandardMaterial({ color: 0xc9cfd9, roughness: .8 }));
      // 内边要正好落在主墙端头 (±W/2, 0)，否则两块板中间会裂条黑缝
      wing.position.set(
        side * (W / 2 + WING.half * Math.cos(WING.angle)),
        H / 2,
        -WING.half * Math.sin(WING.angle));
      wing.rotation.y = side * WING.angle;
      scene.add(wing);
    });

    // 地面：实景是抛光大理石，给一点镜面感，墙脚才站得住
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 8, 14),
      new THREE.MeshStandardMaterial({ color: 0x2b3140, roughness: .28, metalness: .35 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 7);
    scene.add(floor);

    // 墙脚压暗的一条，替代做不起的接触阴影
    const skirt = new THREE.Mesh(
      new THREE.PlaneGeometry(W, .1),
      new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 1 }));
    skirt.position.set(0, .05, .01);
    scene.add(skirt);

    /* ── 墙面穿孔装饰 ── */
    const decoTex = makeDeco(THREE, el.dataset.wallDeco, WMM, HMM);
    if (decoTex) {
      const deco = new THREE.Mesh(
        new THREE.PlaneGeometry(W, H),
        new THREE.MeshBasicMaterial({
          map: decoTex, transparent: true, opacity: .58,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
      deco.position.set(0, H / 2, .004);
      scene.add(deco);
    }

    /* ── 标识 ──
       实景是背发光字：字是实的，光从背后洇出来一圈。
       所以先铺一层洇开的光晕，再把稿子压在上面。 */
    if (el.dataset.wallArt && artBox.length === 4) {
      const [axMM, ayMM, awMM, ahMM] = artBox;
      const aw = mm(awMM), ah = mm(ahMM);
      // 图上 x 从墙左边算、y 从墙顶往下算；场里原点在墙底中央
      const acx = mm(axMM) + aw / 2 - W / 2;
      const acy = H - mm(ayMM) - ah / 2;

      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(aw * 1.5, ah * 3.4),
        new THREE.MeshBasicMaterial({
          map: makeGlowTex(THREE), transparent: true, opacity: .5,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }));
      glow.position.set(acx, acy, .006);
      scene.add(glow);

      // 稿子用 Basic：这是印刷/烤漆的成品色，不该再被场里的灯改一遍
      const artMat = new THREE.MeshBasicMaterial({
        transparent: true, depthWrite: false, opacity: 0,
      });
      const art = new THREE.Mesh(new THREE.PlaneGeometry(aw, ah), artMat);
      art.position.set(acx, acy, .012);
      scene.add(art);

      new THREE.TextureLoader().load(el.dataset.wallArt, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        artMat.map = tex;
        artMat.opacity = 1;
        artMat.needsUpdate = true;
      });
    }

    /* ── 尺寸标注（可切换） ──
       data-wall-dims 每条：值mm : 方向h|v : 起点x,起点y : 长度 : 文案
       坐标同样是「x 从左、y 从墙顶往下」的毫米。 */
    const dims = new THREE.Group();
    dims.visible = false;
    scene.add(dims);

    // 展厅那个查看器的墙是深的，用浅蓝线；这面墙是白的，
    // 同一支笔画上去就消失了——标注得用实的品牌蓝。
    const lineMat = new THREE.LineBasicMaterial({
      color: ACCENT, transparent: true, opacity: .95, depthTest: false,
    });
    const seg = (x1, y1, x2, y2) => {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(mm(x1) - W / 2, H - mm(y1), .02),
        new THREE.Vector3(mm(x2) - W / 2, H - mm(y2), .02),
      ]);
      const l = new THREE.Line(g, lineMat);
      l.renderOrder = 11;
      dims.add(l);
    };

    (el.dataset.wallDims || '').split('|').filter(Boolean).forEach(spec => {
      const [dir, x, y, len, text] = spec.split(':');
      const X = Number(x), Y = Number(y), L = Number(len);
      const tick = 120;
      const sp = makeLabel(THREE, text);
      if (dir === 'h') {
        seg(X, Y, X + L, Y);
        seg(X, Y - tick, X, Y + tick);
        seg(X + L, Y - tick, X + L, Y + tick);
        sp.position.set(mm(X + L / 2) - W / 2, H - mm(Y) + .14, .03);
      } else {
        seg(X, Y, X, Y + L);
        seg(X - tick, Y, X + tick, Y);
        seg(X - tick, Y + L, X + tick, Y + L);
        // 靠右半边的竖标注往右让，不然标签压在标识上
        const side = X > WMM / 2 ? 1 : -1;
        sp.position.set(mm(X) - W / 2 + side * (sp.scale.x / 2 + .12),
                        H - mm(Y + L / 2), .03);
      }
      dims.add(sp);
    });

    /* ── 灯 ──
       实景的光是「顶上一大圈发光顶棚 + 墙面自己背发光」，
       没有硬射灯，所以这里也不打硬光。 */
    scene.add(new THREE.HemisphereLight(0xe6ecff, 0x22293a, 2.0));
    scene.add(new THREE.AmbientLight(0xffffff, .62));

    const key = new THREE.DirectionalLight(0xf2f6ff, 1.35);
    key.position.set(1.6, 5.2, 6.4);
    scene.add(key);

    // 顶上那圈发光椭圆：实景里它是整个前台最亮的东西。
    // 但光板得先有个顶棚长在上面——第一版让它单独飘着，
    // 从下往上看就是一块悬空的灰板，比不放还糟。
    const CEIL_Y = H + .62;
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(W + 10, 15),
      new THREE.MeshStandardMaterial({ color: 0x848b99, roughness: .9 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, CEIL_Y, 4);
    scene.add(ceiling);

    const ring = new THREE.Mesh(
      new THREE.CircleGeometry(1.55, 56),
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ring.rotation.x = Math.PI / 2;
    ring.scale.set(1.65, 1, 1);
    ring.position.set(0, CEIL_Y - .02, 2.5);
    scene.add(ring);

    const ceilLight = new THREE.PointLight(0xeef3ff, 30, 18, 2);
    ceilLight.position.set(0, CEIL_Y - .25, 2.5);
    scene.add(ceilLight);

    // 标识背后洇出来的那点光。
    // 射程必须掐死：这里不做阴影，灯是能穿墙的——
    // 第一版 7 米射程，蓝光绕到墙前面，地上多出一摊蓝斑。
    const back = new THREE.PointLight(ACCENT, 4.2, 1.9, 2);
    back.position.set(0, H * .62, -.42);
    scene.add(back);

    /* ── 相机轨道：只拖拽，滚轮归页面 ── */
    const target = new THREE.Vector3(0, H * .52, 0);
    const view = { az: -0.20, pol: Math.PI / 2 - 0.04, dist: 6.5 };
    const wanted = { ...view };

    const apply = () => {
      const { az, pol, dist } = view;
      camera.position.set(
        target.x + dist * Math.sin(pol) * Math.sin(az),
        target.y + dist * Math.cos(pol),
        target.z + dist * Math.sin(pol) * Math.cos(az));
      camera.lookAt(target);
    };

    let drag = null;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    el.addEventListener('pointerdown', e => {
      // 按钮压在画布上，pointerdown 会冒泡到这里。
      // 一旦 setPointerCapture，pointerup 就被改派给画布，
      // 按钮永远收不到 click——尺寸键点了没反应就是这么来的。
      if (e.target.closest('.cs-room-ui')) return;
      drag = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
    });
    el.addEventListener('pointermove', e => {
      if (!drag) return;
      wanted.az = clamp(wanted.az - (e.clientX - drag.x) * .006, -1.02, 1.02);
      wanted.pol = clamp(wanted.pol - (e.clientY - drag.y) * .005,
                         Math.PI / 2 - .42, Math.PI / 2 + .30);
      drag = { x: e.clientX, y: e.clientY };
    });
    const endDrag = () => { drag = null; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    /* ── 尺寸开关 ── */
    const btn = el.parentElement.querySelector('[data-wall-toggle]');
    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        dims.visible = !dims.visible;
        btn.classList.toggle('is-on', dims.visible);
        btn.setAttribute('aria-pressed', String(dims.visible));
      });
    }
    const hint = el.parentElement.querySelector('[data-wall-hint]');
    if (hint) {
      const kill = () => hint.classList.add('is-gone');
      el.addEventListener('pointerdown', kill, { once: true });
      setTimeout(kill, 5200);
    }

    /* ── 尺寸自适应 ── */
    const resize = () => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(el);
    resize();

    /* ── 只在看得见的时候画 ── */
    let visible = false;
    new IntersectionObserver(en => { visible = en[0].isIntersecting; },
                             { rootMargin: '120px 0px' }).observe(el);

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;
      view.az = lerp(view.az, wanted.az, .1);
      view.pol = lerp(view.pol, wanted.pol, .1);
      view.dist = lerp(view.dist, wanted.dist, .1);
      apply();
      renderer.render(scene, camera);
    };
    apply();
    tick();

    el.__dims = dims; el.__scene = scene;
    el.closest('.cs-wall')?.classList.add('is-3d');
    // 画布替掉底图后盒子高度不变（aspect-ratio 锁死的），
    // 但 ScrollTrigger 的起止是量一次就存着的，稳妥起见让它重算。
    window.ScrollTrigger?.refresh();
    return true;
  }

  /* ── 滚到跟前才下 Three ── */
  mounts.forEach(el => {
    const arm = new IntersectionObserver(en => {
      if (!en[0].isIntersecting) return;
      arm.disconnect();
      build(el).catch(() => {});
    }, { rootMargin: '600px 0px' });
    arm.observe(el);
  });
})();
