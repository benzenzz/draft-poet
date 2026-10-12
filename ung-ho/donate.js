(() => {
  const API_BASE = 'https://poet-donations.poet-ung-ho.workers.dev';
  const PRESETS = [50000, 100000, 200000, 500000, 1000000];

  const form = document.getElementById('donate-form');
  const presets = document.querySelectorAll('.donate-preset');
  const customAmount = document.getElementById('custom-amount');
  const displayName = document.getElementById('display-name');
  const message = document.getElementById('message');
  const anonymous = document.getElementById('anonymous');
  const submitBtn = document.getElementById('donate-submit');
  const errorEl = document.getElementById('donate-error');
  const wall = document.getElementById('donate-wall');
  const emptyEl = document.getElementById('donate-empty');
  const disabledBanner = document.getElementById('donate-disabled');
  let donationsEnabled = true;

  let selectedAmount = 200000;

  function money(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
  }

  function showError(text) {
    errorEl.hidden = !text;
    errorEl.textContent = text || '';
  }

  function setPreset(amount) {
    selectedAmount = amount;
    presets.forEach((btn) => {
      const match = Number(btn.dataset.amount) === amount;
      btn.classList.toggle('is-selected', match);
      btn.setAttribute('aria-pressed', match ? 'true' : 'false');
    });
    if (PRESETS.includes(amount)) {
      customAmount.value = '';
    }
  }

  presets.forEach((btn) => {
    btn.addEventListener('click', () => {
      setPreset(Number(btn.dataset.amount));
      showError('');
    });
  });

  customAmount.addEventListener('input', () => {
    const value = Number(customAmount.value);
    if (Number.isFinite(value) && value > 0) {
      selectedAmount = value;
      presets.forEach((btn) => {
        btn.classList.remove('is-selected');
        btn.setAttribute('aria-pressed', 'false');
      });
    }
  });

  anonymous.addEventListener('change', () => {
    displayName.disabled = anonymous.checked;
    displayName.required = !anonymous.checked;
    if (anonymous.checked) displayName.value = '';
  });

  function resolveAmount() {
    const custom = customAmount.value.trim();
    if (custom !== '') {
      const n = Number(custom);
      if (!Number.isInteger(n)) return null;
      return n;
    }
    return selectedAmount;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showError('');

    if (!donationsEnabled) {
      showError('Trang ủng hộ đang tạm tắt. Quay lại sau giúp nhé.');
      return;
    }

    const amount = resolveAmount();
    if (!Number.isInteger(amount) || amount < 10000 || amount > 20000000) {
      showError('Số tiền phải từ 10.000 đến 20.000.000 đồng.');
      return;
    }

    const isAnonymous = anonymous.checked;
    const name = displayName.value.trim();
    const note = message.value.trim();

    if (!isAnonymous && (name.length < 1 || name.length > 40)) {
      showError('Tên hiển thị phải từ 1 đến 40 ký tự.');
      return;
    }
    if (note.length < 1 || note.length > 160) {
      showError('Lời nhắn phải từ 1 đến 160 ký tự.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang mở thanh toán…';

    try {
      const res = await fetch(`${API_BASE}/api/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          displayName: isAnonymous ? '' : name,
          message: note,
          anonymous: isAnonymous,
          returnUrl: new URL('return.html', new URL('.', location.href)).href,
          cancelUrl: new URL('cancel.html', new URL('.', location.href)).href,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        showError(data.error || 'Không tạo được liên kết thanh toán.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Tiếp tục thanh toán <span aria-hidden="true">↗</span>';
        return;
      }
      location.href = data.checkoutUrl;
    } catch {
      showError('Không kết nối được máy chủ. Thử lại giúp nhé.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Tiếp tục thanh toán <span aria-hidden="true">↗</span>';
    }
  });

  function renderWall(donations) {
    wall.textContent = '';
    if (!donations.length) {
      const p = document.createElement('p');
      p.className = 'donate-empty';
      p.id = 'donate-empty';
      p.textContent = 'Chưa có lời nhắn nào được đăng.';
      wall.appendChild(p);
      return;
    }

    donations.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'donate-wall-card';

      const head = document.createElement('div');
      head.className = 'donate-wall-head';

      const nameEl = document.createElement('strong');
      nameEl.textContent = item.displayName;

      const amountEl = document.createElement('span');
      amountEl.className = 'donate-wall-amount';
      amountEl.textContent = money(item.amount);

      head.appendChild(nameEl);
      head.appendChild(amountEl);

      const msgEl = document.createElement('p');
      msgEl.className = 'donate-wall-message';
      msgEl.textContent = item.message;

      const timeEl = document.createElement('time');
      timeEl.className = 'donate-wall-time';
      if (item.paidAt) {
        const d = new Date(item.paidAt);
        timeEl.dateTime = item.paidAt;
        timeEl.textContent = Number.isNaN(d.getTime())
          ? item.paidAt
          : d.toLocaleString('vi-VN');
      }

      card.appendChild(head);
      card.appendChild(msgEl);
      card.appendChild(timeEl);
      wall.appendChild(card);
    });
  }

  async function loadWall() {
    try {
      const res = await fetch(`${API_BASE}/api/donations`);
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      renderWall(data.donations || []);
    } catch {
      if (emptyEl) {
        emptyEl.textContent = 'Chưa tải được tường lời nhắn. Thử lại sau nhé.';
      }
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (!res.ok) return;
      const data = await res.json();
      donationsEnabled = data.donationsEnabled !== false;
    } catch {
      return;
    }
    if (!donationsEnabled) {
      if (disabledBanner) disabledBanner.hidden = false;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang tạm tắt nhận ủng hộ';
    }
  }

  setPreset(200000);
  loadSettings();
  loadWall();
})();
