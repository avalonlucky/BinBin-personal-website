(function () {
  'use strict';

  var section = document.querySelector('[data-blog-section]');
  if (!section) return;

  var grid = section.querySelector('[data-blog-grid]');
  var tagsWrap = section.querySelector('[data-blog-tags]');
  var search = section.querySelector('[data-blog-search]');
  var state = { q: '', tag: '' };
  var debounce;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function formatDate(seconds) {
    if (!seconds) return '';
    var d = new Date(seconds * 1000);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function showLoading(show) {
    grid.replaceChildren();
    if (!show) return;
    grid.appendChild(el('div', 'blog-loading', '正在读取文章…'));
  }

  function renderEmpty(message) {
    grid.replaceChildren();
    var empty = el('div', 'blog-empty');
    empty.appendChild(el('b', '', '暂时还没有文章。'));
    empty.appendChild(el('span', '', message || '写点方法、书单或工作复盘，这里会先出现。'));
    grid.appendChild(empty);
  }

  function renderTags(tags) {
    tagsWrap.replaceChildren();
    var all = el('button', 'blog-tag' + (!state.tag ? ' is-active' : ''), '全部');
    all.type = 'button';
    all.setAttribute('aria-pressed', String(!state.tag));
    all.addEventListener('click', function () { state.tag = ''; loadMeta(); loadPosts(); });
    tagsWrap.appendChild(all);
    tags.forEach(function (t) {
      var chip = el('button', 'blog-tag' + (state.tag === t.name ? ' is-active' : ''), t.name + ' ' + t.count);
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(state.tag === t.name));
      chip.addEventListener('click', function () {
        state.tag = state.tag === t.name ? '' : t.name;
        loadMeta();
        loadPosts();
      });
      tagsWrap.appendChild(chip);
    });
  }

  function renderPosts(items) {
    grid.replaceChildren();
    if (!items.length) { renderEmpty(); return; }
    items.forEach(function (post) {
      var card = el('a', 'blog-card');
      card.href = '/blog-post.html?post=' + encodeURIComponent(post.slug);
      card.setAttribute('aria-label', '阅读：' + post.title);

      var cover = el('div', 'blog-card-cover' + (post.cover ? '' : ' is-empty'));
      if (post.cover) {
        var img = document.createElement('img');
        img.src = post.cover;
        img.alt = post.title;
        img.loading = 'lazy';
        cover.appendChild(img);
      }
      card.appendChild(cover);

      var meta = el('div', 'blog-card-meta');
      meta.appendChild(el('span', 'blog-card-cat', post.category || '随笔'));
      meta.appendChild(el('span', 'sep', '·'));
      meta.appendChild(el('span', '', formatDate(post.created_at)));
      if (post.reading_minutes) {
        meta.appendChild(el('span', 'sep', '·'));
        meta.appendChild(el('span', '', '约 ' + post.reading_minutes + ' 分钟'));
      }
      card.appendChild(meta);

      card.appendChild(el('h3', '', post.title));
      if (post.excerpt) card.appendChild(el('p', '', post.excerpt));

      var foot = el('div', 'blog-card-foot');
      foot.appendChild(el('span', '', '阅读文章'));
      var arrow = el('span', 'arrow', '→');
      foot.appendChild(arrow);
      card.appendChild(foot);

      grid.appendChild(card);
    });
  }

  function loadMeta() {
    fetch('/api/blog/meta', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.tags) renderTags(data.tags);
      })
      .catch(function () { /* tags are non-critical */ });
  }

  function loadPosts() {
    showLoading(true);
    var params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.tag) params.set('tag', state.tag);
    params.set('limit', '100');
    fetch('/api/blog/list?' + params.toString(), { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && Array.isArray(data.items)) renderPosts(data.items);
        else renderEmpty();
      })
      .catch(function () { renderEmpty('暂时无法读取文章，请稍后再试。'); });
  }

  if (search) {
    search.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        state.q = search.value.trim();
        loadPosts();
      }, 220);
    });
  }

  loadMeta();
  loadPosts();
})();
