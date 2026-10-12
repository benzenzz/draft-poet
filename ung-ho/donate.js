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
  const totalEl = document.getElementById('donate-total');
  const totalAmountEl = document.getElementById('donate-total-amount');
  const heroTitle = document.getElementById('donate-title');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let totalTarget = null;
  let totalAnimated = false;
  let heroVisible = false;
  const disabledBanner = document.getElementById('donate-disabled');
  let donationsEnabled = true;
  const searchInput = document.getElementById('donate-search');
  const paginationEl = document.getElementById('donate-pagination');
  const historyCountEl = document.getElementById('donate-history-count');
  const PER_PAGE = 10;
  let allDonations = [];
  let searchQuery = '';
  let currentPage = 1;

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
    if (note.length > 160) {
      showError('Lời tối đa 160 ký tự.');
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

  function renderTotal(totalAmount, totalCount) {
    if (!totalEl) return;
    const amount = Number(totalAmount) || 0;
    const count = Number(totalCount) || 0;
    if (count === 0) {
      totalEl.textContent = 'Chưa ghi nhận khoản ủng hộ nào.';
      if (totalAmountEl) totalAmountEl.textContent = money(0);
      totalAnimated = true;
      return;
    }
    totalEl.textContent = `Được góp từ ${count} món quà.`;
    totalTarget = amount;
    maybeAnimateTotal();
  }

  function maybeAnimateTotal() {
    if (totalAnimated || totalTarget === null || !heroVisible || !totalAmountEl) return;
    totalAnimated = true;
    if (reduceMotion) {
      totalAmountEl.textContent = money(totalTarget);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      totalAmountEl.textContent = money(Math.round(totalTarget * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (heroTitle && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        heroVisible = true;
        maybeAnimateTotal();
        heroObserver.disconnect();
      }
    }, { threshold: 0.2 });
    heroObserver.observe(heroTitle);
  } else {
    heroVisible = true;
  }

  function normalizeName(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  function filteredDonations() {
    const q = normalizeName(searchQuery.trim());
    if (!q) return allDonations;
    return allDonations.filter((item) =>
      normalizeName(item.displayName).includes(q),
    );
  }

  function renderWallPage() {
    const rows = filteredDonations();
    const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    wall.textContent = '';
    if (!rows.length) {
      const p = document.createElement('p');
      p.className = 'donate-empty';
      p.id = 'donate-empty';
      p.textContent = searchQuery.trim()
        ? `Không tìm thấy món quà nào tên “${searchQuery.trim()}”.`
        : 'Chưa có lời nhắn nào. Hãy là người đầu tiên nhé.';
      wall.appendChild(p);
    } else {
      const start = (currentPage - 1) * PER_PAGE;
      const pageRows = rows.slice(start, start + PER_PAGE);
      pageRows.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'donate-wall-card';

        const avatar = document.createElement('span');
        avatar.className = 'donate-wall-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        const initial = (item.displayName || '?').trim().charAt(0) || '?';
        avatar.textContent = initial.toUpperCase();

        const main = document.createElement('div');
        main.className = 'donate-wall-main';

        const head = document.createElement('div');
        head.className = 'donate-wall-head';

        const nameEl = document.createElement('strong');
        nameEl.textContent = item.displayName;

        const amountEl = document.createElement('span');
        amountEl.className = 'donate-wall-amount';
        amountEl.textContent = money(item.amount);

        head.appendChild(nameEl);
        head.appendChild(amountEl);

        const timeEl = document.createElement('time');
        timeEl.className = 'donate-wall-time';
        if (item.paidAt) {
          const d = new Date(item.paidAt);
          timeEl.dateTime = item.paidAt;
          timeEl.textContent = Number.isNaN(d.getTime())
            ? item.paidAt
            : d.toLocaleString('vi-VN');
        }

        main.appendChild(head);
        if (item.message) {
          const msgEl = document.createElement('p');
          msgEl.className = 'donate-wall-message';
          msgEl.textContent = item.message;
          main.appendChild(msgEl);
        }
        main.appendChild(timeEl);

        const rank = document.createElement('span');
        rank.className = 'donate-wall-index';
        rank.textContent = `#${start + index + 1}`;

        card.appendChild(avatar);
        card.appendChild(main);
        card.appendChild(rank);
        wall.appendChild(card);
      });
    }

    renderHistoryCount(rows);
    renderPagination(rows.length, totalPages);
  }

  function renderHistoryCount(rows) {
    if (!historyCountEl) return;
    if (!rows.length) {
      historyCountEl.textContent = allDonations.length
        ? `${allDonations.length} món quà`
        : '';
      return;
    }
    const start = (currentPage - 1) * PER_PAGE + 1;
    const end = Math.min(currentPage * PER_PAGE, rows.length);
    const suffix = searchQuery.trim()
      ? ` · tìm “${searchQuery.trim()}”`
      : '';
    historyCountEl.textContent = `${start}–${end} / ${rows.length} món quà${suffix}`;
  }

  function pageButton(label, page, { disabled = false, current = false, ariaLabel = '' } = {}) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'donate-page-btn' + (current ? ' is-current' : '');
    btn.textContent = label;
    if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
    if (current) btn.setAttribute('aria-current', 'page');
    btn.disabled = disabled;
    btn.dataset.page = String(page);
    return btn;
  }

  function pageWindow(totalPages) {
    const windowSize = 5;
    let from = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let to = Math.min(totalPages, from + windowSize - 1);
    from = Math.max(1, to - windowSize + 1);
    const list = [];
    for (let p = from; p <= to; p++) list.push(p);
    return list;
  }

  function renderPagination(totalRows, totalPages) {
    if (!paginationEl) return;
    paginationEl.textContent = '';
    if (totalRows <= PER_PAGE) return;

    paginationEl.appendChild(
      pageButton('←', currentPage - 1, {
        disabled: currentPage <= 1,
        ariaLabel: 'Trang trước',
      }),
    );
    pageWindow(totalPages).forEach((p) => {
      paginationEl.appendChild(
        pageButton(String(p), p, {
          current: p === currentPage,
          ariaLabel: `Trang ${p}`,
        }),
      );
    });
    paginationEl.appendChild(
      pageButton('→', currentPage + 1, {
        disabled: currentPage >= totalPages,
        ariaLabel: 'Trang sau',
      }),
    );

    const info = document.createElement('span');
    info.className = 'donate-page-info';
    info.textContent = `Trang ${currentPage} / ${totalPages}`;
    paginationEl.appendChild(info);
  }

  if (paginationEl) {
    paginationEl.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      const next = Number(btn.dataset.page);
      if (!Number.isInteger(next) || next < 1) return;
      currentPage = next;
      renderWallPage();
      wall.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      currentPage = 1;
      renderWallPage();
    });
  }

  function renderWall(donations) {
    allDonations = Array.isArray(donations) ? donations : [];
    currentPage = 1;
    renderWallPage();
  }

  async function loadWall() {
    try {
      const res = await fetch(`${API_BASE}/api/donations`);
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      renderTotal(data.totalAmount, data.totalCount);
      renderWall(data.donations || []);
    } catch {
      if (totalEl) totalEl.textContent = 'Chưa tải được tổng ủng hộ.';
      if (totalAmountEl) totalAmountEl.textContent = '—';
      wall.textContent = '';
      const p = document.createElement('p');
      p.className = 'donate-empty';
      p.textContent = 'Chưa tải được tường lời nhắn. Thử lại sau nhé.';
      wall.appendChild(p);
      if (paginationEl) paginationEl.textContent = '';
      if (historyCountEl) historyCountEl.textContent = '';
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
