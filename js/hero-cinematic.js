(function () {
  const hero = document.querySelector('[data-cinematic-hero]');
  const scene = hero?.querySelector('[data-cinematic-scene]');
  const video = hero?.querySelector('[data-cinematic-video]');
  const vignette = hero?.querySelector('[data-cinematic-vignette]');
  const intro = hero?.querySelector('[data-cinematic-intro]');
  const terminal = hero?.querySelector('[data-cinematic-terminal]');
  const output = hero?.querySelector('[data-cinematic-terminal-output]');
  const workSection = document.querySelector('.s-work');
  const nav = document.getElementById('nav');
  if (!hero || !scene || !video || !vignette || !intro || !terminal || !output || !window.gsap || !window.ScrollTrigger) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileLayout = window.matchMedia('(max-width: 768px)').matches;
  const sourceWidth = 1280;
  const sourceHeight = 720;
  const sourceFps = 24;
  const terminalWidth = 900;
  const terminalHeight = 600;
  const videoEndProgress = .76;
  const textStartProgress = .72;
  const textEndProgress = .88;
  const transitionStartProgress = .89;
  const transitionEndProgress = .995;
  let duration = 0;
  let targetTime = 0;
  let displayTime = 0;
  let currentProgress = 0;
  let seekRaf = 0;

  const terminalScript = `> boot meridian.practice\n\n[2023] 第一次用 Midjourney 和 GPT-3 做海报。\n\n[2024] 嫌重复劳动太浪费时间，顺手做了设计排期与质检 AI Agent。\n\n[2025] 给 150+ 人做公司全员 AI 培训，试着把大家从重复加班里捞出来。\n\n[2026] 搭了一个 AI 学习站，顺便上线了一个塔罗牌网站。\n\n[Side Project] 在 YouTube 和小红书聊内容，做出了 20W+ 和 10W+ 的爆款。\n\n[Core Command] 持续学习，持续测试，持续构建。\n\nAI 每天都在变，我也一样。\n\n> Ready to execute. `;

  // The video cuts to a closer laptop shot at 6.60s. These four corners follow
  // the luminous screen on that shot so the HTML copy inherits its perspective.
  const screenTrack = [
    [6.60, [[336, 138], [1086, 107], [1053, 648], [251, 612]]],
    [6.65, [[335, 135], [1087, 104], [1055, 648], [249, 611]]],
    [6.70, [[331, 130], [1092, 98], [1059, 649], [245, 611]]],
    [6.75, [[330, 127], [1094, 95], [1061, 650], [244, 611]]],
    [6.80, [[329, 125], [1096, 93], [1064, 649], [242, 611]]],
    [6.85, [[325, 120], [1101, 87], [1069, 649], [238, 611]]],
    [6.90, [[325, 117], [1103, 85], [1071, 649], [236, 611]]],
    [6.95, [[323, 116], [1106, 84], [1072, 651], [235, 611]]],
    [7.00, [[322, 112], [1107, 79], [1075, 652], [232, 611]]],
  ];

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const smoothstep = value => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };

  function trackedScreen(time) {
    if (time <= screenTrack[0][0]) return screenTrack[0][1].map(point => point.slice());
    const last = screenTrack[screenTrack.length - 1];
    if (time >= last[0]) return last[1].map(point => point.slice());
    for (let index = 0; index < screenTrack.length - 1; index += 1) {
      const [fromTime, fromPoints] = screenTrack[index];
      const [toTime, toPoints] = screenTrack[index + 1];
      if (time <= toTime) {
        const amount = (time - fromTime) / (toTime - fromTime);
        return fromPoints.map((point, pointIndex) => [
          mix(point[0], toPoints[pointIndex][0], amount),
          mix(point[1], toPoints[pointIndex][1], amount),
        ]);
      }
    }
    return last[1].map(point => point.slice());
  }

  function insetQuad(points, amount) {
    const center = points.reduce((sum, point) => [sum[0] + point[0] / 4, sum[1] + point[1] / 4], [0, 0]);
    return points.map(point => [mix(point[0], center[0], amount), mix(point[1], center[1], amount)]);
  }

  function sourceToViewport(points) {
    const width = video.clientWidth;
    const height = video.clientHeight;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const renderedWidth = sourceWidth * scale;
    const renderedHeight = sourceHeight * scale;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const positionX = mobile ? .58 : .5;
    const offsetX = (width - renderedWidth) * positionX;
    const offsetY = (height - renderedHeight) * .5;
    return points.map(point => [offsetX + point[0] * scale, offsetY + point[1] * scale]);
  }

  function pointInQuad(points, u, v) {
    const top = [mix(points[0][0], points[1][0], u), mix(points[0][1], points[1][1], u)];
    const bottom = [mix(points[3][0], points[2][0], u), mix(points[3][1], points[2][1], u)];
    return [mix(top[0], bottom[0], v), mix(top[1], bottom[1], v)];
  }

  function subQuad(points, u0, u1, v0, v1) {
    return [
      pointInQuad(points, u0, v0),
      pointInQuad(points, u1, v0),
      pointInQuad(points, u1, v1),
      pointInQuad(points, u0, v1),
    ];
  }

  function matrixForQuad(points, logicalWidth, logicalHeight) {
    const [p0, p1, p2, p3] = points.map(point => ({ x: point[0], y: point[1] }));
    const dx1 = p1.x - p2.x;
    const dx2 = p3.x - p2.x;
    const dx3 = p0.x - p1.x + p2.x - p3.x;
    const dy1 = p1.y - p2.y;
    const dy2 = p3.y - p2.y;
    const dy3 = p0.y - p1.y + p2.y - p3.y;
    const denominator = dx1 * dy2 - dx2 * dy1;
    const g = denominator ? (dx3 * dy2 - dx2 * dy3) / denominator : 0;
    const h = denominator ? (dx1 * dy3 - dx3 * dy1) / denominator : 0;
    const a = p1.x - p0.x + g * p1.x;
    const b = p3.x - p0.x + h * p3.x;
    const c = p0.x;
    const d = p1.y - p0.y + g * p1.y;
    const e = p3.y - p0.y + h * p3.y;
    const f = p0.y;
    return `matrix3d(${a / logicalWidth},${d / logicalWidth},0,${g / logicalWidth},${b / logicalHeight},${e / logicalHeight},0,${h / logicalHeight},0,0,1,0,${c},${f},0,1)`;
  }

  function placeTerminal(time) {
    const trackedQuad = trackedScreen(clamp(time, 6.60, 7.00));
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const logicalWidth = mobile ? 340 : terminalWidth;
    const logicalHeight = mobile ? 600 : terminalHeight;
    // On a portrait viewport the cover crop shows only the middle of the laptop.
    // Map the copy to that visible slice instead of allowing either edge to be cut.
    const sourceQuad = mobile
      ? subQuad(trackedQuad, .32, .73, .07, .95)
      : insetQuad(trackedQuad, .048);
    terminal.style.width = `${logicalWidth}px`;
    terminal.style.height = `${logicalHeight}px`;
    terminal.style.transform = matrixForQuad(sourceToViewport(sourceQuad), logicalWidth, logicalHeight);
  }

  function updateScene(progress) {
    const amount = smoothstep((progress - transitionStartProgress) / (transitionEndProgress - transitionStartProgress));
    const finalQuad = sourceToViewport(insetQuad(trackedScreen(7), .01));
    const xs = finalQuad.map(point => point[0]);
    const ys = finalQuad.map(point => point[1]);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const targetScale = Math.max(innerWidth / (right - left), innerHeight / (bottom - top)) * 1.24;
    const scale = mix(1, targetScale, amount);
    const targetX = innerWidth / 2 - centerX * targetScale;
    const targetY = innerHeight / 2 - centerY * targetScale;
    scene.style.transform = `translate3d(${mix(0, targetX, amount)}px, ${mix(0, targetY, amount)}px, 0) scale(${scale})`;
    vignette.style.opacity = String(1 - amount);
  }

  function updateTerminal(progress) {
    const textProgress = smoothstep((progress - textStartProgress) / (textEndProgress - textStartProgress));
    const transitionProgress = smoothstep((progress - transitionStartProgress) / (transitionEndProgress - transitionStartProgress));
    const visible = displayTime >= 6.58 && textProgress > .004;
    terminal.style.opacity = visible ? String((1 - transitionProgress) * smoothstep(textProgress * 5)) : '0';
    terminal.style.visibility = visible ? 'visible' : 'hidden';
    output.textContent = terminalScript.slice(0, Math.round(terminalScript.length * textProgress));
    terminal.style.color = `rgba(20, 19, 16, ${mix(.5, .96, textProgress)})`;
    placeTerminal(displayTime);
  }

  function scheduleSeek() {
    if (!seekRaf) seekRaf = requestAnimationFrame(renderFrame);
  }

  function renderFrame() {
    seekRaf = 0;
    if (!duration) return;
    const frameDuration = 1 / sourceFps;
    const delta = targetTime - displayTime;
    displayTime = Math.abs(delta) <= frameDuration * .25 ? targetTime : displayTime + delta * .34;
    const nextTime = clamp(Math.round(displayTime * sourceFps) / sourceFps, 0, duration - frameDuration);
    if (!video.seeking && Math.abs(video.currentTime - nextTime) >= frameDuration * .4) {
      try { video.currentTime = nextTime; } catch (error) { /* metadata can arrive one frame later */ }
    }
    updateTerminal(currentProgress);
    if (Math.abs(targetTime - displayTime) > frameDuration * .15 || video.seeking) scheduleSeek();
  }

  function setProgress(progress) {
    const p = clamp(progress);
    currentProgress = p;
    const introOpacity = 1 - smoothstep(p / .29);
    intro.style.opacity = String(introOpacity);
    intro.style.visibility = introOpacity <= .001 ? 'hidden' : 'visible';

    if (duration) {
      const videoProgress = clamp(p / videoEndProgress);
      targetTime = Math.min(duration - 1 / sourceFps, videoProgress * duration);
      scheduleSeek();
    }
    updateTerminal(p);
    updateScene(p);
    if (nav) nav.dataset.theme = p > .955 ? 'light' : 'dark';
  }

  function build() {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    video.pause();
    placeTerminal(6.60);

    if (reducedMotion) {
      setProgress(0);
      return;
    }

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: self => setProgress(self.progress),
      onRefresh: self => setProgress(self.progress),
    });
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onEnter: () => { if (nav) nav.dataset.theme = 'dark'; },
      onEnterBack: () => { if (nav) nav.dataset.theme = 'dark'; },
      onLeave: () => { if (nav) nav.dataset.theme = 'light'; },
    });
    if (workSection) {
      gsap.fromTo(workSection,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: workSection,
            start: 'top 4%',
            end: 'top top',
            scrub: true,
          },
        });
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  video.addEventListener('seeked', scheduleSeek);

  async function loadSource() {
    // A scroll-scrubbed video means frequent `currentTime` seeks.  That is
    // smooth with a mouse wheel, but costly on iOS/Android where it competes
    // with native touch scrolling and causes the page to catch.  Mobile keeps
    // the intentional opening frame as a poster and hands the next section
    // back to the browser's native scroll immediately.
    if (mobileLayout) {
      hero.classList.add('is-mobile-static');
      video.pause();
      terminal.style.display = 'none';
      intro.style.opacity = '1';
      intro.style.visibility = 'visible';
      vignette.style.opacity = '1';
      scene.style.transform = 'none';
      if (nav) nav.dataset.theme = 'dark';
      return;
    }

    const sourceUrl = video.dataset.src;
    if (!sourceUrl) return;
    try {
      // Keep the exact source bytes. A same-page Blob makes frame seeking reliable
      // even when the host does not provide byte-range responses.
      const response = await fetch(sourceUrl, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
      video.src = URL.createObjectURL(await response.blob());
    } catch (error) {
      video.src = sourceUrl;
    }
    video.addEventListener('loadedmetadata', build, { once: true });
    video.load();
  }

  loadSource();
  window.addEventListener('resize', () => updateTerminal(currentProgress));
})();
