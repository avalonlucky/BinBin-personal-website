(function () {
  'use strict';

  var state = { authenticated: false, setupRequired: false, email: '', range: 7, data: null, loading: false, stagePath: '', clickPath: '' };
  var pageLabels = {
    '/': '首页',
    '/index.html': '首页',
    '/about.html': '关于我',
    '/work/ankki-product-sheets.html': '昂楷科技产品单页系列',
    '/work/ankki-product-sheets': '昂楷科技产品单页系列',
    '/work/ankki-vision-journal.html': '《昂楷视界》企业内刊',
    '/work/ankki-vision-journal': '《昂楷视界》企业内刊',
    '/work/ankki-culture-wall.html': '昂楷科技文化墙与展厅',
    '/work/ankki-culture-wall': '昂楷科技文化墙与展厅'
  };
  var sourceLabels = { direct: '直接访问', 'www.google.com': 'Google', 'google.com': 'Google', 'www.baidu.com': '百度', 'baidu.com': '百度', 'www.bing.com': 'Bing', 'bing.com': 'Bing' };
  var countryLabels = { CN: '中国', US: '美国', SG: '新加坡', HK: '中国香港', TW: '中国台湾', JP: '日本', KR: '韩国', GB: '英国', DE: '德国', FR: '法国', CA: '加拿大', AU: '澳大利亚', '未知': '未知地区' };
  var eventLabels = { work_open: '打开作品', case_depth_50: '阅读 50%', case_depth_90: '阅读 90%', contact_click: '点击联系', email_copy: '复制邮箱', phone_copy: '复制电话', external_click: '外链点击', ai_prompt_click: '问问 AI', element_click: '页面点击' };
  var sourceColors = ['#ff852d', '#2f7060', '#d7aa36', '#695ea8', '#6d8da8', '#b45f4e', '#8d8b82', '#c7c4b9'];

  var $ = function (id) { return document.getElementById(id); };
  var loginView = $('loginView');
  var dashboard = $('dashboard');
  var loginForm = $('loginForm');
  var loginMessage = $('loginMessage');
  var refreshButton = $('refreshButton');
  var passwordModal = $('passwordModal');
  var passwordForm = $('passwordForm');
  var passwordMessage = $('passwordMessage');

  function formatNumber(value) {
    return new Intl.NumberFormat('zh-CN').format(Number(value) || 0);
  }

  function formatPercent(value, digits) {
    return ((Number(value) || 0) * 100).toFixed(digits == null ? 1 : digits) + '%';
  }

  function formatDuration(seconds) {
    seconds = Math.max(0, Math.round(Number(seconds) || 0));
    if (seconds < 60) return seconds + ' 秒';
    var minutes = Math.floor(seconds / 60);
    var remainder = seconds % 60;
    if (minutes < 60) return minutes + '分' + (remainder ? remainder + '秒' : '');
    var hours = Math.floor(minutes / 60);
    return hours + '小时' + (minutes % 60 ? minutes % 60 + '分' : '');
  }

  function formatRelativeTime(timestamp) {
    if (!timestamp) return '—';
    var seconds = Math.max(0, Math.floor(Date.now() / 1000 - timestamp));
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' 分钟前';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' 小时前';
    return Math.floor(seconds / 86400) + ' 天前';
  }

  function formatDate(timestamp) {
    if (!timestamp) return '尚无访问数据';
    return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp * 1000));
  }

  function delta(current, previous) {
    current = Number(current) || 0;
    previous = Number(previous) || 0;
    if (!previous) return current ? { text: '本期开始积累', className: 'is-up' } : { text: '等待数据', className: '' };
    var rate = (current - previous) / previous;
    return { text: (rate >= 0 ? '↑ ' : '↓ ') + Math.abs(rate * 100).toFixed(1) + '% 较上一周期', className: rate >= 0 ? 'is-up' : 'is-down' };
  }

  function setTrend(id, current, previous) {
    var el = $(id);
    var info = delta(current, previous);
    el.textContent = info.text;
    el.className = 'trend ' + info.className;
  }

  function api(path, options) {
    options = options || {};
    options.credentials = 'same-origin';
    return fetch(path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var error = new Error(data.error || (response.status === 503 ? 'not_configured' : 'request_failed'));
          error.status = response.status;
          throw error;
        }
        return data;
      });
    });
  }

  function showToast(message) {
    var oldToast = document.querySelector('.ops-toast');
    if (oldToast) oldToast.remove();
    var toast = document.createElement('div');
    toast.className = 'ops-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.remove(); }, 220);
    }, 3200);
  }

  function showLogin(message) {
    loginView.hidden = false;
    dashboard.hidden = true;
    $('loginCopy').textContent = state.setupRequired
      ? '首次登录将绑定唯一管理员邮箱。请输入你的邮箱，并使用当前默认密码完成验证。'
      : '使用管理员邮箱和密码登录；也可以从网站右上角的“个人中心”进入。';
    loginMessage.textContent = message || '';
    setTimeout(function () { $('email').focus(); }, 50);
  }

  function showDashboard() {
    loginView.hidden = true;
    dashboard.hidden = false;
    $('sideEmail').textContent = state.email || '管理员';
  }

  function login(email, password) {
    loginMessage.textContent = '正在验证…';
    return api('/api/ops/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (data) {
      state.authenticated = true;
      state.setupRequired = false;
      state.email = data.email || email;
      $('password').value = '';
      showDashboard();
      return loadMetrics().then(function () {
        if (data.setup_completed) openPasswordModal();
      });
    }).catch(function (error) {
      if (error.message === 'invalid_credentials') showLogin('邮箱或密码不正确，请重新输入。');
      else if (error.message === 'too_many_attempts') showLogin('尝试次数过多，请稍后再试。');
      else if (error.message === 'invalid_input') showLogin('请输入有效的邮箱和密码。');
      else if (error.message === 'setup_already_completed') showLogin('管理员账号刚刚完成初始化，请重新登录。');
      else if (error.message === 'not_configured' || error.message === 'dashboard_not_configured') showLogin('后台尚未完成云端配置。');
      else showLogin('暂时无法连接后台，请稍后重试。');
      throw error;
    });
  }

  function setLoading(loading) {
    state.loading = loading;
    refreshButton.disabled = loading;
    refreshButton.classList.toggle('is-loading', loading);
  }

  function loadMetrics() {
    if (state.loading) return Promise.resolve();
    setLoading(true);
    return api('/api/ops/metrics?range=' + state.range).then(function (data) {
      state.data = data;
      render(data);
    }).catch(function (error) {
      if (error.message === 'invalid_session') {
        state.authenticated = false;
        showLogin('登录已失效，请重新输入密码。');
      } else {
        $('systemPill').querySelector('span').textContent = '连接异常';
        $('systemPill').classList.add('is-error');
        $('footerStatus').textContent = '暂时无法刷新数据';
      }
    }).finally(function () { setLoading(false); });
  }

  function render(data) {
    var current = data.summary;
    var previous = data.previous;
    $('rangeLabel').textContent = data.range === 1 ? '过去 24 小时' : '过去 ' + data.range + ' 天';
    $('kpiVisitors').textContent = formatNumber(current.visitors);
    $('kpiVisits').textContent = formatNumber(current.visits);
    $('kpiPageViews').textContent = formatNumber(current.page_views);
    $('kpiConversion').textContent = formatPercent(current.conversion_rate);
    $('pagesPerVisit').textContent = '每次访问 ' + current.pages_per_visit.toFixed(1) + ' 页';
    $('conversionCount').textContent = formatNumber(current.conversions) + ' 次有效联系行为';
    setTrend('trendVisitors', current.visitors, previous.visitors);
    setTrend('trendVisits', current.visits, previous.visits);
    setTrend('trendPageViews', current.page_views, previous.page_views);
    setTrend('trendConversion', current.conversion_rate, previous.conversion_rate);
    $('chartTotal').textContent = formatNumber(current.page_views);

    renderChart(data.series);
    renderRankList(data.pages);
    renderSources(data.sources);
    renderBarList('countryList', data.countries, function (name) { return countryLabels[name] || name; });
    renderDevices(data.devices);
    renderFunnel(current, data.events);
    renderBehavior(data.behavior || {});
    renderVitals(data.vitals);

    var active = data.system.collection === 'active';
    $('sideStateText').textContent = active ? '数据采集正常' : '等待首批访问';
    $('systemPill').querySelector('span').textContent = active ? '采集正常' : '等待数据';
    $('footerStatus').textContent = active ? '数据采集正常' : '已上线，等待首批访问';
    $('lastUpdated').textContent = '最近访问：' + formatDate(current.latest_event) + ' · 刷新于 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  function renderChart(series) {
    var canvas = $('trafficChart');
    var empty = $('chartEmpty');
    var labels = $('chartLabels');
    labels.replaceChildren();
    if (!series || !series.length) {
      empty.hidden = false;
      canvas.hidden = true;
      return;
    }
    empty.hidden = true;
    canvas.hidden = false;
    drawChart(canvas, series);
    var labelIndexes = series.length <= 6 ? series.map(function (_, index) { return index; }) : [0, Math.floor((series.length - 1) / 2), series.length - 1];
    labelIndexes.forEach(function (index) {
      var span = document.createElement('span');
      span.textContent = series[index].label;
      labels.appendChild(span);
    });
  }

  function drawChart(canvas, series) {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    var ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    var width = rect.width;
    var height = rect.height;
    var padding = { top: 18, right: 8, bottom: 18, left: 8 };
    var max = Math.max.apply(null, series.map(function (point) { return point.value; }).concat([1]));
    var points = series.map(function (point, index) {
      var x = padding.left + (series.length === 1 ? (width - padding.left - padding.right) / 2 : index / (series.length - 1) * (width - padding.left - padding.right));
      var y = height - padding.bottom - point.value / max * (height - padding.top - padding.bottom);
      return { x: x, y: y };
    });
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#dddbd1';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach(function (ratioY) {
      var y = padding.top + ratioY * (height - padding.top - padding.bottom);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    });
    var gradient = ctx.createLinearGradient(0, padding.top, 0, height);
    gradient.addColorStop(0, 'rgba(255,133,45,.32)');
    gradient.addColorStop(1, 'rgba(255,133,45,0)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach(function (point, index) { index ? ctx.lineTo(point.x, point.y) : ctx.lineTo(point.x, point.y); });
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();
    ctx.beginPath();
    points.forEach(function (point, index) { index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y); });
    ctx.strokeStyle = '#ff852d'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    points.forEach(function (point) { ctx.beginPath(); ctx.arc(point.x, point.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#fbfaf4'; ctx.fill(); ctx.strokeStyle = '#ff852d'; ctx.lineWidth = 2; ctx.stroke(); });
  }

  function emptyList(container, text) {
    var empty = document.createElement('div');
    empty.className = 'empty-list';
    empty.textContent = text;
    container.replaceChildren(empty);
  }

  function renderRankList(items) {
    var container = $('pagesList');
    if (!items.length) return emptyList(container, '还没有页面浏览数据\n访问网站后会自动出现排名');
    var max = Math.max.apply(null, items.map(function (item) { return item.value; }));
    container.replaceChildren.apply(container, items.map(function (item, index) {
      var row = document.createElement('div'); row.className = 'rank-item';
      var num = document.createElement('span'); num.textContent = String(index + 1).padStart(2, '0');
      var copy = document.createElement('div'); copy.className = 'rank-copy';
      var title = document.createElement('p'); title.textContent = pageLabels[item.name] || item.name;
      var track = document.createElement('div'); var fill = document.createElement('i'); fill.style.width = item.value / max * 100 + '%'; track.appendChild(fill);
      copy.append(title, track);
      var value = document.createElement('strong'); value.textContent = formatNumber(item.value);
      row.append(num, copy, value); return row;
    }));
  }

  function renderSources(items) {
    var container = $('sourceList');
    var total = items.reduce(function (sum, item) { return sum + item.value; }, 0);
    $('sourceTotal').textContent = formatNumber(total);
    if (!items.length) {
      $('sourceDonut').style.background = '#e1dfd6';
      return emptyList(container, '等待来源数据');
    }
    var cursor = 0;
    var stops = items.map(function (item, index) {
      var start = cursor; cursor += total ? item.value / total * 100 : 0;
      return sourceColors[index % sourceColors.length] + ' ' + start + '% ' + cursor + '%';
    });
    $('sourceDonut').style.background = 'conic-gradient(' + stops.join(',') + ')';
    container.replaceChildren.apply(container, items.map(function (item, index) {
      var row = document.createElement('div'); row.className = 'source-item'; row.style.setProperty('--color', sourceColors[index % sourceColors.length]);
      var dot = document.createElement('i'); var label = document.createElement('span'); label.textContent = sourceLabels[item.name] || item.name;
      var value = document.createElement('strong'); value.textContent = total ? (item.value / total * 100).toFixed(0) + '%' : '0%';
      row.append(dot, label, value); return row;
    }));
  }

  function renderBarList(id, items, labeler) {
    var container = $(id);
    if (!items.length) return emptyList(container, '等待访客地区数据');
    var max = Math.max.apply(null, items.map(function (item) { return item.value; }));
    container.replaceChildren.apply(container, items.map(function (item) {
      var row = document.createElement('div'); row.className = 'bar-row';
      var name = document.createElement('span'); name.textContent = labeler(item.name);
      var track = document.createElement('div'); track.className = 'bar-track'; var fill = document.createElement('i'); fill.style.width = item.value / max * 100 + '%'; track.appendChild(fill);
      var value = document.createElement('strong'); value.textContent = formatNumber(item.value);
      row.append(name, track, value); return row;
    }));
  }

  function renderDevices(items) {
    var container = $('deviceList');
    if (!items.length) return emptyList(container, '等待设备数据');
    var total = items.reduce(function (sum, item) { return sum + item.value; }, 0);
    var icons = { '桌面端': '桌', '移动端': '移', '平板': '板', '其他': '其' };
    container.replaceChildren.apply(container, items.map(function (item) {
      var row = document.createElement('div'); row.className = 'device-row';
      var label = document.createElement('div'); label.className = 'device-label'; var icon = document.createElement('i'); icon.textContent = icons[item.name] || '其'; var name = document.createElement('span'); name.textContent = item.name; label.append(icon, name);
      var track = document.createElement('div'); track.className = 'device-track'; var fill = document.createElement('i'); fill.style.width = (total ? item.value / total * 100 : 0) + '%'; track.appendChild(fill);
      var value = document.createElement('strong'); value.textContent = total ? (item.value / total * 100).toFixed(0) + '%' : '0%';
      row.append(label, track, value); return row;
    }));
  }

  function renderFunnel(summary, events) {
    $('funnelVisits').textContent = formatNumber(summary.visits);
    $('funnelWorks').textContent = formatNumber(summary.work_visits);
    $('funnelContacts').textContent = formatNumber(summary.conversions);
    $('funnelWorksRate').textContent = summary.visits ? formatPercent(summary.work_visits / summary.visits) : '—';
    $('funnelContactsRate').textContent = summary.visits ? formatPercent(summary.conversions / summary.visits) : '—';
    var container = $('eventStrip');
    if (!events.length) {
      var chip = document.createElement('div'); chip.className = 'event-chip'; chip.textContent = '互动事件将在这里出现'; container.replaceChildren(chip); return;
    }
    container.replaceChildren.apply(container, events.map(function (event) {
      var chip = document.createElement('div'); chip.className = 'event-chip'; var label = document.createElement('span'); label.textContent = eventLabels[event.name] || event.name; var value = document.createElement('strong'); value.textContent = formatNumber(event.value); chip.append(label, value); return chip;
    }));
  }

  function uniquePaths(items, key) {
    var seen = Object.create(null);
    var paths = [];
    (items || []).forEach(function (item) {
      var path = item[key || 'path'];
      if (path && !seen[path]) { seen[path] = true; paths.push(path); }
    });
    return paths;
  }

  function populateSelect(select, paths, preferred) {
    var selected = paths.indexOf(preferred) >= 0 ? preferred : (paths[0] || '');
    select.replaceChildren.apply(select, paths.map(function (path) {
      var option = document.createElement('option');
      option.value = path;
      option.textContent = pageLabels[path] || path;
      return option;
    }));
    if (!paths.length) {
      var empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '等待数据';
      select.appendChild(empty);
    }
    select.value = selected;
    return selected;
  }

  function renderBehavior(behavior) {
    var summary = behavior.summary || {};
    $('behaviorAvgTime').textContent = summary.engaged_work_sessions ? formatDuration(summary.avg_work_seconds) : '—';
    $('behaviorSessions').textContent = summary.engaged_work_sessions ? formatNumber(summary.engaged_work_sessions) + ' 次有停留的作品访问' : '等待停留数据';
    $('behaviorDeepVisitors').textContent = formatNumber(summary.deep_visitors);
    $('behaviorClicks').textContent = formatNumber(summary.clicks);

    renderWorkDwell(behavior.works || []);
    renderIntentVisitors(behavior.visitors || []);

    var stagePaths = uniquePaths((behavior.works || []).concat(behavior.sections || []));
    state.stagePath = populateSelect($('stageWorkSelect'), stagePaths, state.stagePath);
    renderStageDwell(behavior.sections || [], state.stagePath);

    var clickPaths = uniquePaths((behavior.click_points || []).concat(behavior.click_targets || []));
    state.clickPath = populateSelect($('clickWorkSelect'), clickPaths, state.clickPath);
    renderClickMap(behavior.click_points || [], behavior.click_targets || [], state.clickPath);
    renderIpTable(behavior.ips || []);
  }

  function renderWorkDwell(items) {
    var container = $('workDwellList');
    if (!items.length) return emptyList(container, '还没有作品有效停留数据\n访客同意统计并阅读作品后会自动出现');
    container.replaceChildren.apply(container, items.map(function (item, index) {
      var row = document.createElement('div'); row.className = 'engagement-row';
      var rank = document.createElement('span'); rank.className = 'engagement-rank'; rank.textContent = String(index + 1).padStart(2, '0');
      var copy = document.createElement('div'); copy.className = 'engagement-copy';
      var title = document.createElement('p'); title.textContent = pageLabels[item.path] || item.path;
      var detail = document.createElement('small'); detail.textContent = formatNumber(item.visitors) + ' 位访客 · 累计 ' + formatDuration(item.total_seconds);
      copy.append(title, detail);
      var time = document.createElement('div'); time.className = 'engagement-time';
      var strong = document.createElement('strong'); strong.textContent = formatDuration(item.avg_seconds);
      var small = document.createElement('small'); small.textContent = formatNumber(item.sessions) + ' 次访问';
      time.append(strong, small);
      row.append(rank, copy, time);
      return row;
    }));
  }

  function renderIntentVisitors(items) {
    var container = $('visitorIntentList');
    if (!items.length) return emptyList(container, '尚无深度行为数据\n这里会显示匿名访客，不对应真实姓名');
    container.replaceChildren.apply(container, items.slice(0, 12).map(function (item) {
      var row = document.createElement('div'); row.className = 'visitor-row';
      var id = String(item.visitor_id || '').replace(/-/g, '').slice(-6).toUpperCase() || '未知';
      var title = document.createElement('p'); title.append(document.createTextNode('访客 '));
      var visitorCode = document.createElement('strong'); visitorCode.textContent = '#' + id; title.appendChild(visitorCode);
      var time = document.createElement('strong'); time.textContent = formatDuration(item.work_seconds);
      var meta = document.createElement('div'); meta.className = 'visitor-meta';
      var workName = pageLabels[item.work_path] || item.work_path || '未知作品';
      [workName, countryLabels[item.country] || item.country || '未知地区', item.device || '未知设备', formatNumber(item.visits) + ' 次访问', formatNumber(item.clicks) + ' 次点击', formatRelativeTime(item.last_seen)].forEach(function (value) {
        var chip = document.createElement('span'); chip.textContent = value; meta.appendChild(chip);
      });
      if (item.contacts) { var contact = document.createElement('span'); contact.textContent = '已产生联系'; meta.appendChild(contact); }
      row.append(title, time, meta);
      return row;
    }));
  }

  function renderStageDwell(items, path) {
    var container = $('stageDwellList');
    var filtered = items.filter(function (item) { return item.path === path; });
    if (!filtered.length) return emptyList(container, '等待该作品的阶段停留数据');
    var max = Math.max.apply(null, filtered.map(function (item) { return item.avg_seconds; }).concat([1]));
    container.replaceChildren.apply(container, filtered.map(function (item) {
      var row = document.createElement('div'); row.className = 'stage-row';
      var name = document.createElement('span'); name.textContent = item.section;
      var track = document.createElement('div'); track.className = 'stage-track';
      var fill = document.createElement('i'); fill.style.width = Math.max(3, item.avg_seconds / max * 100) + '%'; track.appendChild(fill);
      var time = document.createElement('strong'); time.textContent = formatDuration(item.avg_seconds);
      var detail = document.createElement('small'); detail.textContent = formatNumber(item.visitors) + ' 人';
      row.append(name, track, time, detail);
      return row;
    }));
  }

  function renderClickMap(points, targets, path) {
    var pointContainer = $('clickMapPoints');
    var empty = $('clickMapEmpty');
    var filteredPoints = points.filter(function (item) { return item.path === path; });
    pointContainer.replaceChildren.apply(pointContainer, filteredPoints.map(function (item) {
      var point = document.createElement('i');
      point.className = 'click-point';
      point.style.left = Math.max(2, Math.min(98, item.x * 100)) + '%';
      point.style.top = Math.max(1, Math.min(99, item.y * 100)) + '%';
      point.style.setProperty('--size', Math.min(38, 12 + Math.log2(item.clicks + 1) * 7) + 'px');
      point.title = item.clicks + ' 次点击';
      return point;
    }));
    empty.hidden = filteredPoints.length > 0;

    var targetContainer = $('clickTargetList');
    var filteredTargets = targets.filter(function (item) { return item.path === path; }).slice(0, 14);
    if (!filteredTargets.length) return emptyList(targetContainer, '等待该页面的点击目标数据');
    targetContainer.replaceChildren.apply(targetContainer, filteredTargets.map(function (item, index) {
      var row = document.createElement('div'); row.className = 'click-target';
      var rank = document.createElement('span'); rank.textContent = String(index + 1).padStart(2, '0');
      var copy = document.createElement('div'); copy.className = 'click-target-copy';
      var title = document.createElement('p'); title.textContent = item.target;
      var section = document.createElement('small'); section.textContent = item.section + ' · ' + formatNumber(item.visitors) + ' 位访客';
      copy.append(title, section);
      var clicks = document.createElement('strong'); clicks.textContent = formatNumber(item.clicks);
      row.append(rank, copy, clicks);
      return row;
    }));
  }

  function renderIpTable(items) {
    var body = $('ipTableBody');
    var empty = $('ipTableEmpty');
    if (!items.length) {
      body.replaceChildren();
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    body.replaceChildren.apply(body, items.map(function (item) {
      var row = document.createElement('tr');
      var workNames = String(item.works || '').split(',').filter(Boolean).slice(0, 2).map(function (path) { return pageLabels[path] || path; }).join('、') || '—';
      [
        item.ip,
        workNames,
        countryLabels[item.country] || item.country || '未知',
        formatNumber(item.visits),
        formatNumber(item.page_views),
        formatDuration(item.work_seconds),
        formatNumber(item.clicks),
        formatRelativeTime(item.last_seen)
      ].forEach(function (value) { var cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell); });
      return row;
    }));
  }

  function renderVitals(vitals) {
    renderVital('LCP', 'vitalLcp', vitals.LCP, function (value) { return (value / 1000).toFixed(2) + ' s'; }, [2500, 4000]);
    renderVital('INP', 'vitalInp', vitals.INP, function (value) { return Math.round(value) + ' ms'; }, [200, 500]);
    renderVital('CLS', 'vitalCls', vitals.CLS, function (value) { return value.toFixed(3); }, [0.1, 0.25]);
    renderVital('LOAD', 'vitalLoad', vitals.LOAD, function (value) { return (value / 1000).toFixed(2) + ' s'; }, [3000, 5000]);
  }

  function renderVital(name, id, metric, formatter, thresholds) {
    var card = document.querySelector('[data-vital="' + name + '"]');
    card.classList.remove('is-good', 'is-warn', 'is-bad');
    if (!metric || metric.value == null) { $(id).textContent = '—'; return; }
    $(id).textContent = formatter(metric.value);
    card.classList.add(metric.value <= thresholds[0] ? 'is-good' : metric.value <= thresholds[1] ? 'is-warn' : 'is-bad');
  }

  function openPasswordModal() {
    passwordForm.reset();
    passwordMessage.textContent = '';
    passwordModal.hidden = false;
    setTimeout(function () { $('currentPassword').focus(); }, 50);
  }

  function closePasswordModal() {
    passwordModal.hidden = true;
    passwordForm.reset();
    passwordMessage.textContent = '';
    $('changePasswordButton').focus();
  }

  function changePassword(currentPassword, newPassword) {
    var button = passwordForm.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = '正在保存…';
    passwordMessage.textContent = '正在保存…';
    return api('/api/ops/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    }).then(function (data) {
      state.email = data.email || state.email;
      $('sideEmail').textContent = state.email || '管理员';
      closePasswordModal();
      $('footerStatus').textContent = '密码已更新，其他设备上的登录已失效';
      showToast('密码已更新，其他设备上的登录已失效');
    }).catch(function (error) {
      if (error.message === 'invalid_current_password') showPasswordError('当前密码不正确。', $('currentPassword'), true);
      else if (error.message === 'password_required') showPasswordError('请输入新密码。', $('newPassword'));
      else if (error.message === 'password_reused') showPasswordError('新密码不能与当前密码相同。', $('newPassword'));
      else if (error.message === 'too_many_attempts') showPasswordError('尝试次数过多，请稍后再试。');
      else if (error.message === 'invalid_session' || error.message === 'session_changed') {
        closePasswordModal();
        state.authenticated = false;
        showLogin('登录已失效，请重新登录。');
        showToast('登录已失效，请重新登录');
      } else showPasswordError('暂时无法修改密码，请稍后重试。');
      throw error;
    }).finally(function () {
      button.disabled = false;
      button.textContent = '保存新密码';
    });
  }

  function showPasswordError(message, field, selectValue) {
    passwordMessage.textContent = message;
    showToast(message);
    if (!field) return;
    field.focus();
    if (selectValue && typeof field.select === 'function') field.select();
  }

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    login($('email').value, $('password').value).catch(function () {});
  });
  $('changePasswordButton').addEventListener('click', openPasswordModal);
  $('passwordModalClose').addEventListener('click', closePasswordModal);
  $('passwordModalBackdrop').addEventListener('click', closePasswordModal);
  passwordForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var currentValue = $('currentPassword').value;
    var newValue = $('newPassword').value;
    if (!currentValue) {
      showPasswordError('请输入当前密码。', $('currentPassword'));
      return;
    }
    if (!newValue) {
      showPasswordError('请输入新密码。', $('newPassword'));
      return;
    }
    if (currentValue === newValue) {
      showPasswordError('新密码不能与当前密码相同。', $('newPassword'));
      return;
    }
    if (newValue !== $('confirmPassword').value) {
      showPasswordError('两次输入的新密码不一致。', $('confirmPassword'));
      return;
    }
    changePassword(currentValue, newValue).catch(function () {});
  });
  refreshButton.addEventListener('click', loadMetrics);
  $('logoutButton').addEventListener('click', function () {
    var button = $('logoutButton');
    button.disabled = true;
    api('/api/ops/logout', { method: 'POST' }).then(function () {
      state.authenticated = false;
      state.data = null;
      state.email = '';
      $('password').value = '';
      showLogin('已安全退出。');
    }).catch(function () {
      $('footerStatus').textContent = '暂时无法退出，请稍后重试';
    }).finally(function () { button.disabled = false; });
  });
  document.querySelectorAll('[data-range]').forEach(function (button) {
    button.addEventListener('click', function () {
      state.range = Number(button.dataset.range);
      document.querySelectorAll('[data-range]').forEach(function (item) { item.classList.toggle('is-active', item === button); });
      loadMetrics();
    });
  });
  $('stageWorkSelect').addEventListener('change', function (event) {
    state.stagePath = event.target.value;
    if (state.data && state.data.behavior) renderStageDwell(state.data.behavior.sections || [], state.stagePath);
  });
  $('clickWorkSelect').addEventListener('change', function (event) {
    state.clickPath = event.target.value;
    if (state.data && state.data.behavior) renderClickMap(state.data.behavior.click_points || [], state.data.behavior.click_targets || [], state.clickPath);
  });
  window.addEventListener('resize', function () { if (state.data) renderChart(state.data.series); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !passwordModal.hidden) closePasswordModal();
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && state.authenticated) loadMetrics(); });
  setInterval(function () { if (!document.hidden && state.authenticated) loadMetrics(); }, 60000);

  sessionStorage.removeItem('maridian_ops_password');
  api('/api/ops/session').then(function (data) {
    state.authenticated = Boolean(data.authenticated);
    state.setupRequired = Boolean(data.setup_required);
    state.email = data.email || '';
    if (state.authenticated) {
      showDashboard();
      loadMetrics();
    } else {
      showLogin('');
    }
  }).catch(function (error) {
    showLogin(error.message === 'not_configured' || error.message === 'dashboard_not_configured' ? '后台尚未完成云端配置。' : '暂时无法连接后台，请稍后重试。');
  });
})();
