(() => {
  const contacts = {
    email: {
      value: 'bh141425@gmail.com',
      copyLabel: '复制邮箱',
    },
    phone: {
      value: '131 0633 3009',
      copyLabel: '复制电话',
    },
  };

  function initFooterContact() {
    document.querySelectorAll('[data-footer-contact]').forEach(card => {
      if (card.dataset.footerContactReady === 'true') return;

      const value = card.querySelector('[data-footer-contact-value]');
      const copy = card.querySelector('[data-footer-contact-copy]');
      const modeButtons = card.querySelectorAll('[data-footer-contact-mode]');
      if (!value || !copy || !modeButtons.length) return;

      let mode = 'email';
      const render = () => {
        const contact = contacts[mode];
        value.textContent = contact.value;
        copy.setAttribute('aria-label', contact.copyLabel);
        modeButtons.forEach(button => {
          const active = button.dataset.footerContactMode === mode;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', String(active));
        });
      };

      modeButtons.forEach(button => {
        button.addEventListener('click', () => {
          mode = button.dataset.footerContactMode;
          render();
        });
      });

      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(contacts[mode].value);
          const original = copy.getAttribute('aria-label');
          copy.setAttribute('aria-label', '已复制');
          window.setTimeout(() => copy.setAttribute('aria-label', original), 1200);
        } catch (_) {
          window.prompt('复制联系方式', contacts[mode].value);
        }
      });

      card.dataset.footerContactReady = 'true';
      render();
    });
  }

  function initFooterAI() {
    const prompt = '我正在评估 Meridian（https://chaoshanai.com/）是否适合我们的品牌设计 / 视觉设计岗位。'
      + '请查看他的作品集网站，告诉我：他的设计能力覆盖哪些方面、最适合什么阶段和什么类型的公司、'
      + '如果录用他我实际能得到什么。请具体一些，引用他的案例和经历。';

    document.querySelectorAll('[data-footer-ai-base]').forEach(link => {
      link.href = link.dataset.footerAiBase + encodeURIComponent(prompt);
    });
  }

  initFooterContact();
  initFooterAI();
})();
