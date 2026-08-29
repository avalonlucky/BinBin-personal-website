(function () {
  'use strict';

  const title = 'Side B | Meridian Space';

  const identityReplacements = [
    [/OS63/g, 'Meridian OS'],
    [/ATOM63/g, 'Meridian'],
    [/You Zhang/g, 'Meridian'],
    [/Built with Meridian/g, 'Built by Meridian'],
    [/hello\.youzhang@gmail\.com/gi, 'bh141425@gmail.com'],
    [/os\.atom63\.io/gi, 'chaoshanai.com'],
    [/atom63\.io/gi, 'chaoshanai.com'],
    [/@yz_atom63/gi, 'Meridian'],
    [/@atom63_/gi, 'Meridian']
  ];

  function translateIdentity(value) {
    return identityReplacements.reduce((result, pair) => result.replace(pair[0], pair[1]), value);
  }

  function localizeNode(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const next = translateIdentity(root.nodeValue || '');
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
      const next = translateIdentity(textNode.nodeValue || '');
      if (next !== textNode.nodeValue) textNode.nodeValue = next;
    }

    if (root.nodeType === Node.ELEMENT_NODE) {
      [root, ...root.querySelectorAll('[title],[aria-label],a[href]')].forEach((element) => {
        ['title', 'aria-label'].forEach((attribute) => {
          if (!element.hasAttribute(attribute)) return;
          element.setAttribute(attribute, translateIdentity(element.getAttribute(attribute) || ''));
        });
        if (element.matches('a[href]')) {
          const href = element.getAttribute('href') || '';
          let translated = translateIdentity(href)
            .replace(/https?:\/\/www\.linkedin\.com\/in\/you-zhang\/?/i, 'https://chaoshanai.com/about.html')
            .replace(/https?:\/\/github\.com\/atom63\/?/i, 'https://github.com/avalonlucky')
            .replace(/https?:\/\/www\.behance\.net\/youzhang\/?/i, 'https://chaoshanai.com/#work');
          if (/atom63|youzhang|you-zhang/i.test(translated)) translated = 'https://chaoshanai.com/';
          if (translated !== href) element.setAttribute('href', translated);
        }
      });
    }
  }

  function applyPersonalMetadata() {
    document.title = title;
    localizeNode(document.body);
  }

  applyPersonalMetadata();
  document.addEventListener('DOMContentLoaded', applyPersonalMetadata, { once: true });
  window.addEventListener('load', applyPersonalMetadata, { once: true });
  window.addEventListener('pageshow', applyPersonalMetadata);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach(localizeNode));
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}());
