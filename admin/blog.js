(function () {
  'use strict';

  var accessView = document.getElementById('accessView');
  var adminView = document.getElementById('adminView');
  var loginMessage = document.getElementById('loginMessage');
  var loginForm = document.getElementById('loginForm');
  var updatedText = document.getElementById('updatedText');
  var listArea = document.getElementById('listArea');
  var editorArea = document.getElementById('editorArea');
  var postList = document.getElementById('postList');
  var listFeedback = document.getElementById('listFeedback');
  var editorForm = document.getElementById('editorForm');
  var saveStatus = document.getElementById('saveStatus');
  var saveBtn = document.getElementById('save');
  var blogCount = document.getElementById('blogCount');

  var posts = [];
  var editing = null;   // in-memory post being edited; null = list view
  var dirty = false;

  function api(path, options) {
    options = options || {};
    options.credentials = 'same-origin';
    return fetch(path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) {
          var error = new Error(body.error || 'request_failed');
          error.status = response.status;
          throw error;
        }
        return body;
      });
    });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function fmtDate(seconds) {
    var d = new Date(seconds * 1000);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
  }

  function showAccess(message) {
    adminView.hidden = true;
    accessView.hidden = false;
    loginMessage.textContent = message || '';
  }

  function showAdmin() {
    accessView.hidden = true;
    adminView.hidden = false;
  }

  // ---- list ----
  function renderList() {
    postList.replaceChildren();
    blogCount.textContent = '共 ' + posts.length + ' 篇';
    if (!posts.length) {
      postList.appendChild(el('p', 'blog-count', '还没有文章，点击右上角"新建文章"开始。'));
      return;
    }
    posts.forEach(function (post) {
      var row = el('div', 'blog-post-row');

      var t = el('div', 't');
      t.appendChild(el('b', '', post.title));
      t.appendChild(el('small', '', fmtDate(post.created_at) + (post.category ? ' · ' + post.category : '') + (post.reading_minutes ? ' · ' + post.reading_minutes + ' 分钟' : '')));
      row.appendChild(t);
      row.appendChild(el('span', 'status ' + (post.published ? 'on' : 'off'), post.published ? '已发布' : '草稿'));

      var actions = el('div', 'blog-row-actions');
      var editBtn = el('button', 'save', '编辑');
      editBtn.type = 'button';
      editBtn.addEventListener('click', function () { editPost(post); });
      var delBtn = el('button', 'save', '删除');
      delBtn.type = 'button';
      delBtn.addEventListener('click', function () { deletePost(post); });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      row.appendChild(actions);

      postList.appendChild(row);
    });
  }

  function loadPosts() {
    return api('/api/blog/admin-list').then(function (data) {
      posts = Array.isArray(data.posts) ? data.posts : [];
      renderList();
      updatedText.textContent = '最近读取：' + new Date().toLocaleString('zh-CN');
    }).catch(function (error) {
      listFeedback.textContent = error.status === 401 ? '登录已失效，请重新登录。' : '读取文章失败。';
      if (error.status === 401) showAccess('登录已失效，请重新登录。');
    });
  }

  // ---- editor ----
  function field(labelText, inputBuilder, hint) {
    var field = el('div', 'field');
    field.appendChild(el('label', '', labelText));
    field.appendChild(inputBuilder);
    field.appendChild(el('div', 'hint', hint || ''));
    return field;
  }

  function textInput(value, placeholder, onChange) {
    var input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.placeholder = placeholder || '';
    input.addEventListener('input', function () { onChange(input.value); });
    return input;
  }

  function editPost(post) {
    editing = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      category: post.category || '',
      tags: (post.tags || []).join(', '),
      cover: post.cover || '',
      excerpt: post.excerpt || '',
      body_md: post.body_md || '',
      published: Boolean(post.published)
    };
    openEditor();
  }

  function newPost() {
    editing = { id: null, slug: '', title: '', category: '', tags: '', cover: '', excerpt: '', body_md: '', published: false };
    openEditor();
  }

  function openEditor() {
    listArea.hidden = true;
    editorArea.hidden = false;
    editorForm.replaceChildren();

    var row2 = el('div', 'row-2');
    row2.appendChild(field('标题', textInput(editing.title, '文章标题', function (v) { editing.title = v; setDirty(); }), '必填。'));
    row2.appendChild(field('链接 slug', textInput(editing.slug, '可选，留空自动生成', function (v) { editing.slug = v; setDirty(); }), 'URL 后缀；留空由标题自动生成。'));
    editorForm.appendChild(row2);

    var row3 = el('div', 'row-2');
    row3.appendChild(field('分类', textInput(editing.category, '如：设计 / 阅读 / 工作方法', function (v) { editing.category = v; setDirty(); }), '文章卡片上的分类标签。'));
    row3.appendChild(field('标签', textInput(editing.tags, '用逗号分隔', function (v) { editing.tags = v; setDirty(); }), '多个标签，用逗号分隔。'));
    editorForm.appendChild(row3);

    editorForm.appendChild(field('封面图 URL', textInput(editing.cover, 'https://…', function (v) { editing.cover = v; setDirty(); }), '文章卡片与详情页顶图；可留空。'));

    var excerptInput = document.createElement('textarea');
    excerptInput.value = editing.excerpt || '';
    excerptInput.placeholder = '一句话摘要，显示在文章卡片…';
    excerptInput.addEventListener('input', function () { editing.excerpt = excerptInput.value; setDirty(); });
    editorForm.appendChild(field('摘要', excerptInput, '约 60–80 字，显示在列表与详情页。'));

    var mdInput = document.createElement('textarea');
    mdInput.className = 'md';
    mdInput.value = editing.body_md || '';
    mdInput.placeholder = '**正文用 Markdown 编写**：\n\n## 二级标题\n\n- 列表项\n\n```代码块```\n\n> 引用\n\n[链接](https://…)';
    mdInput.addEventListener('input', function () { editing.body_md = mdInput.value; setDirty(); });
    editorForm.appendChild(field('正文（Markdown）', mdInput, '支持标题、粗体、列表、引用、代码块、表格、图片链接。保存时自动转换为页面 HTML 并计算阅读时长。'));

    // publish toggle
    var pubWrap = el('div', 'field');
    pubWrap.appendChild(el('label', '', '发布'));
    var pubRow = el('div', 'checkbox');
    var pub = document.createElement('input');
    pub.type = 'checkbox';
    pub.checked = Boolean(editing.published);
    pub.addEventListener('change', function () { editing.published = pub.checked; setDirty(); });
    pubRow.appendChild(pub);
    pubRow.appendChild(el('span', '', '在网站中显示这篇文章'));
    pubWrap.appendChild(pubRow);
    pubWrap.appendChild(el('div', 'hint', '关闭后仅保留为草稿，不在 About 与详情页展示。'));
    editorForm.appendChild(pubWrap);

    var actions = el('div', 'editor-actions');
    var cancel = el('button', 'save', '取消');
    cancel.type = 'button';
    cancel.addEventListener('click', function () { editing = null; editing.body_md = ''; showList(); });
    actions.appendChild(cancel);
    if (editing && editing.id) {
      var del = el('button', 'save danger', '删除这篇文章');
      del.type = 'button';
      del.addEventListener('click', function () { deletePost({ id: editing.id, title: editing.title }); });
      actions.appendChild(del);
    }
    editorForm.appendChild(actions);

    editorArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showList() {
    editing = null;
    editorArea.hidden = true;
    listArea.hidden = false;
    dirty = false;
    saveStatus.textContent = '';
    renderList();
  }

  function setDirty() {
    dirty = true;
    saveStatus.textContent = '有尚未保存的修改';
    saveStatus.className = '';
  }

  // ---- save / delete ----
  function savePost() {
    if (!editing) return;
    if (!String(editing.title || '').trim()) { saveStatus.textContent = '请先填写标题。'; saveStatus.className = 'save-status-error'; return; }
    saveBtn.disabled = true;
    saveBtn.textContent = '正在保存…';
    saveStatus.textContent = '正在保存…';
    api('/api/blog/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editing.id,
        title: editing.title,
        slug: editing.slug,
        category: editing.category,
        tags: editing.tags,
        cover: editing.cover,
        excerpt: editing.excerpt,
        body_md: editing.body_md,
        published: editing.published
      })
    }).then(function (data) {
      dirty = false;
      saveStatus.textContent = '已保存。' + (data.slug ? ' 链接：/blog-post.html?post=' + data.slug : '');
      saveStatus.className = 'save-status-ok';
      return loadPosts().then(function () { showList(); });
    }).catch(function (error) {
      saveStatus.textContent = error.status === 401 ? '登录已失效，请重新登录' : '保存失败，请稍后重试';
      saveStatus.className = 'save-status-error';
      if (error.status === 401) showAccess('登录已失效，请重新登录。');
    }).finally(function () {
      saveBtn.disabled = false;
      saveBtn.textContent = '保存文章';
    });
  }

  function deletePost(post) {
    if (!post || !post.id) return;
    if (!window.confirm('确定删除《' + (post.title || '这篇文章') + '》吗？该操作不可撤销。')) return;
    api('/api/blog/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id })
    }).then(function () {
      listFeedback.textContent = '已删除。';
      return loadPosts();
    }).catch(function (error) {
      listFeedback.textContent = error.status === 401 ? '登录已失效，请重新登录' : '删除失败。';
      if (error.status === 401) showAccess('登录已失效，请重新登录。');
    });
  }

  // ---- auth ----
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var button = loginForm.querySelector('button');
    button.disabled = true;
    loginMessage.textContent = '正在验证…';
    api('/api/ops/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: document.getElementById('email').value, password: document.getElementById('password').value })
    }).then(function () {
      document.getElementById('password').value = '';
      showAdmin();
      return loadPosts();
    }).catch(function (error) {
      loginMessage.textContent = error.message === 'invalid_credentials' ? '邮箱或密码不正确。' : '暂时无法登录，请稍后重试。';
    }).finally(function () { button.disabled = false; });
  });

  saveBtn.addEventListener('click', savePost);
  document.getElementById('newPost').addEventListener('click', newPost);
  document.getElementById('newPost2').addEventListener('click', newPost);

  window.addEventListener('beforeunload', function (event) {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  api('/api/ops/session').then(function (session) {
    if (session.authenticated) { showAdmin(); loadPosts(); }
    else showAccess('请先登录管理员账号。');
  }).catch(function () { showAccess('暂时无法连接登录服务。'); });
})();
