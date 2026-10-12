(() => {
  const API_BASE = 'https://poet-donations.poet-ung-ho.workers.dev';
  const CONFIG = window.POET_DONATE_CONFIG || { items: [], defaultQty: {}, campaign: null };
  const ITEMS = CONFIG.items || [];
  const qty = {};
  ITEMS.forEach((i) => { qty[i.id] = (CONFIG.defaultQty && CONFIG.defaultQty[i.id]) || 0; });

  const form = document.getElementById('donate-form');
  const giftGrid = document.getElementById('gift-grid');
  const giftTotal = document.getElementById('gift-total');
  const giftSummary = document.getElementById('gift-summary');
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

  function money(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
  }

  function showError(text) {
    errorEl.hidden = !text;
    errorEl.textContent = text || '';
  }

  // ---- Item grid (concept A). Only the total amount goes to the API. ----
  function itemsTotal() {
    return ITEMS.reduce((sum, i) => sum + i.price * qty[i.id], 0);
  }

  function chosenItems() {
    return ITEMS.filter((i) => qty[i.id] > 0).map((i) => ({ id: i.id, qty: qty[i.id] }));
  }

  function buildGrid() {
    if (!giftGrid) return;
    ITEMS.forEach((i) => {
      const card = document.createElement('div');
      card.className = 'gift-item';
      card.dataset.id = i.id;
      const icon = document.createElement('span');
      icon.className = 'gift-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = i.svg; // static SVG from items.js, never user input
      const name = document.createElement('b');
      name.textContent = i.name;
      const price = document.createElement('span');
      price.className = 'gift-price';
      price.textContent = `${money(i.price)} / ${i.unit}`;
      const step = document.createElement('div');
      step.className = 'gift-step';
      const minus = document.createElement('button');
      minus.type = 'button';
      minus.dataset.d = '-1';
      minus.setAttribute('aria-label', `Bớt 1 ${i.name}`);
      minus.textContent = '−';
      const out = document.createElement('output');
      out.setAttribute('aria-label', `Số ${i.name}`);
      const plus = document.createElement('button');
      plus.type = 'button';
      plus.dataset.d = '1';
      plus.setAttribute('aria-label', `Thêm 1 ${i.name}`);
      plus.textContent = '+';
      step.append(minus, out, plus);
      card.append(icon, name, price, step);
      giftGrid.appendChild(card);
    });
    giftGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-d]');
      if (!btn) return;
      const id = btn.closest('.gift-item').dataset.id;
      qty[id] = Math.max(0, Math.min(99, qty[id] + Number(btn.dataset.d)));
      customAmount.value = '';
      showError('');
      updateTotal();
    });
  }

  function updateTotal() {
    if (giftGrid) {
      giftGrid.querySelectorAll('.gift-item').forEach((card) => {
        const n = qty[card.dataset.id];
        card.classList.toggle('is-on', n > 0);
        card.querySelector('output').textContent = String(n);
      });
    }
    const custom = customAmount.value.trim();
    let total;
    if (custom !== '' && Number(custom) > 0) {
      total = Number(custom);
      giftSummary.textContent = 'Số tiền tuỳ ý (thay cho các món đã chọn)';
      if (giftGrid) giftGrid.classList.add('is-overridden');
    } else {
      total = itemsTotal();
      if (giftGrid) giftGrid.classList.remove('is-overridden');
      const parts = ITEMS.filter((i) => qty[i.id]).map((i) => `${qty[i.id]} ${i.name.toLowerCase()}`);
      giftSummary.textContent = parts.join(' · ') || 'Chưa chọn món nào';
    }
    const valid = Number.isInteger(total) && total >= 10000 && total <= 20000000;
    if (total === 0) {
      giftTotal.textContent = 'Chọn món quà hoặc nhập số tiền';
      giftTotal.classList.add('is-hint');
      giftSummary.textContent = '';
    } else {
      giftTotal.textContent = money(total);
      giftTotal.classList.remove('is-hint');
    }
    const limitEl = document.getElementById('gift-limit');
    if (limitEl) {
      limitEl.textContent = total > 0 && total < 10000 ? 'Tối thiểu 10.000 đ'
        : total > 20000000 ? 'Tối đa 20.000.000 đ' : '';
    }
    setSubmitEnabled(valid);
    if (!reduceMotion) {
      giftTotal.classList.remove('is-bump');
      void giftTotal.offsetWidth;
      giftTotal.classList.add('is-bump');
    }
  }

  customAmount.addEventListener('input', updateTotal);
  const customToggle = document.getElementById('gift-custom-toggle');
  const customPanel = document.getElementById('gift-custom-panel');
  customToggle.addEventListener('click', () => {
    const open = customToggle.getAttribute('aria-expanded') !== 'true';
    customToggle.setAttribute('aria-expanded', String(open));
    customPanel.hidden = !open;
    customToggle.querySelector('.gift-custom-chev').textContent = open ? '▴' : '▾';
    if (open) customAmount.focus();
  });

  let amountValid = false;
  function setSubmitEnabled(valid) {
    amountValid = valid;
    if (!donationsEnabled || submitBtn.dataset.busy === '1') return;
    submitBtn.disabled = !valid;
    submitBtn.setAttribute('aria-disabled', valid ? 'false' : 'true');
  }

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
    return itemsTotal();
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
      // Keep donor details in THIS browser only, so the success page and
      // thank-you card can show them without the public status API ever
      // returning names/messages (orderCodes are enumerable).
      if (data.orderCode) {
        const usedCustom = customAmount.value.trim() !== '';
        const record = JSON.stringify({
          amount,
          displayName: isAnonymous ? '' : name,
          anonymous: isAnonymous,
          message: note,
          items: usedCustom ? [] : chosenItems(),
          createdAt: new Date().toISOString(),
        });
        const key = 'poet-donation-' + data.orderCode;
        try { sessionStorage.setItem(key, record); } catch { /* private mode */ }
        try { localStorage.setItem(key, record); } catch { /* private mode */ }
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

  const NOTE_COLORS = ['#fff3c4', '#ffe0d8', '#dff1f9', '#e6f4d4', '#f9e1ec', '#ece3fb'];
  const relFmt = 'Intl' in window && Intl.RelativeTimeFormat
    ? new Intl.RelativeTimeFormat('vi', { numeric: 'auto' })
    : null;

  function timeAgo(date) {
    const sec = (Date.now() - date.getTime()) / 1000;
    if (sec < 60) return 'vừa xong';
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [unit, size] of units) {
      if (sec >= size) {
        const n = Math.floor(sec / size);
        return relFmt ? relFmt.format(-n, unit) : date.toLocaleString('vi-VN');
      }
    }
    return 'vừa xong';
  }

  function iconFor(amount) {
    const by = (id) => ITEMS.find((i) => i.id === id);
    const pick = amount >= 1000000 ? by('balo')
      : amount >= 300000 ? by('ao')
      : amount >= 100000 ? by('sach')
      : amount >= 50000 ? by('tap')
      : by('but');
    return pick || ITEMS[0];
  }

  function buildNote(item, index) {
    const note = document.createElement('article');
    note.className = 'wall-note';
    note.style.setProperty('--rot', `${(index * 37) % 7 - 3}deg`);
    note.style.setProperty('--note-bg', NOTE_COLORS[index % NOTE_COLORS.length]);
    if (!reduceMotion) note.style.animationDelay = `${(index % 10) * 50}ms`;

    const paid = item.paidAt ? new Date(item.paidAt) : null;
    const valid = paid && !Number.isNaN(paid.getTime());
    if (valid && Date.now() - paid.getTime() < 3600 * 1000) {
      const badge = document.createElement('span');
      badge.className = 'wall-note-new';
      badge.textContent = 'MỚI';
      note.appendChild(badge);
    }

    const msg = document.createElement('p');
    msg.className = 'wall-note-msg';
    if (item.message) {
      msg.textContent = item.message;
    } else {
      msg.classList.add('is-empty');
      msg.textContent = '💛 (không để lại lời nhắn)';
    }
    note.appendChild(msg);

    const meta = document.createElement('div');
    meta.className = 'wall-note-meta';
    const icon = iconFor(Number(item.amount) || 0);
    if (icon) {
      const ic = document.createElement('span');
      ic.className = 'wall-note-icon';
      ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = icon.svg; // static SVG from items.js
      meta.appendChild(ic);
    }
    const who = document.createElement('div');
    who.className = 'wall-note-who';
    const nameEl = document.createElement('b');
    nameEl.textContent = item.displayName || 'Ẩn danh';
    who.appendChild(nameEl);
    if (item.paidAt) {
      const timeEl = document.createElement('time');
      timeEl.dateTime = item.paidAt;
      if (valid) {
        timeEl.textContent = timeAgo(paid);
        timeEl.title = paid.toLocaleString('vi-VN');
      } else {
        timeEl.textContent = item.paidAt;
      }
      who.appendChild(timeEl);
    }
    meta.appendChild(who);
    const amt = document.createElement('span');
    amt.className = 'wall-note-amount';
    amt.textContent = money(item.amount);
    meta.appendChild(amt);
    note.appendChild(meta);
    return note;
  }

  // Progress card. Remove `campaign` from items.js (set null) to hide it.
  function renderCampaign(totalAmount, totalCount) {
    const hearts = document.getElementById('wall-hearts');
    if (hearts) hearts.textContent = totalCount ? `${totalCount} tấm lòng` : 'Những tấm lòng';
    const box = document.getElementById('wall-progress');
    const c = CONFIG.campaign;
    if (!box || !c || !c.goal) return;
    const raised = Number(totalAmount) || 0;
    const pct = Math.min(100, Math.round((raised / c.goal) * 100));
    document.getElementById('campaign-name').textContent = c.name || 'Mục tiêu gây quỹ';
    document.getElementById('campaign-raised').textContent = money(raised);
    document.getElementById('campaign-goal').textContent = money(c.goal);
    const meter = document.getElementById('campaign-meter');
    meter.setAttribute('aria-valuenow', String(pct));
    meter.setAttribute('aria-valuetext', `${pct}%`);
    meter.firstElementChild.style.width = `${pct}%`;
    const stats = document.getElementById('campaign-stats');
    stats.textContent = '';
    ['tap', 'but', 'sach', 'balo'].forEach((id) => {
      const it = ITEMS.find((i) => i.id === id);
      if (!it || !raised) return;
      const chip = document.createElement('span');
      const ic = document.createElement('span');
      ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = it.svg;
      chip.appendChild(ic);
      chip.append(`≈ ${Math.floor(raised / it.price)} ${it.name.toLowerCase()}`);
      stats.appendChild(chip);
    });
    box.hidden = false;
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
        wall.appendChild(buildNote(item, start + index));
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
      renderCampaign(data.totalAmount, data.totalCount);
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

  buildGrid();
  updateTotal();
  loadSettings();
  loadWall();
})();
