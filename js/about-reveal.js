(function () {
  'use strict';

  // Scroll-in reveal for the About page, mirroring the mr-march style:
  // each block fades + rises into place as it enters the viewport.
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var targets = Array.from(document.querySelectorAll(
    '.about-intro-copy, .about-intro-photo, .about-story-chapter, .about-story-group, .about-story-conclusion'
  ));

  if (!targets.length) return;

  function show(element) {
    element.classList.add('in-view');
  }

  // Reduced motion: show everything immediately, no animation.
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(show);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        show(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.08
  });

  targets.forEach(function (element) { observer.observe(element); });
})();
