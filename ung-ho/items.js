// POET — cấu hình trang ủng hộ (MỘT chỗ duy nhất để sửa giá / chiến dịch).
// GIÁ VÍ DỤ — cần POET xác nhận trước khi dùng thật.
// Giá phải khớp worker/src/gifts.js (máy chủ kiểm tra giá × số lượng).
window.POET_DONATE_CONFIG = {
  // Món quà hiển thị trong form (mỗi lần tặng chọn MỘT loại). price tính bằng VND. Thêm/bớt món tại đây.
  items: [
{id:'but',name:'Bộ bút',unit:'bộ',price:10000,emoji:'✏️',color:'#6aa5c4',svg:'<svg viewBox="0 0 64 64"><rect x="27" y="6" width="10" height="40" rx="3" fill="#6aa5c4" stroke="#2f2219" stroke-width="3"/><path d="M27 46h10l-5 12z" fill="#f6c43f" stroke="#2f2219" stroke-width="3" stroke-linejoin="round"/><rect x="27" y="6" width="10" height="8" fill="#ff8a76" stroke="#2f2219" stroke-width="3"/></svg>'},
{id:'tap',name:'Tập',unit:'quyển',price:20000,emoji:'📒',color:'#8cc63f',svg:'<svg viewBox="0 0 64 64"><rect x="12" y="8" width="40" height="48" rx="4" fill="#8cc63f" stroke="#2f2219" stroke-width="3"/><path d="M20 8v48" stroke="#2f2219" stroke-width="3"/><path d="M27 22h18M27 30h18M27 38h12" stroke="#fffaf1" stroke-width="3" stroke-linecap="round"/></svg>'},
{id:'sach',name:'Sách',unit:'cuốn',price:50000,emoji:'📖',color:'#ff8a76',svg:'<svg viewBox="0 0 64 64"><path d="M6 14q13-6 26 2v38q-13-8-26-2z" fill="#ff8a76" stroke="#2f2219" stroke-width="3" stroke-linejoin="round"/><path d="M58 14q-13-6-26 2v38q13-8 26-2z" fill="#f3a9c4" stroke="#2f2219" stroke-width="3" stroke-linejoin="round"/></svg>'},
{id:'mau',name:'Bộ màu',unit:'hộp',price:100000,emoji:'🖍️',color:'#f6c43f',svg:'<svg viewBox="0 0 64 64"><rect x="8" y="20" width="48" height="30" rx="5" fill="#f6c43f" stroke="#2f2219" stroke-width="3"/><g stroke="#2f2219" stroke-width="2.5"><rect x="14" y="10" width="7" height="16" fill="#ff8a76"/><rect x="24" y="8" width="7" height="18" fill="#6aa5c4"/><rect x="34" y="10" width="7" height="16" fill="#3a9e74"/><rect x="44" y="9" width="7" height="17" fill="#8a6bd1"/></g></svg>'},
{id:'ao',name:'Áo ấm',unit:'chiếc',price:200000,emoji:'🧥',color:'#3a9e74',svg:'<svg viewBox="0 0 64 64"><path d="M22 8l-14 10 6 10 6-4v32h24V24l6 4 6-10-14-10q-5 6-10 6t-10-6z" fill="#3a9e74" stroke="#2f2219" stroke-width="3" stroke-linejoin="round"/></svg>'},
{id:'balo',name:'Balo',unit:'chiếc',price:500000,emoji:'🎒',color:'#8a6bd1',svg:'<svg viewBox="0 0 64 64"><path d="M24 14a8 8 0 0 1 16 0" fill="none" stroke="#2f2219" stroke-width="3"/><rect x="12" y="14" width="40" height="44" rx="12" fill="#8a6bd1" stroke="#2f2219" stroke-width="3"/><rect x="20" y="36" width="24" height="14" rx="4" fill="#f6c43f" stroke="#2f2219" stroke-width="3"/></svg>'}
],
  // Mặc định khi mở trang (id: số lượng). Để {} nếu muốn bắt đầu từ 0.
  defaultQty: {},
  // Thiệp cảm ơn
  card: {
    slogan: 'Tuổi trẻ · Nhiệt huyết · Nghệ thuật',
    siteLabel: 'maiphh.github.io/poet',
    shareUrl: 'https://maiphh.github.io/poet/ung-ho/',
  },
};
