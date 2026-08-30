(function () {
  const nav = document.getElementById('nav');
  const scroller = document.querySelector('main.page');
  if (!nav || !scroller) return;

  const navInner = nav.querySelector('.nav-inner');
  const navLinks = nav.querySelector('.nav-links');
  const resumeButton = nav.querySelector('.nav-resume');
  const mobileToggle = document.createElement('button');
  const mobileBackdrop = document.createElement('button');

  mobileToggle.className = 'nav-mobile-toggle';
  mobileToggle.type = 'button';
  mobileToggle.setAttribute('aria-label', '打开导航菜单');
  mobileToggle.setAttribute('aria-expanded', 'false');
  mobileToggle.innerHTML = '<span></span><span></span><span></span>';

  mobileBackdrop.className = 'nav-mobile-backdrop';
  mobileBackdrop.type = 'button';
  mobileBackdrop.setAttribute('aria-label', '关闭导航菜单');

  navInner.appendChild(mobileToggle);
  nav.appendChild(mobileBackdrop);

  let restoreOverflow = '';

  const closeMobileNav = ({ restoreFocus = false } = {}) => {
    if (!nav.classList.contains('is-mobile-open')) return;
    nav.classList.remove('is-mobile-open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', '打开导航菜单');
    scroller.style.overflowY = restoreOverflow;
    if (restoreFocus) mobileToggle.focus();
  };

  const openMobileNav = () => {
    restoreOverflow = scroller.style.overflowY;
    nav.classList.remove('is-scroll-hidden');
    nav.classList.add('is-mobile-open');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.setAttribute('aria-label', '关闭导航菜单');
    scroller.style.overflowY = 'hidden';
    const firstLink = navLinks && navLinks.querySelector('a');
    if (firstLink) window.setTimeout(() => firstLink.focus(), 180);
  };

  mobileToggle.addEventListener('click', () => {
    if (nav.classList.contains('is-mobile-open')) closeMobileNav();
    else openMobileNav();
  });
  mobileBackdrop.addEventListener('click', () => closeMobileNav({ restoreFocus: true }));
  if (navLinks) navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMobileNav();
  });
  if (resumeButton) resumeButton.addEventListener('click', () => closeMobileNav());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileNav({ restoreFocus: true });
      return;
    }
    if (event.key !== 'Tab' || !nav.classList.contains('is-mobile-open')) return;
    const focusable = [
      ...(navLinks ? navLinks.querySelectorAll('a[href]') : []),
      ...(resumeButton ? [resumeButton] : []),
      mobileToggle
    ].filter((element) => !element.disabled);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileNav();
  });

  let previous = scroller.scrollTop;
  let ticking = false;

  const update = () => {
    const current = scroller.scrollTop;
    const delta = current - previous;

    if (current <= 24 || delta < -6) {
      nav.classList.remove('is-scroll-hidden');
    } else if (delta > 6 && !nav.matches(':focus-within') && !nav.classList.contains('is-mobile-open')) {
      nav.classList.add('is-scroll-hidden');
    }

    previous = current;
    ticking = false;
  };

  scroller.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  nav.addEventListener('pointerenter', () => nav.classList.remove('is-scroll-hidden'));
})();
