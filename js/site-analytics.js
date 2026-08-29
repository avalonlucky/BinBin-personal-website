(function () {
  'use strict';

  if (!/^https?:$/.test(location.protocol) || location.pathname.startsWith('/ops')) return;

  var API = '/api/track';
  var VISITOR_KEY = 'maridian_visitor_id';
  var SESSION_KEY = 'maridian_session';
  var CONSENT_KEY = 'maridian_analytics_consent';
  var SESSION_TIMEOUT = 30 * 60 * 1000;
  var IDLE_TIMEOUT = 60 * 1000;
  var FLUSH_INTERVAL = 15 * 1000;
  var sentDepths = new Set();
  var started = false;

  function readStorage(storage, key) {
    try { return storage.getItem(key); } catch (_) { return null; }
  }

  function writeStorage(storage, key, value) {
    try { storage.setItem(key, value); } catch (_) { /* storage may be disabled */ }
  }

  function removeStorage(storage, key) {
    try { storage.removeItem(key); } catch (_) { /* storage may be disabled */ }
  }

  function setConsent(value) {
    writeStorage(localStorage, CONSENT_KEY, value);
    if (value === 'denied') {
      removeStorage(localStorage, VISITOR_KEY);
      removeStorage(localStorage, SESSION_KEY);
    }
  }

  window.MeridianPrivacy = {
    getConsent: function () { return readStorage(localStorage, CONSENT_KEY) || 'unset'; },
    allow: function () { setConsent('granted'); location.reload(); },
    optOut: function () { setConsent('denied'); location.reload(); }
  };

  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
  var consent = readStorage(localStorage, CONSENT_KEY);
  if (consent !== 'denied') startAnalytics();

  function startAnalytics() {
    if (started) return;
    started = true;

    var visitorId = getOrCreateVisitor();
    var sessionId = getOrCreateSession();
    var stages = buildStages();
    var pendingPageMs = 0;
    var pendingSections = Object.create(null);
    var lastActivity = performance.now();
    var lastTick = performance.now();

    function makeId() {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
      return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    }

    function getOrCreateVisitor() {
      var id = readStorage(localStorage, VISITOR_KEY);
      if (!id) {
        id = makeId();
        writeStorage(localStorage, VISITOR_KEY, id);
      }
      return id;
    }

    function getOrCreateSession() {
      var now = Date.now();
      var record;
      try { record = JSON.parse(readStorage(localStorage, SESSION_KEY) || 'null'); } catch (_) { record = null; }
      if (!record || !record.id || !record.last || now - record.last > SESSION_TIMEOUT) {
        record = { id: makeId(), last: now };
      } else {
        record.last = now;
      }
      writeStorage(localStorage, SESSION_KEY, JSON.stringify(record));
      return record.id;
    }

    function refreshSession() {
      sessionId = getOrCreateSession();
    }

    function basePayload(eventName, detail) {
      return Object.assign({
        event: eventName,
        path: location.pathname,
        page_title: document.title || '',
        referrer: document.referrer || '',
        session_id: sessionId,
        visitor_id: visitorId
      }, detail || {});
    }

    function transmit(payload) {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        var queued = navigator.sendBeacon(API, new Blob([body], { type: 'application/json' }));
        if (queued) return;
      }
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        credentials: 'same-origin',
        keepalive: true
      }).catch(function () {});
    }

    function send(eventName, detail) {
      refreshSession();
      transmit(basePayload(eventName, detail));
    }

    function sendBatch(events) {
      if (!events.length) return;
      refreshSession();
      transmit(events.map(function (event) { return basePayload(event.event, event.detail); }));
    }

    function cleanLabel(value, fallback) {
      var label = String(value || '').replace(/\s+/g, ' ').trim();
      return (label || fallback || '').slice(0, 120);
    }

    function buildStages() {
      if (!document.body.classList.contains('case-page')) return [];
      var result = [];
      var hero = document.querySelector('.cs-hero, .cs-hall');
      if (hero) result.push({ element: hero, name: '项目首屏' });
      document.querySelectorAll('.cs-section').forEach(function (section, index) {
        var number = section.querySelector('.cs-num');
        var fallback = number ? number.textContent.replace(/\s*[—–-].*$/, '') + ' 阶段' : '阶段 ' + (index + 1);
        result.push({ element: section, name: cleanLabel(section.dataset.toc, fallback) });
      });
      var outro = document.querySelector('.cs-outro');
      if (outro) result.push({ element: outro, name: '联系与总结' });
      var navigation = document.querySelector('.cs-nav');
      if (navigation) result.push({ element: navigation, name: '上下篇导航' });
      return result;
    }

    function visiblePixels(element) {
      var rect = element.getBoundingClientRect();
      return Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    }

    function activeStage() {
      var best = null;
      var bestPixels = 0;
      stages.forEach(function (stage) {
        var pixels = visiblePixels(stage.element);
        if (pixels > bestPixels) { best = stage; bestPixels = pixels; }
      });
      return bestPixels > 0 ? best : null;
    }

    function stageForElement(element) {
      for (var index = 0; index < stages.length; index += 1) {
        if (stages[index].element.contains(element)) return stages[index];
      }
      return activeStage();
    }

    function noteActivity() {
      collectEngagement();
      lastActivity = performance.now();
      lastTick = lastActivity;
    }

    function canCount(now) {
      var focused = typeof document.hasFocus !== 'function' || document.hasFocus();
      return !document.hidden && focused && now - lastActivity <= IDLE_TIMEOUT;
    }

    function collectEngagement() {
      var now = performance.now();
      var elapsed = Math.min(Math.max(now - lastTick, 0), 2000);
      lastTick = now;
      if (!canCount(now) || elapsed < 1) return;
      pendingPageMs += elapsed;
      var stage = activeStage();
      if (stage) pendingSections[stage.name] = (pendingSections[stage.name] || 0) + elapsed;
    }

    function flushEngagement() {
      collectEngagement();
      var events = [];
      if (pendingPageMs >= 1000) events.push({ event: 'page_engagement', detail: { metric_value: Math.round(pendingPageMs) } });
      Object.keys(pendingSections).forEach(function (name) {
        if (pendingSections[name] >= 1000) events.push({ event: 'section_engagement', detail: { section_name: name, metric_value: Math.round(pendingSections[name]) } });
      });
      pendingPageMs = 0;
      pendingSections = Object.create(null);
      sendBatch(events);
    }

    function describeClick(element) {
      if (element.closest && element.closest('input, textarea, select, [contenteditable="true"]')) return '表单控件';
      var interactive = element.closest && element.closest('a, button, summary, [role="button"], [data-analytics-event]');
      var target = interactive || element;
      var tag = target.tagName ? target.tagName.toLowerCase() : '区域';
      var label = target.getAttribute && (target.getAttribute('aria-label') || target.getAttribute('title'));
      if (!label && target.tagName === 'IMG') label = target.getAttribute('alt');
      if (!label && interactive) label = target.textContent;
      if (!interactive) label = tag === 'img' ? label : '内容区域';
      if (target.tagName === 'A') {
        var href = target.getAttribute('href') || '';
        try {
          var url = new URL(href, location.href);
          if (url.protocol === 'mailto:') label = label || '邮件联系';
          else if (url.protocol === 'tel:') label = label || '电话联系';
          else if (url.origin === location.origin) label = label || url.pathname;
          else label = (label || '外部链接') + ' · ' + url.hostname;
        } catch (_) {}
      }
      return cleanLabel(tag + ' · ' + cleanLabel(label, '未命名元素'), '页面点击');
    }

    function trackClick(event) {
      var element = event.target && event.target.nodeType === 1 ? event.target : null;
      if (!element) return;
      var stage = stageForElement(element);
      var documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 1);
      var hasPointerPosition = Number.isFinite(event.clientX) && Number.isFinite(event.clientY) && (event.clientX !== 0 || event.clientY !== 0);
      send('element_click', {
        target: describeClick(element),
        section_name: stage ? stage.name : '',
        position_x: hasPointerPosition ? Math.max(0, Math.min(1, event.clientX / Math.max(innerWidth, 1))) : null,
        position_y: hasPointerPosition ? Math.max(0, Math.min(1, (scrollY + event.clientY) / documentHeight)) : null
      });
    }

    function classifyLink(link) {
      var href = link.getAttribute('href') || '';
      var absolute;
      try { absolute = new URL(href, location.href); } catch (_) { return; }
      var label = cleanLabel(link.getAttribute('aria-label') || link.textContent, '链接');
      if (absolute.protocol === 'mailto:' || absolute.protocol === 'tel:') {
        send('contact_click', { target: absolute.protocol.replace(':', '') });
        return;
      }
      if (absolute.origin === location.origin && absolute.pathname.startsWith('/work/')) {
        send('work_open', { target: absolute.pathname });
        return;
      }
      if (absolute.origin !== location.origin && /^https?:$/.test(absolute.protocol)) {
        var eventName = /chatgpt|deepseek|gemini|grok/i.test(absolute.hostname) ? 'ai_prompt_click' : 'external_click';
        send(eventName, { target: absolute.hostname + (label ? ' · ' + label : '') });
      }
    }

    function trackDepth() {
      var maxScroll = document.documentElement.scrollHeight - innerHeight;
      if (maxScroll <= 0) return;
      var ratio = scrollY / maxScroll;
      if (ratio >= 0.5 && !sentDepths.has(50)) { sentDepths.add(50); send('case_depth_50'); }
      if (ratio >= 0.9 && !sentDepths.has(90)) { sentDepths.add(90); send('case_depth_90'); }
    }

    function observeVitals() {
      if (!('PerformanceObserver' in window)) return;
      var lcp = 0;
      var cls = 0;
      var inp = 0;
      try {
        new PerformanceObserver(function (list) {
          var entries = list.getEntries();
          if (entries.length) lcp = entries[entries.length - 1].startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (_) {}
      try {
        new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (entry) { if (!entry.hadRecentInput) cls += entry.value; });
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (_) {}
      try {
        new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (entry) { inp = Math.max(inp, entry.duration || 0); });
        }).observe({ type: 'event', buffered: true, durationThreshold: 40 });
      } catch (_) {}
      var flushed = false;
      function flushVitals() {
        if (flushed) return;
        flushed = true;
        var navigation = performance.getEntriesByType('navigation')[0];
        var events = [];
        if (lcp) events.push({ event: 'web_vital', detail: { metric_name: 'LCP', metric_value: Math.round(lcp) } });
        if (inp) events.push({ event: 'web_vital', detail: { metric_name: 'INP', metric_value: Math.round(inp) } });
        events.push({ event: 'web_vital', detail: { metric_name: 'CLS', metric_value: Math.round(cls * 1000) / 1000 } });
        if (navigation && navigation.loadEventEnd) events.push({ event: 'web_vital', detail: { metric_name: 'LOAD', metric_value: Math.round(navigation.loadEventEnd) } });
        sendBatch(events);
      }
      document.addEventListener('visibilitychange', function () { if (document.hidden) flushVitals(); });
      window.addEventListener('pagehide', flushVitals, { once: true });
    }

    send('page_view');
    document.addEventListener('click', function (event) {
      noteActivity();
      trackClick(event);
      var link = event.target.closest && event.target.closest('a[href]');
      if (link) classifyLink(link);
      var contactCopy = event.target.closest && event.target.closest('[data-contact-copy]');
      if (contactCopy) {
        var contactRoot = contactCopy.closest('.cs-outro') || document;
        var activeContact = contactRoot.querySelector('[data-contact].is-active');
        send(activeContact && activeContact.dataset.contact === 'phone' ? 'phone_copy' : 'email_copy');
      }
      var action = event.target.closest && event.target.closest('[data-analytics-event]');
      if (action) send(action.dataset.analyticsEvent, { target: action.dataset.analyticsTarget || '' });
    }, true);
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (name) { window.addEventListener(name, noteActivity, { passive: true }); });
    window.addEventListener('scroll', function () { noteActivity(); trackDepth(); }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) flushEngagement();
      else { lastActivity = performance.now(); lastTick = lastActivity; }
    });
    window.addEventListener('pagehide', flushEngagement, { once: true });
    setInterval(collectEngagement, 1000);
    setInterval(flushEngagement, FLUSH_INTERVAL);
    observeVitals();

    window.MeridianAnalytics = { track: send, flush: flushEngagement };
  }
})();
