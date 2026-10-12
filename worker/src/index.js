import {
  cancelPaymentLink,
  createPaymentLink,
  hmacSha256Hex,
  timingSafeEqual,
  verifyDataSignature,
} from './payos.js';

const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 20000000;
const SITE_UNG_HO = 'https://maiphh.github.io/poet/ung-ho/';

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function error(message, status, extraHeaders = {}) {
  return json({ error: message }, status, extraHeaders);
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function isLocalDevOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

function applyCors(response, origin) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}

function hasForbiddenContent(value) {
  if (/[\u0000-\u001f\u007f]/.test(value)) return true;
  if (/[<>]/.test(value)) return true;
  if (/https?:\/\//i.test(value)) return true;
  if (/www\./i.test(value)) return true;
  return false;
}

function randomOrderCode() {
  const min = 100000000;
  const max = 999999999;
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

async function authorizeAdmin(request, env) {
  const header = request.headers.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return false;
  return timingSafeEqual(match[1].trim(), String(env.ADMIN_TOKEN || '').trim());
}

async function handleCreateDonation(request, env) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return error('Không xác định được địa chỉ IP.', 400);

  const ipHashFull = await hmacSha256Hex(env.PAYOS_CHECKSUM_KEY, ip);
  const ipHash = ipHashFull.slice(0, 32);
  const now = new Date();
  const nowIso = now.toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    'DELETE FROM create_attempts WHERE ip_hash = ? AND created_at < ?',
  )
    .bind(ipHash, twoHoursAgo)
    .run();

  const countRow = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM create_attempts WHERE ip_hash = ? AND created_at >= ?',
  )
    .bind(ipHash, oneHourAgo)
    .first();
  if ((countRow?.c || 0) >= 5) {
    return error('Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau một giờ.', 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return error('Dữ liệu không hợp lệ.', 400);
  }

  const amount = body?.amount;
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return error('Số tiền phải từ 10.000 đến 20.000.000 đồng.', 400);
  }

  const anonymous = Boolean(body?.anonymous);
  let displayName;
  if (anonymous) {
    displayName = 'Ẩn danh';
  } else {
    displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
    if (displayName.length < 1 || displayName.length > 40) {
      return error('Tên hiển thị phải từ 1 đến 40 ký tự.', 400);
    }
    if (hasForbiddenContent(displayName)) {
      return error('Tên hiển thị chứa nội dung không được phép.', 400);
    }
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (message.length < 1 || message.length > 160) {
    return error('Lời nhắn phải từ 1 đến 160 ký tự.', 400);
  }
  if (hasForbiddenContent(message)) {
    return error('Lời nhắn chứa nội dung không được phép.', 400);
  }

  await env.DB.prepare(
    'INSERT INTO create_attempts (ip_hash, created_at) VALUES (?, ?)',
  )
    .bind(ipHash, nowIso)
    .run();

  const workerOrigin = new URL(request.url).origin;
  const returnUrl = `${workerOrigin}/return`;
  const cancelUrl = `${workerOrigin}/cancel`;
  const description = 'UNGHO';
  const expiredAt = Math.floor(Date.now() / 1000) + 30 * 60;

  let orderCode;
  let inserted = false;
  for (let attempt = 0; attempt < 8; attempt++) {
    orderCode = randomOrderCode();
    try {
      await env.DB.prepare(
        `INSERT INTO donations (
          order_code, amount, display_name, message, anonymous, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      )
        .bind(orderCode, amount, displayName, message, anonymous ? 1 : 0, nowIso)
        .run();
      inserted = true;
      break;
    } catch (err) {
      const msg = String(err?.message || err);
      if (!/UNIQUE|constraint|PRIMARY/i.test(msg)) throw err;
    }
  }
  if (!inserted) {
    return error('Không tạo được mã đơn. Vui lòng thử lại.', 500);
  }

  const payosBody = {
    orderCode,
    amount,
    description,
    returnUrl,
    cancelUrl,
    expiredAt,
    items: [{ name: 'Ung ho POET', quantity: 1, price: amount }],
  };

  let payosRes;
  try {
    payosRes = await createPaymentLink(env, payosBody);
  } catch {
    await env.DB.prepare('DELETE FROM donations WHERE order_code = ?').bind(orderCode).run();
    return error('Không kết nối được PayOS.', 502);
  }

  const okCode = payosRes?.code === '00';
  const sigOk =
    payosRes?.data &&
    (await verifyDataSignature(payosRes.data, payosRes.signature, env.PAYOS_CHECKSUM_KEY));

  if (!okCode || !sigOk) {
    await env.DB.prepare('DELETE FROM donations WHERE order_code = ?').bind(orderCode).run();
    return error('PayOS từ chối yêu cầu thanh toán.', 502);
  }

  await env.DB.prepare(
    'UPDATE donations SET payment_link_id = ? WHERE order_code = ?',
  )
    .bind(payosRes.data.paymentLinkId, orderCode)
    .run();

  return json({ orderCode, checkoutUrl: payosRes.data.checkoutUrl });
}

async function handleListPublic(env) {
  const { results } = await env.DB.prepare(
    `SELECT display_name AS displayName, message, amount, paid_at AS paidAt
     FROM donations
     WHERE status = 'published'
     ORDER BY paid_at DESC
     LIMIT 30`,
  ).all();
  return json(
    { donations: results || [] },
    200,
    { 'Cache-Control': 'public, max-age=30' },
  );
}

async function handleGetStatus(env, orderCode) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await env.DB.prepare(
    'SELECT status FROM donations WHERE order_code = ?',
  )
    .bind(code)
    .first();
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  return json({ status: row.status });
}

async function handleWebhook(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return error('JSON không hợp lệ.', 400);
  }

  if (!payload || typeof payload !== 'object' || !payload.data) {
    return error('Thiếu dữ liệu webhook.', 400);
  }

  const ok = await verifyDataSignature(
    payload.data,
    payload.signature,
    env.PAYOS_CHECKSUM_KEY,
  );
  if (!ok) return error('Chữ ký không hợp lệ.', 400);

  const data = payload.data;
  const orderCode = data.orderCode;
  const row = await env.DB.prepare(
    'SELECT order_code, amount, status FROM donations WHERE order_code = ?',
  )
    .bind(orderCode)
    .first();

  if (!row) {
    return json({ ok: true }, 200);
  }

  const successMatch =
    payload.success === true &&
    payload.code === '00' &&
    data.code === '00' &&
    Number(data.amount) === Number(row.amount);

  if (!successMatch) {
    return json({ ok: true }, 200);
  }

  if (row.status === 'paid' || row.status === 'published' || row.status === 'hidden') {
    return json({ ok: true }, 200);
  }

  if (row.status === 'pending' || row.status === 'cancelled') {
    await env.DB.prepare(
      `UPDATE donations
       SET status = 'paid', payos_reference = ?, paid_at = ?
       WHERE order_code = ? AND status IN ('pending', 'cancelled')`,
    )
      .bind(data.reference || null, new Date().toISOString(), orderCode)
      .run();
  }

  return json({ ok: true }, 200);
}

async function handleAdminList(env) {
  const { results } = await env.DB.prepare(
    `SELECT order_code AS orderCode, amount, display_name AS displayName,
            message, anonymous, status, paid_at AS paidAt, created_at AS createdAt
     FROM donations
     WHERE status IN ('paid', 'published', 'hidden')
     ORDER BY COALESCE(paid_at, created_at) DESC`,
  ).all();
  return json({ donations: results || [] });
}

async function handleAdminPublish(env, orderCode) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await env.DB.prepare(
    'SELECT status FROM donations WHERE order_code = ?',
  )
    .bind(code)
    .first();
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  if (row.status !== 'paid' && row.status !== 'hidden') {
    return error('Chỉ có thể đăng khoản đã thanh toán hoặc đang ẩn.', 400);
  }
  await env.DB.prepare(
    `UPDATE donations SET status = 'published' WHERE order_code = ?`,
  )
    .bind(code)
    .run();
  return json({ ok: true, status: 'published' });
}

async function handleAdminHide(env, orderCode) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await env.DB.prepare(
    'SELECT status FROM donations WHERE order_code = ?',
  )
    .bind(code)
    .first();
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  if (row.status !== 'published' && row.status !== 'paid') {
    return error('Chỉ có thể ẩn khoản đã đăng hoặc đã thanh toán.', 400);
  }
  await env.DB.prepare(
    `UPDATE donations SET status = 'hidden' WHERE order_code = ?`,
  )
    .bind(code)
    .run();
  return json({ ok: true, status: 'hidden' });
}

function receiptPage({ title, heading, detail, orderCode, mode }) {
  const safeTitle = escapeHtml(title);
  const safeHeading = escapeHtml(heading);
  const safeDetail = escapeHtml(detail);
  const codeAttr = orderCode ? String(Number(orderCode) || '') : '';
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <style>
    :root { color-scheme: light only; }
    body { margin: 0; font-family: system-ui, sans-serif; background: #f4e6cf; color: #4a3324; }
    main { max-width: 520px; margin: 48px auto; padding: 28px; background: #fffaf1; border: 2.5px solid #2f2219; border-radius: 22px; box-shadow: 4px 5px 0 #2f2219; }
    h1 { font-size: 28px; margin: 0 0 12px; }
    p { line-height: 1.55; color: #7a5b45; }
    a { color: #3a9e74; font-weight: 700; }
    .status { margin-top: 16px; font-weight: 700; color: #4a3324; }
  </style>
</head>
<body>
  <main>
    <h1>${safeHeading}</h1>
    <p>${safeDetail}</p>
    <p class="status" id="status"></p>
    <p><a href="${SITE_UNG_HO}">Quay lại trang Ủng hộ</a></p>
  </main>
  <script>
    (function () {
      var mode = ${JSON.stringify(mode)};
      var orderCode = ${JSON.stringify(codeAttr)};
      var el = document.getElementById('status');
      if (mode !== 'return' || !orderCode) return;
      fetch('/api/donations/' + encodeURIComponent(orderCode))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (!data || !data.status) {
            el.textContent = 'Chưa đọc được trạng thái. Quà của bạn vẫn được ghi nhận khi thanh toán thành công.';
            return;
          }
          if (data.status === 'published') {
            el.textContent = 'Lời nhắn đã được đăng trên tường ủng hộ.';
          } else if (data.status === 'paid') {
            el.textContent = 'Đã nhận thanh toán. Lời nhắn sẽ hiện sau khi được duyệt.';
          } else if (data.status === 'pending') {
            el.textContent = 'Đang chờ xác nhận thanh toán.';
          } else {
            el.textContent = 'Trạng thái hiện tại: ' + data.status + '.';
          }
        })
        .catch(function () {
          el.textContent = 'Chưa đọc được trạng thái. Quà của bạn vẫn được ghi nhận khi thanh toán thành công.';
        });
    })();
  </script>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function adminPage() {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin ủng hộ — POET</title>
  <style>
    :root { color-scheme: light only; }
    body { margin: 0; font-family: system-ui, sans-serif; background: #f4e6cf; color: #4a3324; }
    main { max-width: 720px; margin: 32px auto; padding: 24px; }
    h1 { font-size: 28px; }
    label { display: block; margin-bottom: 6px; font-weight: 700; }
    input[type="password"] { width: 100%; max-width: 420px; padding: 10px 12px; border: 2px solid #2f2219; border-radius: 12px; background: #fffaf1; }
    button { margin: 8px 8px 0 0; padding: 10px 16px; border: 2px solid #2f2219; border-radius: 999px; background: #ff8a76; font-weight: 700; cursor: pointer; }
    button.secondary { background: #fffaf1; }
    .row { background: #fffaf1; border: 2px solid #2f2219; border-radius: 16px; padding: 14px; margin: 12px 0; }
    .meta { color: #7a5b45; font-size: 14px; }
    .err { color: #b5482c; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>Duyệt lời nhắn ủng hộ</h1>
    <label for="token">Admin token</label>
    <input id="token" type="text" autocomplete="off" spellcheck="false" autocapitalize="off">
    <button type="button" id="save">Lưu token</button>
    <button type="button" id="reload" class="secondary">Tải lại danh sách</button>
    <p class="err" id="err" role="status"></p>
    <div id="list"></div>
  </main>
  <script>
    (function () {
      var tokenInput = document.getElementById('token');
      var list = document.getElementById('list');
      var err = document.getElementById('err');
      tokenInput.value = sessionStorage.getItem('poetAdminToken') || '';

      function token() { return tokenInput.value.trim(); }

      function setErr(msg) { err.textContent = msg || ''; }

      function money(n) {
        return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
      }

      async function load() {
        setErr('');
        list.textContent = '';
        if (!token()) { setErr('Nhập token trước.'); return; }
        var res = await fetch('/api/admin/donations', {
          headers: { Authorization: 'Bearer ' + token() }
        });
        if (res.status === 401) {
          sessionStorage.removeItem('poetAdminToken');
          setErr('Token không đúng. Đã xóa token cũ trong trình duyệt. Dán lại đúng một dòng, ' + token().length + ' ký tự.');
          return;
        }
        if (!res.ok) { setErr('Không tải được danh sách.'); return; }
        var data = await res.json();
        (data.donations || []).forEach(function (d) {
          var row = document.createElement('div');
          row.className = 'row';
          var title = document.createElement('strong');
          title.textContent = d.displayName + ' · ' + money(d.amount);
          var msg = document.createElement('p');
          msg.textContent = d.message;
          var meta = document.createElement('p');
          meta.className = 'meta';
          meta.textContent = '#' + d.orderCode + ' · ' + d.status + (d.paidAt ? ' · ' + d.paidAt : '');
          var pub = document.createElement('button');
          pub.type = 'button';
          pub.textContent = 'Đăng';
          pub.addEventListener('click', function () { act(d.orderCode, 'publish'); });
          var hide = document.createElement('button');
          hide.type = 'button';
          hide.className = 'secondary';
          hide.textContent = 'Ẩn';
          hide.addEventListener('click', function () { act(d.orderCode, 'hide'); });
          row.appendChild(title);
          row.appendChild(msg);
          row.appendChild(meta);
          row.appendChild(pub);
          row.appendChild(hide);
          list.appendChild(row);
        });
      }

      async function act(orderCode, action) {
        setErr('');
        var res = await fetch('/api/admin/donations/' + orderCode + '/' + action, {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token() }
        });
        if (res.status === 401) {
          sessionStorage.removeItem('poetAdminToken');
          setErr('Token không đúng. Đã xóa token cũ trong trình duyệt.');
          return;
        }
        if (!res.ok) {
          var body = await res.json().catch(function () { return {}; });
          setErr(body.error || 'Thao tác thất bại.');
          return;
        }
        load();
      }

      document.getElementById('save').addEventListener('click', function () {
        sessionStorage.setItem('poetAdminToken', token());
        load();
      });
      document.getElementById('reload').addEventListener('click', load);
    })();
  </script>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();
    const isApi = pathname.startsWith('/api/');
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGIN;

    // The admin page is served by this Worker. Its fetch sends this host as
    // Origin, which is not the GitHub Pages origin allowed for the public site.
    const sameHost = origin === url.origin;
    const corsOrigin =
      origin === allowed || isLocalDevOrigin(origin) ? origin : '';

    if (isApi && method === 'OPTIONS') {
      if (corsOrigin) {
        return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) });
      }
      if (sameHost) return new Response(null, { status: 204 });
      return new Response(null, { status: 403 });
    }

    if (isApi && origin && !corsOrigin && !sameHost) {
      return error('Nguồn không được phép.', 403);
    }

    let response;

    try {
      if (method === 'POST' && pathname === '/api/donations') {
        response = await handleCreateDonation(request, env);
      } else if (method === 'GET' && pathname === '/api/donations') {
        response = await handleListPublic(env);
      } else if (method === 'GET' && pathname.startsWith('/api/donations/')) {
        response = await handleGetStatus(env, pathname.slice('/api/donations/'.length));
      } else if (method === 'POST' && pathname === '/api/webhooks/payos') {
        response = await handleWebhook(request, env);
      } else if (method === 'GET' && pathname === '/api/admin/donations') {
        if (!(await authorizeAdmin(request, env))) {
          response = error('Không có quyền truy cập.', 401);
        } else {
          response = await handleAdminList(env);
        }
      } else if (method === 'POST' && /^\/api\/admin\/donations\/\d+\/publish$/.test(pathname)) {
        if (!(await authorizeAdmin(request, env))) {
          response = error('Không có quyền truy cập.', 401);
        } else {
          const code = pathname.split('/')[4];
          response = await handleAdminPublish(env, code);
        }
      } else if (method === 'POST' && /^\/api\/admin\/donations\/\d+\/hide$/.test(pathname)) {
        if (!(await authorizeAdmin(request, env))) {
          response = error('Không có quyền truy cập.', 401);
        } else {
          const code = pathname.split('/')[4];
          response = await handleAdminHide(env, code);
        }
      } else if (method === 'GET' && pathname === '/return') {
        const orderCode = url.searchParams.get('orderCode');
        response = html(
          receiptPage({
            title: 'Cảm ơn bạn — POET',
            heading: 'Cảm ơn bạn đã ủng hộ.',
            detail:
              'Nếu thanh toán thành công, món quà đã được ghi nhận. Tên và lời nhắn sẽ hiện trên trang ủng hộ sau khi được duyệt.',
            orderCode,
            mode: 'return',
          }),
        );
      } else if (method === 'GET' && pathname === '/cancel') {
        response = html(
          receiptPage({
            title: 'Đã hủy — POET',
            heading: 'Thanh toán đã được hủy.',
            detail:
              'Không sao cả. Bạn có thể quay lại trang ủng hộ bất cứ lúc nào khi sẵn sàng.',
            orderCode: url.searchParams.get('orderCode'),
            mode: 'cancel',
          }),
        );
      } else if (method === 'GET' && pathname === '/admin') {
        response = html(adminPage());
      } else {
        response = error('Không tìm thấy.', 404);
      }
    } catch (err) {
      console.error(String(err?.message || err));
      response = error('Lỗi máy chủ.', 500);
    }

    if (isApi && corsOrigin) {
      return applyCors(response, corsOrigin);
    }
    return response;
  },
};

// Exported for deploy checks that import cancel helpers if needed.
export { cancelPaymentLink };
