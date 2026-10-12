(() => {
  const API_BASE = 'https://poet-donations.poet-ung-ho.workers.dev';
  if (document.body?.dataset?.result !== 'return') return;

  const $ = (id) => document.getElementById(id);
  const statusEl = $('result-status');
  const CONFIG = window.POET_DONATE_CONFIG || { items: [] };
  const ITEMS = CONFIG.items || [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

  const orderCode = new URLSearchParams(location.search).get('orderCode');
  const validCode = orderCode && /^\d{1,10}$/.test(orderCode);

  // Details saved by donate.js in this browser before going to payOS.
  // The public status API never returns names or messages.
  function loadLocal() {
    if (!validCode) return null;
    const key = 'poet-donation-' + orderCode;
    let raw = null;
    try { raw = sessionStorage.getItem(key); } catch { /* ignore */ }
    if (!raw) { try { raw = localStorage.getItem(key); } catch { /* ignore */ } }
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  function showWait(text, title) {
    $('thanks-success').hidden = true;
    $('thanks-wait').hidden = false;
    if (title) $('thanks-wait-title').textContent = title;
    statusEl.textContent = text;
    statusEl.className = 'thanks-status is-wait';
  }

  // ---- confetti: ~3s, once per order, never with reduced motion ----
  const cv = $('thanks-confetti');
  function burst() {
    if (reduceMotion || !cv) return;
    const cx = cv.getContext('2d');
    cv.width = innerWidth;
    cv.height = innerHeight;
    const cols = ['#ff8a76', '#f6c43f', '#8cc63f', '#6aa5c4', '#f3a9c4', '#8a6bd1'];
    const ps = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 80, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      r: Math.random() * 6 + 4, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
      c: cols[(Math.random() * 6) | 0], s: (Math.random() * 3) | 0,
    }));
    const t0 = performance.now();
    (function f(t) {
      cx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c;
        if (p.s === 0) cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        else if (p.s === 1) { cx.beginPath(); cx.arc(0, 0, p.r / 1.4, 0, 7); cx.fill(); }
        else { cx.font = p.r * 3 + 'px serif'; cx.fillText('✿', 0, 0); }
        cx.restore();
      });
      if (t - t0 < 3200) requestAnimationFrame(f);
      else cx.clearRect(0, 0, cv.width, cv.height);
    })(t0);
  }

  function celebrateOnce() {
    const key = 'poet-confetti-' + orderCode;
    let seen = false;
    try { seen = !!localStorage.getItem(key); localStorage.setItem(key, '1'); } catch { /* ignore */ }
    if (!seen) setTimeout(burst, 350);
    else document.body.classList.add('thanks-no-anim'); // don't re-pop the gift box on reload
  }

  function renderImpact(local) {
    const box = $('thanks-impact');
    box.textContent = '';
    const items = (local && Array.isArray(local.items)) ? local.items : [];
    items.forEach(({ id, qty }) => {
      const it = ITEMS.find((i) => i.id === id);
      if (!it || !(qty > 0)) return;
      const chip = document.createElement('span');
      chip.className = 'thanks-chip';
      const ic = document.createElement('span');
      ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = it.svg; // static SVG from items.js
      chip.append(ic, `${qty} ${it.unit} ${it.name.toLowerCase()}`);
      box.appendChild(chip);
    });
    box.hidden = !box.childElementCount;
  }

  function showSuccess(data, local) {
    $('thanks-wait').hidden = true;
    $('thanks-success').hidden = false;
    $('thanks-steps').hidden = false;
    statusEl.className = 'thanks-status is-ok';
    statusEl.textContent = '✓ Đã nhận thanh toán';
    if (data.hidden) $('step1-text').textContent = 'Lời nhắn của bạn được giữ riêng, không hiện trên tường.';

    const lead = $('thanks-lead');
    if (local) {
      lead.textContent = '';
      const name = local.anonymous ? '' : String(local.displayName || '').trim();
      if (name) {
        const b = document.createElement('b');
        b.textContent = name;
        lead.append(b, ' ơi, món quà ');
      } else {
        lead.append('Món quà ');
      }
      const amt = document.createElement('b');
      amt.textContent = money(local.amount);
      lead.append(amt, ' của bạn sẽ theo POET lên điểm trường vùng cao trong chuyến đi tới.');
    }
    renderImpact(local);
    celebrateOnce();

    // Card needs the donor details; without them (other device/browser) hide it.
    const cardLink = $('thanks-card-link');
    if (local && window.POETCard) {
      $('thanks-card').hidden = false;
      const canvas = $('card-canvas');
      window.POETCard.draw(canvas, local);
      window.POETCard.bind(canvas, { save: $('card-save'), share: $('card-share'), fb: $('card-fb'), toast: $('card-toast') });
    } else if (cardLink) {
      cardLink.hidden = true;
    }
    const replay = $('thanks-replay');
    if (replay) {
      if (reduceMotion) replay.hidden = true;
      else replay.addEventListener('click', burst);
    }
  }

  if (!validCode) {
    showWait('Không tìm thấy mã đơn.', 'Chưa xác định được món quà');
    return;
  }

  const local = loadLocal();
  let tries = 0;
  function check() {
    tries++;
    fetch(`${API_BASE}/api/donations/${encodeURIComponent(orderCode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.status === 'success') return showSuccess(data, local);
        if (data && data.status === 'pending') {
          showWait('Đang chờ xác nhận thanh toán…');
          if (tries < 3) setTimeout(check, 3000); // at most 3 reads per visit
          return;
        }
        if (data && data.status) {
          showWait('Trạng thái hiện tại: ' + data.status, 'Thanh toán chưa hoàn tất');
          return;
        }
        showWait('Chưa đọc được trạng thái. Quà của bạn vẫn được ghi nhận khi thanh toán thành công.');
      })
      .catch(() => {
        showWait('Chưa đọc được trạng thái. Quà của bạn vẫn được ghi nhận khi thanh toán thành công.');
      });
  }
  check();
})();
