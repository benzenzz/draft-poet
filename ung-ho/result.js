(() => {
  const API_BASE = 'https://poet-donations.poet-ung-ho.workers.dev';
  if (document.body?.dataset?.result !== 'return') return;

  const statusEl = document.getElementById('result-status');
  if (!statusEl) return;

  const orderCode = new URLSearchParams(location.search).get('orderCode');
  if (!orderCode || !/^\d{1,10}$/.test(orderCode)) return;

  fetch(`${API_BASE}/api/donations/${encodeURIComponent(orderCode)}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data || !data.status) {
        statusEl.textContent =
          'Chưa đọc được trạng thái. Quà của bạn vẫn được ghi nhận khi thanh toán thành công.';
        return;
      }
      if (
        data.status === 'success' ||
        data.status === 'paid' ||
        data.status === 'published'
      ) {
        statusEl.textContent = 'Đã nhận thanh toán. Lời nhắn đã hiện trên tường ủng hộ.';
      } else if (data.status === 'hidden') {
        statusEl.textContent =
          'Đã nhận thanh toán. Cảm ơn bạn — món quà đã được ghi nhận.';
      } else if (data.status === 'pending') {
        statusEl.textContent = 'Đang chờ xác nhận thanh toán.';
      } else {
        statusEl.textContent = 'Trạng thái hiện tại: ' + data.status;
      }
    })
    .catch(() => {
      statusEl.textContent =
        'Chưa đọc được trạng thái. Quà của bạn vẫn được ghi nhận khi thanh toán thành công.';
    });
})();
