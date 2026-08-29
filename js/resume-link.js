(() => {
  // Add the final site-relative PDF path here when the resume is ready, for
  // example: '/assets/resume/meridian-resume.pdf'.
  const RESUME_PDF_URL = '';

  document.querySelectorAll('[data-resume-url]').forEach(button => {
    button.addEventListener('click', () => {
      const url = button.dataset.resumeUrl.trim() || RESUME_PDF_URL;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      const status = button.querySelector('.nav-resume-status');
      const label = button.querySelector('span:first-child');
      if (status) status.textContent = '个人简历正在更新，PDF 稍后开放';
      if (label) {
        const original = label.textContent;
        label.textContent = '更新中';
        window.setTimeout(() => { label.textContent = original; }, 1400);
      }
      button.title = '个人简历正在更新，PDF 稍后开放';
    });
  });
})();
