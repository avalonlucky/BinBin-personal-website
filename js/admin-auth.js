(function () {
  'use strict';

  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-admin-auth]'));
  if (!triggers.length) return;

  var authenticated = false;
  var setupRequired = false;
  var adminEmail = '';
  var activeTrigger = null;
  var layer;
  var dialogPanel;
  var loginView;
  var accountView;
  var loginIntro;
  var loginForm;
  var emailInput;
  var passwordInput;
  var loginMessage;
  var accountEmail;
  var accountMessage;
  var submitButton;
  var passwordDetails;
  var passwordForm;
  var passwordMessage;

  function element(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function requestJson(path, options) {
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

  function setTriggerState() {
    triggers.forEach(function (button) {
      var label = authenticated ? '个人中心' : '登录';
      var span = button.querySelector('span');
      if (span) span.textContent = label;
      button.setAttribute('aria-label', label);
      button.classList.toggle('is-authenticated', authenticated);
    });
  }

  function updateAccountCopy() {
    if (loginIntro) {
      loginIntro.textContent = setupRequired
        ? '首次登录将绑定唯一管理员邮箱。请输入你的邮箱，并使用当前默认密码完成验证。'
        : '使用管理员邮箱和密码登录。普通访客无需登录，浏览不受影响。';
    }
    if (accountEmail) accountEmail.textContent = adminEmail || '管理员';
  }

  function labeledInput(form, id, labelText, type, autocomplete, placeholder) {
    var field = element('div', 'admin-auth-field');
    var label = element('label', '', labelText);
    label.htmlFor = id;
    var input = element('input');
    input.id = id;
    input.name = id;
    input.type = type;
    input.autocomplete = autocomplete;
    input.required = true;
    input.placeholder = placeholder;
    field.append(label, input);
    form.appendChild(field);
    return input;
  }

  function createInterface() {
    layer = element('div', 'admin-auth-layer');
    layer.hidden = true;

    var backdrop = element('button', 'admin-auth-backdrop');
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', '关闭登录窗口');

    dialogPanel = element('section', 'admin-auth-panel');
    dialogPanel.setAttribute('role', 'dialog');
    dialogPanel.setAttribute('aria-modal', 'true');
    dialogPanel.setAttribute('aria-labelledby', 'adminAuthTitle');

    var panelTop = element('div', 'admin-auth-top');
    var brand = element('span', 'admin-auth-brand', 'MERIDIAN SPACE');
    var close = element('button', 'admin-auth-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', '关闭');
    panelTop.append(brand, close);

    loginView = element('div', 'admin-auth-view');
    var eyebrow = element('p', 'admin-auth-eyebrow', 'ADMIN ACCESS');
    var title = element('h2', '', '登录');
    title.id = 'adminAuthTitle';
    loginIntro = element('p', 'admin-auth-copy');
    loginForm = element('form', 'admin-auth-form');
    emailInput = labeledInput(loginForm, 'adminAuthEmail', '管理员邮箱', 'email', 'username', 'name@example.com');
    passwordInput = labeledInput(loginForm, 'adminAuthPassword', '密码', 'password', 'current-password', '请输入密码');
    submitButton = element('button', '', '登录');
    submitButton.type = 'submit';
    loginMessage = element('p', 'admin-auth-message');
    loginMessage.setAttribute('role', 'status');
    loginMessage.setAttribute('aria-live', 'polite');
    loginForm.append(submitButton, loginMessage);
    loginView.append(eyebrow, title, loginIntro, loginForm);

    accountView = element('div', 'admin-auth-view');
    accountView.hidden = true;
    var accountEyebrow = element('p', 'admin-auth-eyebrow', 'ADMIN ACCOUNT');
    var accountTitle = element('h2', '', '个人中心');
    accountTitle.id = 'adminAccountTitle';
    accountEmail = element('p', 'admin-auth-identity');
    var accountIntro = element('p', 'admin-auth-copy', '管理员身份已验证。你可以编辑 Side B 的个人资料、查看运营数据，或直接在这里修改登录密码。');
    var dashboardLink = element('a', 'admin-auth-primary', '编辑 Side B 资料  ↗');
    dashboardLink.href = '/admin/';
    var metricsLink = element('a', 'admin-auth-secondary', '查看运营数据  ↗');
    metricsLink.href = '/ops/';

    passwordDetails = element('details', 'admin-auth-password');
    var passwordSummary = element('summary', '', '修改密码');
    passwordForm = element('form', 'admin-auth-form admin-auth-password-form');
    passwordForm.noValidate = true;
    var currentPassword = labeledInput(passwordForm, 'adminCurrentPassword', '当前密码', 'password', 'current-password', '输入当前密码');
    var newPassword = labeledInput(passwordForm, 'adminNewPassword', '新密码', 'password', 'new-password', '输入新密码');
    var confirmPassword = labeledInput(passwordForm, 'adminConfirmPassword', '确认新密码', 'password', 'new-password', '再次输入新密码');
    var changeButton = element('button', '', '保存新密码');
    changeButton.type = 'submit';
    passwordMessage = element('p', 'admin-auth-message');
    passwordMessage.setAttribute('role', 'status');
    passwordMessage.setAttribute('aria-live', 'polite');
    passwordMessage.setAttribute('aria-atomic', 'true');
    passwordForm.append(passwordMessage, changeButton);
    passwordDetails.append(passwordSummary, passwordForm);

    var logoutButton = element('button', 'admin-auth-secondary', '退出登录');
    logoutButton.type = 'button';
    accountMessage = element('p', 'admin-auth-message');
    accountMessage.setAttribute('role', 'status');
    accountMessage.setAttribute('aria-live', 'polite');
    accountView.append(accountEyebrow, accountTitle, accountEmail, accountIntro, dashboardLink, metricsLink, passwordDetails, logoutButton, accountMessage);

    dialogPanel.append(panelTop, loginView, accountView);
    layer.append(backdrop, dialogPanel);
    document.body.appendChild(layer);

    backdrop.addEventListener('click', closeInterface);
    close.addEventListener('click', closeInterface);
    logoutButton.addEventListener('click', logout);
    loginForm.addEventListener('submit', submitLogin);
    passwordForm.addEventListener('submit', function (event) {
      submitPasswordChange(event, currentPassword, newPassword, confirmPassword, changeButton);
    });
    updateAccountCopy();
  }

  function openInterface(trigger) {
    activeTrigger = trigger || activeTrigger;
    loginView.hidden = authenticated;
    accountView.hidden = !authenticated;
    loginMessage.textContent = '';
    accountMessage.textContent = '';
    passwordMessage.textContent = '';
    updateAccountCopy();
    dialogPanel.setAttribute('aria-labelledby', authenticated ? 'adminAccountTitle' : 'adminAuthTitle');
    layer.hidden = false;
    triggers.forEach(function (button) { button.setAttribute('aria-expanded', 'true'); });
    window.requestAnimationFrame(function () {
      layer.classList.add('is-open');
      if (authenticated) accountView.querySelector('a').focus();
      else emailInput.focus();
    });
  }

  function closeInterface() {
    if (layer.hidden) return;
    layer.classList.remove('is-open');
    triggers.forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
    window.setTimeout(function () { layer.hidden = true; }, 180);
    if (activeTrigger) activeTrigger.focus();
  }

  function submitLogin(event) {
    event.preventDefault();
    loginMessage.textContent = '正在验证…';
    submitButton.disabled = true;

    requestJson('/api/ops/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
    }).then(function (data) {
      authenticated = true;
      setupRequired = false;
      adminEmail = data.email || emailInput.value;
      passwordInput.value = '';
      setTriggerState();
      updateAccountCopy();
      if (data.setup_completed) {
        loginView.hidden = true;
        accountView.hidden = false;
        dialogPanel.setAttribute('aria-labelledby', 'adminAccountTitle');
        passwordDetails.open = true;
        showToast('管理员账号已创建，请设置一个新的登录密码');
        window.setTimeout(function () { document.getElementById('adminCurrentPassword').focus(); }, 80);
      } else {
        closeInterface();
        showToast('登录成功');
      }
    }).catch(function (error) {
      if (error.message === 'invalid_credentials') loginMessage.textContent = '邮箱或密码不正确，请重新输入。';
      else if (error.message === 'too_many_attempts') loginMessage.textContent = '尝试次数过多，请稍后再试。';
      else if (error.message === 'invalid_input') loginMessage.textContent = '请输入有效的邮箱和密码。';
      else if (error.message === 'setup_already_completed') loginMessage.textContent = '管理员账号刚刚完成初始化，请重新登录。';
      else if (error.message === 'dashboard_not_configured' || error.message === 'not_configured') loginMessage.textContent = '管理员登录尚未完成配置。';
      else loginMessage.textContent = '暂时无法登录，请稍后重试。';
      passwordInput.select();
    }).finally(function () {
      submitButton.disabled = false;
    });
  }

  function submitPasswordChange(event, currentPassword, newPassword, confirmPassword, button) {
    event.preventDefault();
    var currentValue = currentPassword.value;
    var newValue = newPassword.value;

    if (!currentValue) {
      showPasswordError('请输入当前密码。', currentPassword);
      return;
    }
    if (!newValue) {
      showPasswordError('请输入新密码。', newPassword);
      return;
    }
    if (currentValue === newValue) {
      showPasswordError('新密码不能与当前密码相同。', newPassword);
      return;
    }
    if (newValue !== confirmPassword.value) {
      showPasswordError('两次输入的新密码不一致。', confirmPassword);
      return;
    }
    passwordMessage.textContent = '正在保存…';
    button.disabled = true;
    button.textContent = '正在保存…';
    requestJson('/api/ops/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password: currentValue, new_password: newValue })
    }).then(function (data) {
      adminEmail = data.email || adminEmail;
      passwordForm.reset();
      passwordDetails.open = false;
      showToast('密码已更新，其他设备上的登录已失效');
    }).catch(function (error) {
      if (error.message === 'invalid_current_password') showPasswordError('当前密码不正确。', currentPassword, true);
      else if (error.message === 'password_required') showPasswordError('请输入新密码。', newPassword);
      else if (error.message === 'password_reused') showPasswordError('新密码不能与当前密码相同。', newPassword);
      else if (error.message === 'too_many_attempts') showPasswordError('尝试次数过多，请稍后再试。');
      else if (error.message === 'invalid_session' || error.message === 'session_changed') {
        authenticated = false;
        setTriggerState();
        closeInterface();
        showToast('登录已失效，请重新登录');
      } else showPasswordError('暂时无法修改密码，请稍后重试。');
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

  function logout() {
    accountMessage.textContent = '正在退出…';
    requestJson('/api/ops/logout', { method: 'POST' }).then(function () {
      authenticated = false;
      adminEmail = '';
      setTriggerState();
      closeInterface();
      showToast('已退出登录');
    }).catch(function () {
      accountMessage.textContent = '暂时无法退出，请稍后重试。';
    });
  }

  function showToast(text) {
    var oldToast = document.querySelector('.admin-auth-toast');
    if (oldToast) oldToast.remove();
    var toast = element('div', 'admin-auth-toast', text);
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    window.requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    window.setTimeout(function () {
      toast.classList.remove('is-visible');
      window.setTimeout(function () { toast.remove(); }, 220);
    }, 3000);
  }

  function checkSession() {
    requestJson('/api/ops/session').then(function (data) {
      authenticated = Boolean(data.authenticated);
      setupRequired = Boolean(data.setup_required);
      adminEmail = data.email || '';
      setTriggerState();
      updateAccountCopy();
    }).catch(function () {
      authenticated = false;
      setTriggerState();
    });
  }

  triggers.forEach(function (button) {
    button.addEventListener('click', function () { openInterface(button); });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !layer.hidden) closeInterface();
  });

  setTriggerState();
  createInterface();
  checkSession();
})();
