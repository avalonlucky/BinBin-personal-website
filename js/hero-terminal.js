(function () {
  const output = document.querySelector('[data-terminal-output]');
  const viewport = document.querySelector('.hero-terminal-scroll');
  if (!output || !viewport) return;

  const script = `> boot maridian.practice\n\n[2023]\n第一次用 Midjourney 和 GPT-3 做海报。\n\n[2024]\n嫌重复劳动太浪费时间，\n顺手做了设计排期与质检 AI Agent。\n\n[2025]\n给 150+ 人做公司全员 AI 培训，\n试着把大家从重复加班里捞出来。\n\n[2026]\n偶尔做些无聊但有趣的事：\n搭了一个 AI 学习站，\n顺便上线了一个塔罗牌网站。\n\n[Side Project]\n在 YouTube 和小红书聊内容，\n不小心做出了 20W+ 和 10W+ 的爆款。\n\n[Core Command]\n持续学习。\n持续测试。\n持续构建。\n\nAI 每天都在变，\n我也一样。\n\n> Ready to execute. `;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    output.textContent = script;
    viewport.scrollTop = viewport.scrollHeight;
    return;
  }

  let index = 0;
  let timer = 0;
  const type = () => {
    output.textContent = script.slice(0, index + 1);
    viewport.scrollTop = viewport.scrollHeight;
    const char = script[index];
    index += 1;
    if (index >= script.length) {
      timer = window.setTimeout(() => {
        index = 0;
        output.textContent = '';
        viewport.scrollTop = 0;
        type();
      }, 3600);
      return;
    }
    timer = window.setTimeout(type, char === '\n' ? 150 : /[。，“”：]/.test(char) ? 105 : 34);
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !timer) type();
  }, { threshold: .25 });
  observer.observe(output);
})();
