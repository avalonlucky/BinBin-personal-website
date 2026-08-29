(function () {
  'use strict';

  function qs(sel) { return document.querySelector(sel); }

  function setText(sel, text) { var n = qs(sel); if (n) n.textContent = text; }
  function clear(sel) { var n = qs(sel); if (n) n.replaceChildren(); }

  function makeSpan(text, cls) {
    var s = document.createElement('span');
    if (cls) s.className = cls;
    s.textContent = text;
    return s;
  }

  function formatDate(seconds) {
    if (!seconds) return '';
    var d = new Date(seconds * 1000);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function renderNav(adjacent) {
    var section = qs('[data-bp-nav-if]');
    if (!section) return;
    var prev = adjacent && adjacent.prev;
    var next = adjacent && adjacent.next;
    if (!prev && !next) { section.style.display = 'none'; return; }
    section.style.display = '';
    section.replaceChildren();
    var inner = document.createElement('div');
    inner.className = 'bp-nav-inner';

    var left = document.createElement('a');
    left.className = 'bp-prev';
    if (prev) {
      left.href = '/blog-post.html?post=' + encodeURIComponent(prev.slug);
      left.appendChild(makeSpan('← 上一篇', 'dir'));
      left.appendChild(makeSpan(prev.title, 't'));
    }
    var right = document.createElement('a');
    right.className = 'bp-next is-next';
    if (next) {
      right.href = '/blog-post.html?post=' + encodeURIComponent(next.slug);
      right.appendChild(makeSpan('下一篇 →', 'dir'));
      right.appendChild(makeSpan(next.title, 't'));
    }
    inner.appendChild(left);
    inner.appendChild(right);
    section.appendChild(inner);
  }

  function renderNotFound() {
    document.title = '文章不存在 · Meridian Space';
    setText('[data-bp-title]', '这篇文章不存在');
    setText('[data-bp-excerpt]', '它可能已被作者删除，或链接有误。你可以回到全部文章看看其他内容。');
    var nav = qs('[data-bp-nav-if]');
    if (nav) nav.style.display = 'none';
  }

  function render(post, adjacent) {
    document.title = post.title + ' · Meridian Space';
    setText('[data-bp-title]', post.title);
    setText('[data-bp-excerpt]', post.excerpt || '');

    var meta = qs('[data-bp-meta]');
    if (meta) {
      meta.replaceChildren();
      meta.appendChild(makeSpan(post.category || '随笔', 'bp-cat'));
      meta.appendChild(makeSpan('·'));
      meta.appendChild(makeSpan(formatDate(post.created_at)));
      if (post.reading_minutes) {
        meta.appendChild(makeSpan('·'));
        meta.appendChild(makeSpan('约 ' + post.reading_minutes + ' 分钟'));
      }
    }

    var cover = qs('[data-bp-cover]');
    if (cover) {
      cover.replaceChildren();
      if (post.cover) {
        var img = document.createElement('img');
        img.src = post.cover;
        img.alt = post.title;
        cover.appendChild(img);
      }
    }

    // body_html is rendered server-side from trusted markdown (HTML is escaped).
    var prose = qs('[data-bp-prose]');
    if (prose) prose.innerHTML = post.body_html || '';

    var tags = qs('[data-bp-tags]');
    if (tags) {
      tags.replaceChildren();
      (post.tags || []).forEach(function (tag) {
        var a = document.createElement('a');
        a.className = 'bp-tag';
        a.href = 'about.html#blog';
        a.textContent = '#' + tag;
        tags.appendChild(a);
      });
      if (!(post.tags || []).length) tags.style.display = 'none';
    }

    renderNav(adjacent);
  }

  var params = new URLSearchParams(location.search);
  var slug = params.get('post');
  if (!slug) { renderNotFound(); return; }

  fetch('/api/blog/post?slug=' + encodeURIComponent(slug), { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.post) { renderNotFound(); return; }
      render(data.post, data.adjacent || {});
    })
    .catch(function () { renderNotFound(); });
})();
