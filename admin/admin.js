(() => {
  const API_BASE = 'https://poet-donations.poet-ung-ho.workers.dev';
  const TOKEN_KEY = 'poetAdminToken';
  const USER_KEY = 'poetAdminUser';
  const SUCCESS_STATUSES = new Set(['success', 'paid', 'published']);

  const loginSection = document.getElementById('login-section');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginUser = document.getElementById('login-username');
  const loginPass = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const loginSubmit = document.getElementById('login-submit');
  const currentUserEl = document.getElementById('current-user');
  const logoutBtn = document.getElementById('logout-btn');

  const toggle = document.getElementById('donations-toggle');
  const toggleLabel = document.getElementById('donations-toggle-label');
  const settingsStatus = document.getElementById('settings-status');

  const statusFilter = document.getElementById('status-filter');
  const searchInput = document.getElementById('search-input');
  const reloadBtn = document.getElementById('reload-btn');
  const exportBtn = document.getElementById('export-btn');
  const historySummary = document.getElementById('history-summary');
  const historyBody = document.getElementById('history-body');
  const totalReceivedEl = document.getElementById('total-received');
  const totalReceivedCountEl = document.getElementById('total-received-count');
  const totalFilteredEl = document.getElementById('total-filtered');

  const passwordForm = document.getElementById('password-form');
  const currentPass = document.getElementById('current-password');
  const newPass = document.getElementById('new-password');
  const confirmPass = document.getElementById('confirm-password');
  const passwordError = document.getElementById('password-error');
  const passwordStatus = document.getElementById('password-status');
  const passwordSubmit = document.getElementById('password-submit');

  const recoverForm = document.getElementById('recover-form');
  const recoverUser = document.getElementById('recover-username');
  const recoverToken = document.getElementById('recover-token');
  const recoverPass = document.getElementById('recover-password');
  const recoverConfirm = document.getElementById('recover-confirm');
  const recoverError = document.getElementById('recover-error');
  const recoverStatus = document.getElementById('recover-status');
  const recoverSubmit = document.getElementById('recover-submit');

  const adminLayout = document.getElementById('admin-layout');
  const navToggle = document.getElementById('admin-nav-toggle');
  const sideNav = document.getElementById('admin-side-nav');
  const navButtons = document.querySelectorAll('.admin-nav-btn');
  const panels = document.querySelectorAll('.admin-panel');
  const NAV_COLLAPSE_KEY = 'poetAdminNavCollapsed';

  let allDonations = [];
  let totalReceived = 0;
  let receivedCount = 0;

  function token() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function authHeaders(extra = {}) {
    return { ...extra, Authorization: `Bearer ${token()}` };
  }

  function money(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
  }

  function fmtTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('vi-VN');
  }

  function normalizeStatus(status) {
    if (status === 'paid' || status === 'published') return 'success';
    return status || '—';
  }

  function isSuccess(status) {
    return SUCCESS_STATUSES.has(status);
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboard.hidden = true;
  }

  function showDashboard(username) {
    loginSection.hidden = true;
    dashboard.hidden = false;
    currentUserEl.textContent = username || '';
    switchTab('donations');
    loadSettings();
    loadHistory();
  }

  function setLoginError(text) {
    loginError.hidden = !text;
    loginError.textContent = text || '';
  }

  function setPasswordError(text) {
    passwordError.hidden = !text;
    passwordError.textContent = text || '';
  }

  function setPasswordStatus(text) {
    passwordStatus.textContent = text || '';
  }

  function setRecoverError(text) {
    recoverError.hidden = !text;
    recoverError.textContent = text || '';
  }

  function setRecoverStatus(text) {
    recoverStatus.textContent = text || '';
  }

  function setSettingsStatus(text) {
    settingsStatus.textContent = text || '';
  }

  function switchTab(tab) {
    if (!tab) return;
    navButtons.forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === tab;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  }

  if (sideNav) {
    sideNav.addEventListener('click', (event) => {
      const btn = event.target.closest('.admin-nav-btn');
      if (!btn || !sideNav.contains(btn)) return;
      event.preventDefault();
      switchTab(btn.dataset.tab);
    });
  }

  const desktopNavQuery = window.matchMedia('(min-width: 901px)');

  function isDesktopNav() {
    return desktopNavQuery.matches;
  }

  function setNavCollapsed(collapsed, { persist = true } = {}) {
    if (!adminLayout || !navToggle) return;
    const next = isDesktopNav() ? Boolean(collapsed) : false;
    adminLayout.classList.toggle('is-nav-collapsed', next);
    navToggle.setAttribute('aria-expanded', next ? 'false' : 'true');
    navToggle.title = next ? 'Mở rộng menu' : 'Thu gọn menu';
    const label = navToggle.querySelector('.admin-nav-toggle-label');
    if (label) label.textContent = next ? 'Mở' : 'Thu gọn';
    if (!persist) return;
    try {
      localStorage.setItem(NAV_COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      // ignore quota / private mode
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (!isDesktopNav()) return;
      setNavCollapsed(!adminLayout.classList.contains('is-nav-collapsed'));
    });
    const applyStoredCollapse = () => {
      let stored = false;
      try {
        stored = localStorage.getItem(NAV_COLLAPSE_KEY) === '1';
      } catch {
        stored = false;
      }
      setNavCollapsed(stored, { persist: false });
    };
    applyStoredCollapse();
    const onNavBreakpoint = () => applyStoredCollapse();
    if (typeof desktopNavQuery.addEventListener === 'function') {
      desktopNavQuery.addEventListener('change', onNavBreakpoint);
    } else if (typeof desktopNavQuery.addListener === 'function') {
      desktopNavQuery.addListener(onNavBreakpoint);
    }
  }

  function logout(localOnly) {
    const t = token();
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    showLogin();
    if (!localOnly && t) {
      fetch(`${API_BASE}/api/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => {});
    }
  }

  async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (res.status === 401) {
      logout(true);
      throw new Error('Phiên đăng nhập hết hạn. Đăng nhập lại nhé.');
    }
    return res;
  }

  // ---- Login ----

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setLoginError('');
    const username = loginUser.value.trim();
    const password = loginPass.value;
    if (!username || !password) {
      setLoginError('Nhập tên đăng nhập và mật khẩu.');
      return;
    }
    loginSubmit.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        setLoginError(data.error || 'Đăng nhập thất bại.');
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      sessionStorage.setItem(USER_KEY, data.username || username);
      loginPass.value = '';
      showDashboard(data.username || username);
    } catch {
      setLoginError('Không kết nối được máy chủ. Thử lại giúp nhé.');
    } finally {
      loginSubmit.disabled = false;
    }
  });

  logoutBtn.addEventListener('click', () => logout(false));

  // ---- Password recovery (dev ADMIN_TOKEN) ----

  recoverForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setRecoverError('');
    setRecoverStatus('');
    const username = recoverUser.value.trim() || 'admin';
    const recoveryToken = recoverToken.value.trim();
    const next = recoverPass.value;
    const confirm = recoverConfirm.value;
    if (!recoveryToken) {
      setRecoverError('Nhập mã khôi phục ADMIN_TOKEN.');
      return;
    }
    if (next.length < 4 || next.length > 72) {
      setRecoverError('Mật khẩu mới phải từ 4 đến 72 ký tự.');
      return;
    }
    if (next !== confirm) {
      setRecoverError('Hai mật khẩu mới chưa khớp.');
      return;
    }
    recoverSubmit.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/api/admin/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryToken, username, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRecoverError(data.error || 'Khôi phục thất bại.');
        return;
      }
      recoverToken.value = '';
      recoverPass.value = '';
      recoverConfirm.value = '';
      setRecoverStatus(`Đã đặt lại mật khẩu cho ${data.username || username}. Đăng nhập lại nhé.`);
      loginUser.value = data.username || username;
    } catch {
      setRecoverError('Không kết nối được máy chủ. Thử lại giúp nhé.');
    } finally {
      recoverSubmit.disabled = false;
    }
  });

  // ---- On/off toggle ----

  async function loadSettings() {
    setSettingsStatus('');
    toggle.disabled = true;
    toggleLabel.textContent = 'Đang tải…';
    try {
      const res = await api('/api/admin/settings', { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'bad status');
      toggle.checked = data.donationsEnabled !== false;
      toggleLabel.textContent = toggle.checked
        ? 'Đang nhận ủng hộ — form Ủng hộ mở.'
        : 'Đang tạm tắt — form Ủng hộ ẩn.';
    } catch (err) {
      toggleLabel.textContent = 'Chưa tải được trạng thái.';
      setSettingsStatus(err.message || 'Không tải được cài đặt.');
    } finally {
      toggle.disabled = false;
    }
  }

  toggle.addEventListener('change', async () => {
    const next = toggle.checked;
    toggle.disabled = true;
    setSettingsStatus('Đang lưu…');
    try {
      const res = await api('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ donationsEnabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Lưu thất bại.');
      toggle.checked = data.donationsEnabled !== false;
      toggleLabel.textContent = toggle.checked
        ? 'Đang nhận ủng hộ — form Ủng hộ mở.'
        : 'Đang tạm tắt — form Ủng hộ ẩn.';
      setSettingsStatus('Đã lưu.');
    } catch (err) {
      toggle.checked = !next;
      setSettingsStatus(err.message || 'Lưu thất bại.');
    } finally {
      toggle.disabled = false;
    }
  });

  // ---- Donate history ----

  function filteredDonations() {
    const status = statusFilter.value;
    const q = searchInput.value.trim().toLowerCase();
    return allDonations.filter((d) => {
      if (status === 'legacy') {
        if (d.status !== 'paid' && d.status !== 'published') return false;
      } else if (status === 'success') {
        if (!isSuccess(d.status)) return false;
      } else if (status && d.status !== status) {
        return false;
      }
      if (!q) return true;
      const hay = [
        d.displayName,
        d.message,
        d.orderCode,
        d.status,
        d.counterAccountName,
        d.counterAccountNumber,
        d.counterAccountBankName,
        d.payosReference,
        d.payosAccountNumber,
        d.payosDescription,
        d.virtualAccountName,
        d.virtualAccountNumber,
        d.paymentLinkId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function updateTotals(rows) {
    totalReceivedEl.textContent = money(totalReceived);
    totalReceivedCountEl.textContent = String(receivedCount);
    const filteredSum = rows.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    totalFilteredEl.textContent = `${rows.length} khoản · ${money(filteredSum)}`;
  }

  function renderHistory() {
    const rows = filteredDonations();
    historyBody.textContent = '';
    updateTotals(rows);
    historySummary.textContent = `${rows.length}/${allDonations.length} khoản khớp bộ lọc.`;

    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 15;
      td.className = 'admin-table-empty';
      td.textContent = 'Chưa có khoản nào khớp.';
      tr.appendChild(td);
      historyBody.appendChild(tr);
      return;
    }

    rows.forEach((d) => {
      const tr = document.createElement('tr');
      if (d.status === 'hidden') tr.classList.add('is-hidden-row');

      const cells = [
        d.orderCode != null ? `#${d.orderCode}` : '—',
        normalizeStatus(d.status) + (d.status !== normalizeStatus(d.status) ? ` (${d.status})` : ''),
        money(d.amount),
        d.displayName || '—',
        d.message || '—',
        d.anonymous ? 'có' : 'không',
        fmtTime(d.createdAt),
        fmtTime(d.paidAt),
        d.payosReference || '—',
        d.payosAccountNumber || '—',
        d.counterAccountBankName || d.counterAccountBankId || '—',
        d.counterAccountName || '—',
        d.counterAccountNumber || '—',
        d.payosDescription || '—',
      ];

      cells.forEach((value, index) => {
        const td = document.createElement('td');
        td.textContent = value;
        if (index === 2) td.className = 'admin-table-amount';
        if (index === 4) td.className = 'admin-table-message';
        tr.appendChild(td);
      });

      const actionsTd = document.createElement('td');
      actionsTd.className = 'admin-table-actions';
      const actions = document.createElement('div');
      actions.className = 'admin-actions';

      if (isSuccess(d.status)) {
        const hideBtn = document.createElement('button');
        hideBtn.type = 'button';
        hideBtn.className = 'button button-outline';
        hideBtn.textContent = 'Ẩn';
        hideBtn.addEventListener('click', () => actOn(d.orderCode, 'hide', hideBtn));
        actions.appendChild(hideBtn);
      } else if (d.status === 'hidden') {
        const showBtn = document.createElement('button');
        showBtn.type = 'button';
        showBtn.className = 'button button-purple';
        showBtn.textContent = 'Hiện';
        showBtn.addEventListener('click', () => actOn(d.orderCode, 'show', showBtn));
        actions.appendChild(showBtn);
      } else {
        const span = document.createElement('span');
        span.className = 'admin-meta';
        span.textContent = '—';
        actions.appendChild(span);
      }

      actionsTd.appendChild(actions);
      tr.appendChild(actionsTd);
      historyBody.appendChild(tr);
    });
  }

  async function loadHistory() {
    historySummary.textContent = 'Đang tải lịch sử…';
    historyBody.textContent = '';
    try {
      const res = await api('/api/admin/donations', { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không tải được lịch sử.');
      allDonations = data.donations || [];
      totalReceived = Number(data.totalReceived) || 0;
      receivedCount = Number(data.receivedCount) || 0;
      renderHistory();
    } catch (err) {
      historySummary.textContent = err.message || 'Không tải được lịch sử.';
      totalReceivedEl.textContent = '—';
      totalReceivedCountEl.textContent = '—';
      totalFilteredEl.textContent = '—';
    }
  }

  async function actOn(orderCode, action, btn) {
    btn.disabled = true;
    try {
      const res = await api(`/api/admin/donations/${orderCode}/${action}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Thao tác thất bại.');
      await loadHistory();
    } catch (err) {
      historySummary.textContent = err.message || 'Thao tác thất bại.';
      btn.disabled = false;
    }
  }

  function csvEscape(value) {
    const text = value == null ? '' : String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function exportExcel() {
    const rows = filteredDonations();
    if (!rows.length) {
      historySummary.textContent = 'Không có dữ liệu để xuất.';
      return;
    }

    const headers = [
      'orderCode',
      'status',
      'amount',
      'displayName',
      'message',
      'anonymous',
      'createdAt',
      'paidAt',
      'payosReference',
      'payosAccountNumber',
      'counterAccountBankId',
      'counterAccountBankName',
      'counterAccountName',
      'counterAccountNumber',
      'virtualAccountName',
      'virtualAccountNumber',
      'payosDescription',
      'payosTransactionTime',
      'payosCurrency',
      'paymentLinkId',
    ];

    const lines = [headers.join(',')];
    rows.forEach((d) => {
      lines.push(
        headers
          .map((key) => {
            if (key === 'anonymous') return d.anonymous ? '1' : '0';
            return csvEscape(d[key]);
          })
          .join(','),
      );
    });

    // UTF-8 BOM so Excel on Windows opens Vietnamese correctly.
    const blob = new Blob(['\ufeff' + lines.join('\n')], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poet-donations-${stamp}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    historySummary.textContent = `Đã xuất ${rows.length} khoản.`;
  }

  statusFilter.addEventListener('change', renderHistory);
  searchInput.addEventListener('input', renderHistory);
  reloadBtn.addEventListener('click', loadHistory);
  exportBtn.addEventListener('click', exportExcel);

  // ---- Change password ----

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordStatus('');
    const cur = currentPass.value;
    const next = newPass.value;
    const confirm = confirmPass.value;
    if (!cur) {
      setPasswordError('Nhập mật khẩu hiện tại.');
      return;
    }
    if (next.length < 4 || next.length > 72) {
      setPasswordError('Mật khẩu mới phải từ 4 đến 72 ký tự.');
      return;
    }
    if (next !== confirm) {
      setPasswordError('Hai mật khẩu mới chưa khớp.');
      return;
    }
    passwordSubmit.disabled = true;
    try {
      const res = await api('/api/admin/change-password', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ currentPassword: cur, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data.error || 'Đổi mật khẩu thất bại.');
        return;
      }
      currentPass.value = '';
      newPass.value = '';
      confirmPass.value = '';
      setPasswordStatus('Đã đổi mật khẩu.');
    } catch (err) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại.');
    } finally {
      passwordSubmit.disabled = false;
    }
  });

  // ---- Boot ----

  (async () => {
    if (!token()) {
      showLogin();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/me`, { headers: authHeaders() });
      if (res.status === 401) {
        logout(true);
        showLogin();
        return;
      }
      const data = await res.json().catch(() => ({}));
      showDashboard(data.username || sessionStorage.getItem(USER_KEY) || 'admin');
    } catch {
      showDashboard(sessionStorage.getItem(USER_KEY) || 'admin');
    }
  })();
})();
