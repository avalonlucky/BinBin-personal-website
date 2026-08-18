(function () {
  'use strict';
  var CONSENT_KEY = 'maridian_analytics_consent';
  var VISITOR_KEY = 'maridian_visitor_id';
  var SESSION_KEY = 'maridian_session';
  var status = document.getElementById('consentStatus');
  var identity = document.getElementById('visitorIdentity');

  function read(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  function render() {
    var consent = read(CONSENT_KEY);
    var doNotTrack = navigator.doNotTrack === '1' || window.doNotTrack === '1';
    status.textContent = doNotTrack ? '浏览器已开启“禁止追踪”，本站统计不会运行。' : consent === 'denied' ? '已退出运营统计。' : '运营统计已启用，可随时退出。';
    var visitor = read(VISITOR_KEY);
    identity.textContent = visitor ? '本机匿名编号：' + visitor : '本机尚无匿名编号。';
  }

  document.getElementById('allowAnalytics').addEventListener('click', function () {
    write(CONSENT_KEY, 'granted');
    location.reload();
  });

  document.getElementById('denyAnalytics').addEventListener('click', function () {
    write(CONSENT_KEY, 'denied');
    remove(VISITOR_KEY);
    remove(SESSION_KEY);
    location.reload();
  });

  render();
})();
