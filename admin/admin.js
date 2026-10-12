(() => {
  const API_BASE = 'https://poet-donations.poet-ung-ho.workers.dev';
  const TOKEN_KEY = 'poetAdminToken';
  const USER_KEY = 'poetAdminUser';

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
  const historySummary = document.getElementById('history-summary');
  const historyList = document.getElementById('history-list');

  const passwordForm = document.getElementById('password-form');
  const currentPass = document.getElementById('current-password');
  const newPass = document.getElementById('new-password');
  const confirmPass = document.getElementById('confirm-password');
  const passwordError = document.getElementById('password-error');
  const passwordStatus = document.getElementById('password-status');
  const passwordSubmit = document.getElementById('password-submit');

  let allDonations = [];

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

  function showLogin() {
    loginSection.hidden = false;
    dashboard.hidden = true;
  }

  function showDashboard(username) {
    loginSection.hidden = true;
    dashboard.hidden = false;
    currentUserEl.textContent = username || '';
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

  function setSettingsStatus(text) {
    settingsStatus.textContent = text || '';
  }

  function logout(localOnly) {
    const t = token();
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    showLogin();
    if (!localOnly && t) {
      fetch(`${API_BASE}/api/admin/logout`, {
        method: 'POST',
        headers: authHeaders(),
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
      if (status && d.status !== status) return false;
      if (!q) return true;
      const hay = `${d.displayName || ''} ${d.message || ''} ${d.orderCode || ''} ${d.counterAccountName || ''} ${d.counterAccountNumber || ''} ${d.payosReference || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function auditRows(d) {
    const pairs = [
      ['Mã đơn', d.orderCode != null ? `#${d.orderCode}` : '—'],
      ['Trạng thái', d.status || '—'],
      ['Ẩn danh', d.anonymous ? 'có' : 'không'],
      ['Tạo lúc', fmtTime(d.createdAt)],
      ['Trả lúc', fmtTime(d.paidAt)],
      ['Mã tham chiếu NH', d.payosReference || '—'],
      ['TK nhận (POET)', d.payosAccountNumber || '—'],
      ['Ngân hàng người gửi', d.counterAccountBankName || '—'],
      ['Mã ngân hàng người gửi', d.counterAccountBankId || '—'],
      ['Tên người gửi (NH)', d.counterAccountName || '—'],
      ['TK người gửi', d.counterAccountNumber || '—'],
      ['TK ảo', d.virtualAccountNumber || '—'],
      ['Tên TK ảo', d.virtualAccountName || '—'],
      ['Nội dung NH', d.payosDescription || '—'],
      ['Thời gian NH', d.payosTransactionTime || fmtTime(d.payosTransactionTime)],
      ['Link PayOS', d.paymentLinkId || '—'],
    ];
    return pairs;
  }

  function renderHistory() {
    const rows = filteredDonations();
    historyList.textContent = '';
    const total = allDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    historySummary.textContent = `${rows.length}/${allDonations.length} khoản · tổng ${money(total)} (mọi trạng thái).`;

    if (!rows.length) {
      const p = document.createElement('p');
      p.className = 'donate-empty';
      p.textContent = 'Chưa có khoản nào khớp.';
      historyList.appendChild(p);
      return;
    }

    rows.forEach((d) => {
      const card = document.createElement('article');
      card.className = 'admin-row';

      const head = document.createElement('div');
      head.className = 'admin-row-head';
      const nameEl = document.createElement('strong');
      nameEl.textContent = d.displayName || '(không tên)';
      const amountEl = document.createElement('span');
      amountEl.className = 'donate-wall-amount';
      amountEl.textContent = money(d.amount);
      head.appendChild(nameEl);
      head.appendChild(amountEl);

      const msgEl = document.createElement('p');
      msgEl.className = 'donate-wall-message';
      msgEl.textContent = d.message || '';

      const meta = document.createElement('p');
      meta.className = 'admin-meta';
      meta.textContent = `#${d.orderCode} · ${d.status}${d.paidAt ? ` · trả ${fmtTime(d.paidAt)}` : ` · tạo ${fmtTime(d.createdAt)}`}`;

      const details = document.createElement('details');
      details.className = 'admin-audit';
      const summary = document.createElement('summary');
      summary.textContent = 'Đối soát ngân hàng';
      details.appendChild(summary);
      const dl = document.createElement('dl');
      auditRows(d).forEach(([k, v]) => {
        const dt = document.createElement('dt');
        dt.textContent = k;
        const dd = document.createElement('dd');
        dd.textContent = v;
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      details.appendChild(dl);

      const actions = document.createElement('div');
      actions.className = 'admin-actions';
      const pubBtn = document.createElement('button');
      pubBtn.type = 'button';
      pubBtn.className = 'button button-purple';
      pubBtn.textContent = 'Đăng';
      pubBtn.disabled = !(d.status === 'paid' || d.status === 'hidden');
      pubBtn.addEventListener('click', () => actOn(d.orderCode, 'publish', pubBtn));
      const hideBtn = document.createElement('button');
      hideBtn.type = 'button';
      hideBtn.className = 'button button-outline';
      hideBtn.textContent = 'Ẩn';
      hideBtn.disabled = !(d.status === 'published' || d.status === 'paid');
      hideBtn.addEventListener('click', () => actOn(d.orderCode, 'hide', hideBtn));
      actions.appendChild(pubBtn);
      actions.appendChild(hideBtn);

      card.appendChild(head);
      card.appendChild(msgEl);
      card.appendChild(meta);
      card.appendChild(details);
      card.appendChild(actions);
      historyList.appendChild(card);
    });
  }

  async function loadHistory() {
    historySummary.textContent = 'Đang tải lịch sử…';
    historyList.textContent = '';
    try {
      const res = await api('/api/admin/donations', { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không tải được lịch sử.');
      allDonations = data.donations || [];
      renderHistory();
    } catch (err) {
      historySummary.textContent = err.message || 'Không tải được lịch sử.';
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

  statusFilter.addEventListener('change', renderHistory);
  searchInput.addEventListener('input', renderHistory);
  reloadBtn.addEventListener('click', loadHistory);

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
      // Offline: keep the dashboard shell but show errors on load.
      showDashboard(sessionStorage.getItem(USER_KEY) || 'admin');
    }
  })();
})();
