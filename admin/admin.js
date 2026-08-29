(function () {
  'use strict';

  var DEFINITIONS = [
    {
      key: 'profile', type: 'single', title: 'Profile', note: '个人名片卡片',
      fields: [
        ['Name', '姓名', 'text', '你的名字', 'PROFILE 卡片中的姓名。'],
        ['Alias', '署名 / 徽章名', 'text', 'MERIDIAN', '姓名旁边的英文或品牌徽章。'],
        ['Title', '职位', 'text', '设计师', '你的职业与角色。'],
        ['Company', '公司', 'text', '公司名称', '个人名片中的公司名称。'],
        ['Location', '城市', 'text', '城市, 国家', '个人名片中的所在地。'],
        ['Status', '状态', 'select', '', '个人名片右上角的状态标签。', ['开放机会', '可用', '忙', '开放合作']],
        ['Bio', '个人简介', 'textarea', '一段自我介绍…', '访客第一眼看到的完整自我介绍。'],
        ['Description', '副标题 / 一句话描述', 'textarea', '简短描述…', '个人名片中的辅助说明。'],
        ['Images', '头像图 URL', 'url', 'https://…', '圆形头像；留空时使用复刻站默认头像。'],
        ['Cover', '背景图 URL', 'url', 'https://…', '组件的背景或封面图片。'],
        ['LinkedIn', '领英链接', 'url', 'https://www.linkedin.com/in/…', 'LinkedIn 按钮的目标地址。'],
        ['Email', '邮箱', 'email', 'you@example.com', 'Let’s chat 按钮使用的邮箱。'],
        ['Highlights', '高亮统计', 'highlights', '', '个人名片下方的数字与说明。'],
        ['Tags', '标签', 'multi', 'profile, design', '用逗号分隔多个标签。'],
        ['Category', '分类', 'select', '', '内容分类。', ['个人', '工作']],
        ['Published', '发布', 'checkbox', '', '关闭后该内容不会在 Side B 显示。'],
        ['Created', '创建日期', 'date', '', '用于排序或时间显示。'],
        ['Author', '作者', 'text', '你的名字', '内容作者标注。']
      ]
    },
    {
      key: 'listening', type: 'list', title: 'Listening', note: '最近在听',
      fields: [
        ['Title', '曲名', 'text', '曲目名称', '歌曲标题。'], ['Subtitle', '歌手', 'text', '歌手名', '歌曲下方的艺术家名称。'],
        ['Thumbnail', '封面图 URL', 'url', 'https://…', '歌曲封面缩略图。'], ['Link', '音乐链接', 'url', 'https://…', '点击歌曲后的跳转地址。'],
        ['Created', '添加日期', 'date', '', '列表排序依据。'], ['Category', '分类', 'select', '', '内容分类。', ['音乐']],
        ['Published', '发布', 'checkbox', '', '关闭后隐藏这首歌曲。']
      ]
    },
    {
      key: 'achievements', type: 'list', title: 'Achievements', note: '成就 / 奖项',
      fields: [
        ['Title', '奖项名', 'text', '奖项名称', '成就卡片标题。'], ['Description', '描述', 'textarea', '描述这个奖项…', '奖项的简短说明。'],
        ['Thumbnail', '缩略图 URL', 'url', 'https://…', '奖项或报道图片。'], ['Link', '详情链接', 'url', 'https://…', '官网或详情页面。'],
        ['Year', '年份', 'date', '', '获奖年份及排序依据。'], ['Source', '来源', 'text', '机构名称', '颁发机构或媒体来源。'],
        ['Details', '详情', 'textarea', '更多详情…', '按需展开的详细信息。'], ['Type', '类型', 'select', '', '内容类型。', ['奖项', '报道', '认可']],
        ['Published', '发布', 'checkbox', '', '关闭后隐藏该条目。']
      ]
    },
    {
      key: 'film', type: 'list', title: 'Film', note: '影片作品',
      fields: [
        ['Title', '片名', 'text', '影片名称', '影片标题。'], ['Description', '描述', 'textarea', '简短描述…', '影片说明。'],
        ['Thumbnail', '缩略图 URL', 'url', 'https://…', '影片预览图片。'], ['Link', '影片链接', 'url', 'https://…', 'Vimeo、YouTube 或站内地址。'],
        ['Created time', '创建时间', 'date', '', '影片排序依据。'], ['Category', '分类', 'select', '', '内容分类。', ['作品']],
        ['Published', '发布', 'checkbox', '', '关闭后隐藏该影片。']
      ]
    },
    {
      key: 'facts', type: 'list', title: 'Facts', note: '随机冷知识',
      fields: [
        ['Title', '标题', 'text', '冷知识标题', '冷知识卡片标题。'], ['Description', '内容', 'textarea', '一条有趣的冷知识…', '冷知识正文。'],
        ['Image', '配图 URL', 'url', 'https://…', '冷知识的配图。'], ['Category', '分类', 'select', '', '内容分类。', ['冷知识']],
        ['Published', '发布', 'checkbox', '', '关闭后隐藏该条目。'], ['Created time', '创建时间', 'date', '', '内容排序依据。']
      ]
    }
  ];

  var data = null;
  var dirty = false;
  var accessView = document.getElementById('accessView');
  var adminView = document.getElementById('adminView');
  var app = document.getElementById('formApp');
  var status = document.getElementById('saveStatus');
  var saveButtons = [document.getElementById('saveTop'), document.getElementById('saveBottom')];

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

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function setDirty() {
    dirty = true;
    status.textContent = '有尚未保存的修改';
    status.className = '';
  }

  function createInput(definition, value, onChange) {
    var key = definition[0];
    var labelText = definition[1];
    var type = definition[2];
    var placeholder = definition[3];
    var hintText = definition[4];
    var options = definition[5] || [];
    var field = element('div', 'field' + ((type === 'textarea' || type === 'highlights') ? ' full' : ''));
    var label = element('label', '', labelText);
    field.appendChild(label);

    if (type === 'highlights') {
      var list = Array.isArray(value) ? value : [];
      var rows = element('div', 'highlight-list');
      function drawHighlights() {
        rows.replaceChildren();
        list.forEach(function (item, index) {
          var row = element('div', 'highlight-row');
          var first = element('div', 'field');
          first.append(element('label', '', '数字'), createTextInput('text', item.label, '7+', function (next) { item.label = next; onChange(list); }));
          var second = element('div', 'field');
          second.append(element('label', '', '说明'), createTextInput('text', item.value, '年经验', function (next) { item.value = next; onChange(list); }));
          var remove = element('button', 'remove', '×');
          remove.type = 'button';
          remove.setAttribute('aria-label', '删除这项统计');
          remove.addEventListener('click', function () { list.splice(index, 1); onChange(list); drawHighlights(); });
          row.append(first, second, remove);
          rows.appendChild(row);
        });
      }
      drawHighlights();
      var addHighlight = element('button', 'add', '＋ 添加统计');
      addHighlight.type = 'button';
      addHighlight.addEventListener('click', function () { list.push({ label: '', value: '' }); onChange(list); drawHighlights(); });
      field.append(rows, addHighlight);
    } else if (type === 'checkbox') {
      var checkboxRow = element('div', 'checkbox');
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(value);
      checkbox.addEventListener('change', function () { onChange(checkbox.checked); });
      checkboxRow.append(checkbox, element('span', '', '在网站中显示'));
      field.appendChild(checkboxRow);
    } else if (type === 'select') {
      var select = document.createElement('select');
      options.forEach(function (option) {
        var item = document.createElement('option');
        item.value = option;
        item.textContent = option;
        item.selected = option === value;
        select.appendChild(item);
      });
      select.addEventListener('change', function () { onChange(select.value); });
      field.appendChild(select);
    } else if (type === 'textarea') {
      var textarea = document.createElement('textarea');
      textarea.value = value || '';
      textarea.placeholder = placeholder || '';
      textarea.addEventListener('input', function () { onChange(textarea.value); });
      field.appendChild(textarea);
    } else {
      field.appendChild(createTextInput(type === 'multi' ? 'text' : type, type === 'multi' && Array.isArray(value) ? value.join(', ') : value, placeholder, function (next) {
        onChange(type === 'multi' ? next.split(',').map(function (item) { return item.trim(); }).filter(Boolean) : next);
      }));
    }
    field.appendChild(element('div', 'hint', hintText));
    return field;
  }

  function createTextInput(type, value, placeholder, onChange) {
    var input = document.createElement('input');
    input.type = ['text', 'url', 'email', 'date'].indexOf(type) >= 0 ? type : 'text';
    input.value = value || '';
    input.placeholder = placeholder || '';
    input.addEventListener('input', function () { onChange(input.value); });
    return input;
  }

  function renderEntry(section, definition, item, index) {
    var entry = element('article', 'entry');
    var grid = element('div', 'field-grid');
    definition.fields.forEach(function (fieldDefinition) {
      grid.appendChild(createInput(fieldDefinition, item[fieldDefinition[0]], function (value) {
        item[fieldDefinition[0]] = value;
        setDirty();
      }));
    });
    entry.appendChild(grid);
    if (definition.type === 'list') {
      var remove = element('button', 'remove', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', '删除第 ' + (index + 1) + ' 条内容');
      remove.addEventListener('click', function () {
        data[definition.key].splice(index, 1);
        setDirty();
        render();
      });
      entry.appendChild(remove);
    }
    section.appendChild(entry);
  }

  function render() {
    app.replaceChildren();
    var nav = document.getElementById('sectionNav');
    nav.replaceChildren();
    DEFINITIONS.forEach(function (definition, sectionIndex) {
      var id = 'content-' + definition.key;
      var navLink = element('a', '', String(sectionIndex + 1).padStart(2, '0') + ' · ' + definition.title);
      navLink.href = '#' + id;
      nav.appendChild(navLink);

      var section = element('section', 'content-section');
      section.id = id;
      var head = element('div', 'section-head');
      var titleWrap = element('div');
      titleWrap.append(element('p', 'eyebrow', String(sectionIndex + 1).padStart(2, '0')), element('h2', '', definition.title));
      head.append(titleWrap, element('p', '', definition.note));
      section.appendChild(head);

      if (definition.type === 'single') {
        data[definition.key] = data[definition.key] || {};
        renderEntry(section, definition, data[definition.key], 0);
      } else {
        data[definition.key] = Array.isArray(data[definition.key]) ? data[definition.key] : [];
        data[definition.key].forEach(function (item, index) { renderEntry(section, definition, item, index); });
        var add = element('button', 'add', '＋ 添加一条');
        add.type = 'button';
        add.addEventListener('click', function () {
          var item = {};
          definition.fields.forEach(function (field) { item[field[0]] = field[2] === 'checkbox' ? true : field[2] === 'multi' ? [] : ''; });
          data[definition.key].push(item);
          setDirty();
          render();
          document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
        section.appendChild(add);
      }
      app.appendChild(section);
    });
  }

  function showAccess(message) {
    adminView.hidden = true;
    accessView.hidden = false;
    document.getElementById('loginMessage').textContent = message || '';
  }

  function showAdmin() {
    accessView.hidden = true;
    adminView.hidden = false;
  }

  function loadData() {
    return api('/api/admin/data').then(function (response) {
      var meta = response._meta || {};
      delete response._meta;
      data = response;
      dirty = false;
      status.textContent = '所有修改均已保存';
      status.className = 'save-status-ok';
      var updated = meta.updated_at ? new Date(meta.updated_at * 1000).toLocaleString('zh-CN') : '尚未保存';
      document.getElementById('updatedText').textContent = '最近保存：' + updated + (meta.updated_by ? ' · ' + meta.updated_by : '');
      render();
      showAdmin();
    }).catch(function (error) {
      if (error.status === 401) showAccess('请先登录管理员账号。');
      else showAccess('暂时无法读取后台数据，请稍后再试。');
    });
  }

  function save() {
    if (!data) return;
    saveButtons.forEach(function (button) { button.disabled = true; button.textContent = '正在保存…'; });
    status.textContent = '正在保存到网站数据库…';
    status.className = '';
    api('/api/admin/save', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(function (response) {
      dirty = false;
      status.textContent = '已保存，Side B 刷新后即可看到';
      status.className = 'save-status-ok';
      document.getElementById('updatedText').textContent = '最近保存：' + new Date(response.updated_at * 1000).toLocaleString('zh-CN');
    }).catch(function (error) {
      status.textContent = error.status === 401 ? '登录已失效，请重新登录' : '保存失败，请稍后重试';
      status.className = 'save-status-error';
      if (error.status === 401) showAccess('登录已失效，请重新登录。');
    }).finally(function () {
      saveButtons.forEach(function (button) { button.disabled = false; button.textContent = '保存修改'; });
    });
  }

  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var button = event.currentTarget.querySelector('button');
    button.disabled = true;
    document.getElementById('loginMessage').textContent = '正在验证…';
    api('/api/ops/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: document.getElementById('email').value, password: document.getElementById('password').value })
    }).then(function () {
      document.getElementById('password').value = '';
      return loadData();
    }).catch(function (error) {
      document.getElementById('loginMessage').textContent = error.message === 'invalid_credentials' ? '邮箱或密码不正确。' : '暂时无法登录，请稍后重试。';
    }).finally(function () { button.disabled = false; });
  });

  saveButtons.forEach(function (button) { button.addEventListener('click', save); });
  window.addEventListener('beforeunload', function (event) {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  api('/api/ops/session').then(function (session) {
    if (session.authenticated) return loadData();
    showAccess('请先登录管理员账号。');
  }).catch(function () { showAccess('暂时无法连接登录服务。'); });
})();
