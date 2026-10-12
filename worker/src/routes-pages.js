/** Non-API pages: PayOS return/cancel redirects + moved-admin notice. */
import { ADMIN_MOVED_URL, PROD_CANCEL_URL, PROD_RETURN_URL } from './config.js';
import { html } from './http.js';

export function handleReturnRedirect(url) {
  const dest = new URL(PROD_RETURN_URL);
  dest.search = url.search;
  return Response.redirect(dest.toString(), 302);
}

export function handleCancelRedirect(url) {
  const dest = new URL(PROD_CANCEL_URL);
  dest.search = url.search;
  return Response.redirect(dest.toString(), 302);
}

export function handleAdminMoved() {
  // Admin UI now lives on the static site at /admin/.
  return html(
    `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Admin — POET</title></head>` +
      `<body style="font-family:system-ui;background:#f4e6cf;color:#4a3324;padding:40px">` +
      `<h1>Trang admin đã chuyển chỗ.</h1>` +
      `<p>Mở trang quản trị mới tại <a href="${ADMIN_MOVED_URL}">/admin/</a>.</p>` +
      `</body></html>`,
    410,
  );
}
