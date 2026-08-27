(function () {
  const hero = document.querySelector('[data-cinematic-hero]');
  const video = hero?.querySelector('[data-cinematic-video]');
  const intro = hero?.querySelector('[data-cinematic-intro]');
  const terminal = hero?.querySelector('[data-cinematic-terminal]');
  const output = hero?.querySelector('[data-cinematic-terminal-output]');
  const progressBar = hero?.querySelector('[data-cinematic-progress]');
  const nav = document.getElementById('nav');
  if (!hero || !video || !intro || !terminal || !output || !window.gsap || !window.ScrollTrigger) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sourceWidth = 1280;
  const sourceHeight = 720;
  const sourceFps = 24;
  const screenBounds = { x: 245, y: 75, width: 855, height: 580 };
  let duration = 0;
  let targetTime = 0;
  let displayTime = 0;
  let seekRaf = 0;
  let typingStarted = false;
  let typingTimer = 0;

  const terminalScript = `> boot maridian.practice\n\n[2023]\n第一次用 Midjourney 和 GPT-3 做海报。\n\n[2024]\n嫌重复劳动太浪费时间，\n顺手做了设计排期与质检 AI Agent。\n\n[2025]\n给 150+ 人做公司全员 AI 培训，\n试着把大家从重复加班里捞出来。\n\n[2026]\n偶尔做些无聊但有趣的事：\n搭了一个 AI 学习站，\n顺便上线了一个塔罗牌网站。\n\n[Side Project]\n在 YouTube 和小红书聊内容，\n不小心做出了 20W+ 和 10W+ 的爆款。\n\n[Core Command]\n持续学习。\n持续测试。\n持续构建。\n\nAI 每天都在变，\n我也一样。\n\n> Ready to execute. `;

  function placeTerminal() {
    const width = video.clientWidth;
    const height = video.clientHeight;
    if (window.matchMedia('(max-width: 768px)').matches) {
      // 手机端不把横向电脑屏幕硬裁成一条窄缝；镜头抵达屏幕时，
      // 终端从画面里的发光屏自然接管整个视口。
      terminal.style.left = '0px';
      terminal.style.top = '0px';
      terminal.style.width = `${width}px`;
      terminal.style.height = `${height}px`;
      return;
    }
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const offsetX = (width - sourceWidth * scale) / 2;
    const offsetY = (height - sourceHeight * scale) / 2;
    terminal.style.left = `${offsetX + screenBounds.x * scale}px`;
    terminal.style.top = `${offsetY + screenBounds.y * scale}px`;
    terminal.style.width = `${screenBounds.width * scale}px`;
    terminal.style.height = `${screenBounds.height * scale}px`;
  }

  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    let index = 0;
    const viewport = terminal.querySelector('.hero-terminal-scroll');
    const type = () => {
      output.textContent = terminalScript.slice(0, index + 1);
      viewport.scrollTop = viewport.scrollHeight;
      const char = terminalScript[index];
      index += 1;
      if (index >= terminalScript.length) return;
      typingTimer = window.setTimeout(type, char === '\n' ? 105 : /[。，“”：]/.test(char) ? 76 : 24);
    };
    type();
  }

  function scheduleSeek() {
    if (!seekRaf) seekRaf = requestAnimationFrame(renderFrame);
  }

  function renderFrame() {
    seekRaf = 0;
    if (!duration) return;
    const frameDuration = 1 / sourceFps;
    const delta = targetTime - displayTime;
    displayTime = Math.abs(delta) <= frameDuration * .35
      ? targetTime
      : displayTime + delta * .28;
    const nextTime = Math.min(duration - frameDuration, Math.max(0,
      Math.round(displayTime * sourceFps) / sourceFps));
    if (!video.seeking && Math.abs(video.currentTime - nextTime) >= frameDuration * .45) {
      try { video.currentTime = nextTime; } catch (error) { /* metadata can arrive one frame later */ }
    }
    if (Math.abs(targetTime - displayTime) > frameDuration * .2 || video.seeking) scheduleSeek();
  }

  function setProgress(progress) {
    const p = Math.max(0, Math.min(1, progress));
    if (progressBar) progressBar.style.transform = `scaleX(${p})`;

    const introOpacity = 1 - Math.min(1, p / .4);
    intro.style.opacity = String(introOpacity);
    intro.style.visibility = introOpacity <= .001 ? 'hidden' : 'visible';

    const terminalProgress = Math.max(0, Math.min(1, (p - .78) / .16));
    terminal.style.opacity = String(terminalProgress);
    terminal.style.visibility = terminalProgress <= .001 ? 'hidden' : 'visible';
    if (terminalProgress > .08) startTyping();

    if (!duration) return;
    targetTime = Math.min(duration - 1 / sourceFps, Math.max(0, p * duration));
    scheduleSeek();
  }

  function build() {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    video.pause();
    placeTerminal();

    if (reducedMotion) {
      setProgress(0);
      return;
    }

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '85% bottom',
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
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  video.addEventListener('seeked', scheduleSeek);

  async function loadSource() {
    const sourceUrl = video.dataset.src;
    if (!sourceUrl) return;
    try {
      // The exact original bytes are kept. Loading them into a same-page Blob makes
      // random seeks reliable even on hosts that do not return HTTP Range responses.
      const response = await fetch(sourceUrl, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Video request failed: ${response.status}`);
      const sourceBlob = await response.blob();
      video.src = URL.createObjectURL(sourceBlob);
    } catch (error) {
      video.src = sourceUrl;
    }
    video.addEventListener('loadedmetadata', build, { once: true });
    video.load();
  }

  loadSource();

  window.addEventListener('resize', placeTerminal);
  window.addEventListener('pagehide', () => window.clearTimeout(typingTimer), { once: true });
})();
