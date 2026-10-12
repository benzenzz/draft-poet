import {
  cancelPaymentLink,
  createPaymentLink,
  hmacSha256Hex,
  timingSafeEqual,
  verifyDataSignature,
} from './payos.js';
import { hasUnsafeControlChars, maskDonationText } from './mask.js';

const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 20000000;
const PROD_RETURN_URL = 'https://maiphh.github.io/poet/ung-ho/return.html';
const PROD_CANCEL_URL = 'https://maiphh.github.io/poet/ung-ho/cancel.html';

/** Public wall + totals treat these as successfully received gifts. */
const SUCCESS_STATUSES = ['success', 'paid', 'published'];

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

/** Pure resolver for PayOS return/cancel URLs. Returns null when invalid. */
export function resolvePayosReturnUrls({ origin, allowedOrigin, returnUrl, cancelUrl }) {
  if (!origin) {
    return { returnUrl: PROD_RETURN_URL, cancelUrl: PROD_CANCEL_URL };
  }

  if (origin !== allowedOrigin && !isLocalDevOrigin(origin)) {
    return null;
  }

  if (typeof returnUrl !== 'string' || typeof cancelUrl !== 'string') {
    return null;
  }

  let parsedReturn;
  let parsedCancel;
  try {
    parsedReturn = new URL(returnUrl);
    parsedCancel = new URL(cancelUrl);
  } catch {
    return null;
  }

  function isAllowedCallback(url, pathSuffix) {
    return (
      url.origin === origin &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname.endsWith(pathSuffix)
    );
  }

  if (
    !isAllowedCallback(parsedReturn, '/ung-ho/return.html') ||
    !isAllowedCallback(parsedCancel, '/ung-ho/cancel.html')
  ) {
    return null;
  }

  return { returnUrl: parsedReturn.href, cancelUrl: parsedCancel.href };
}

function applyCors(response, origin) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}

function isSuccessStatus(status) {
  return SUCCESS_STATUSES.includes(status);
}

function successStatusSqlList() {
  return SUCCESS_STATUSES.map((s) => `'${s}'`).join(', ');
}

function randomOrderCode() {
  const min = 100000000;
  const max = 999999999;
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(message) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(message));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
  const salt = randomHex(16);
  const hash = await sha256Hex(`${salt}$${password}`);
  return `${salt}$${hash}`;
}

async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const sep = stored.indexOf('$');
  if (sep <= 0) return false;
  const salt = stored.slice(0, sep);
  const expected = stored.slice(sep + 1);
  const actual = await sha256Hex(`${salt}$${password}`);
  return timingSafeEqual(actual, expected);
}

// Seed the default admin/admin account on first use.
async function ensureAdminSeeded(env) {
  try {
    const row = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM admin_users',
    ).first();
    if ((row?.c || 0) > 0) return;
    const nowIso = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO admin_users (username, password_hash, updated_at) VALUES (?, ?, ?)',
    )
      .bind('admin', await hashPassword('admin'), nowIso)
      .run();
  } catch {
    // Tables may not be migrated yet; login will surface the error.
  }
}

function getBearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : '';
}

// Returns { username, legacy } or null.
async function authorizeAdmin(request, env) {
  const token = getBearerToken(request);
  if (!token) return null;
  const adminToken = String(env.ADMIN_TOKEN || '').trim();
  if (adminToken && timingSafeEqual(token, adminToken)) {
    return { username: 'admin', legacy: true };
  }
  try {
    await env.DB.prepare(
      'DELETE FROM admin_sessions WHERE expires_at <= ?',
    )
      .bind(new Date().toISOString())
      .run();
    const row = await env.DB.prepare(
      'SELECT username FROM admin_sessions WHERE token = ? AND expires_at > ?',
    )
      .bind(token, new Date().toISOString())
      .first();
    if (!row) return null;
    return { username: row.username, legacy: false, token };
  } catch {
    return null;
  }
}

async function getSetting(env, key, fallback) {
  try {
    const row = await env.DB.prepare(
      'SELECT value FROM settings WHERE key = ?',
    )
      .bind(key)
      .first();
    return row ? row.value : fallback;
  } catch {
    return fallback;
  }
}

async function setSetting(env, key, value) {
  await env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
    .bind(key, value)
    .run();
}

async function isDonationsEnabled(env) {
  const value = await getSetting(env, 'donations_enabled', '1');
  return value !== '0';
}

async function handleAdminLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('Dữ liệu không hợp lệ.', 400);
  }
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!username || !password) {
    return error('Nhập tên đăng nhập và mật khẩu.', 400);
  }

  await ensureAdminSeeded(env);
  let user;
  try {
    user = await env.DB.prepare(
      'SELECT username, password_hash FROM admin_users WHERE username = ?',
    )
      .bind(username)
      .first();
  } catch (err) {
    console.error(String(err?.message || err));
    return error('Chưa có bảng tài khoản. Hãy chạy migration schema mới.', 500);
  }
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return error('Tên đăng nhập hoặc mật khẩu không đúng.', 401);
  }

  const token = randomHex(32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    'INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)',
  )
    .bind(token, user.username, now.toISOString(), expiresAt)
    .run();
  return json({ token, username: user.username, expiresAt });
}

async function handleAdminLogout(request, env, session) {
  if (!session.legacy && session.token) {
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?')
      .bind(session.token)
      .run();
  }
  return json({ ok: true });
}

async function handleAdminChangePassword(request, env, session) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('Dữ liệu không hợp lệ.', 400);
  }
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  if (newPassword.length < 4 || newPassword.length > 72) {
    return error('Mật khẩu mới phải từ 4 đến 72 ký tự.', 400);
  }

  if (session.legacy) {
    // Old static-token sessions have no password to check against.
    const username = typeof body?.username === 'string' && body.username.trim()
      ? body.username.trim()
      : 'admin';
    await ensureAdminSeeded(env);
    await env.DB.prepare(
      'INSERT INTO admin_users (username, password_hash, updated_at) VALUES (?, ?, ?) ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, updated_at = excluded.updated_at',
    )
      .bind(username, await hashPassword(newPassword), new Date().toISOString())
      .run();
    await env.DB.prepare('DELETE FROM admin_sessions WHERE username = ?')
      .bind(username)
      .run();
    return json({ ok: true });
  }

  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  if (!currentPassword) {
    return error('Nhập mật khẩu hiện tại.', 400);
  }
  const user = await env.DB.prepare(
    'SELECT password_hash FROM admin_users WHERE username = ?',
  )
    .bind(session.username)
    .first();
  if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
    return error('Mật khẩu hiện tại không đúng.', 401);
  }
  await env.DB.prepare(
    'UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE username = ?',
  )
    .bind(await hashPassword(newPassword), new Date().toISOString(), session.username)
    .run();
  // Keep the current session, drop the rest.
  await env.DB.prepare(
    'DELETE FROM admin_sessions WHERE username = ? AND token != ?',
  )
    .bind(session.username, session.token)
    .run();
  return json({ ok: true });
}

async function handleCreateDonation(request, env) {
  if (!(await isDonationsEnabled(env))) {
    return error('Trang ủng hộ đang tạm tắt. Quay lại sau giúp nhé.', 403);
  }

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
    const rawName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
    if (rawName.length < 1 || rawName.length > 40) {
      return error('Tên hiển thị phải từ 1 đến 40 ký tự.', 400);
    }
    if (hasUnsafeControlChars(rawName)) {
      return error('Tên hiển thị chứa nội dung không được phép.', 400);
    }
    displayName = maskDonationText(rawName).slice(0, 40);
    if (!displayName) {
      return error('Tên hiển thị phải từ 1 đến 40 ký tự.', 400);
    }
  }

  const rawMessage = typeof body?.message === 'string' ? body.message.trim() : '';
  if (rawMessage.length < 1 || rawMessage.length > 160) {
    return error('Lời nhắn phải từ 1 đến 160 ký tự.', 400);
  }
  if (hasUnsafeControlChars(rawMessage)) {
    return error('Lời nhắn chứa nội dung không được phép.', 400);
  }
  const message = maskDonationText(rawMessage).slice(0, 160);
  if (!message) {
    return error('Lời nhắn phải từ 1 đến 160 ký tự.', 400);
  }

  const resolved = resolvePayosReturnUrls({
    origin: request.headers.get('Origin'),
    allowedOrigin: env.ALLOWED_ORIGIN,
    returnUrl: body?.returnUrl,
    cancelUrl: body?.cancelUrl,
  });
  if (!resolved) {
    return error('Địa chỉ quay lại không hợp lệ.', 400);
  }
  const { returnUrl, cancelUrl } = resolved;

  await env.DB.prepare(
    'INSERT INTO create_attempts (ip_hash, created_at) VALUES (?, ?)',
  )
    .bind(ipHash, nowIso)
    .run();

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
  const statusList = successStatusSqlList();
  const { results } = await env.DB.prepare(
    `SELECT display_name AS displayName, message, amount, paid_at AS paidAt
     FROM donations
     WHERE status IN (${statusList})
     ORDER BY paid_at DESC
     LIMIT 30`,
  ).all();

  const totalRow = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS totalAmount, COUNT(*) AS totalCount
     FROM donations
     WHERE status IN (${statusList})`,
  ).first();

  return json(
    {
      donations: results || [],
      totalAmount: Number(totalRow?.totalAmount) || 0,
      totalCount: Number(totalRow?.totalCount) || 0,
    },
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

  // Already received (or intentionally hidden): idempotent success.
  if (isSuccessStatus(row.status) || row.status === 'hidden') {
    return json({ ok: true }, 200);
  }

  if (row.status === 'pending' || row.status === 'cancelled') {
    // Audit fields from PayOS: receiving account + donor (counter) bank info.
    // Never trust these for auth; they are stored for later review only.
    // Payment success auto-publishes to the public wall (status = success).
    const audit = {
      payos_reference: data.reference ?? null,
      paid_at: new Date().toISOString(),
      payos_account_number: data.accountNumber ?? null,
      payos_transaction_time: data.transactionDateTime ?? null,
      payos_description: data.description ?? null,
      payos_currency: data.currency ?? null,
      counter_account_bank_id: data.counterAccountBankId ?? null,
      counter_account_bank_name: data.counterAccountBankName ?? null,
      counter_account_name: data.counterAccountName ?? null,
      counter_account_number: data.counterAccountNumber ?? null,
      virtual_account_name: data.virtualAccountName ?? null,
      virtual_account_number: data.virtualAccountNumber ?? null,
    };
    try {
      await env.DB.prepare(
        `UPDATE donations
         SET status = 'success', payos_reference = ?, paid_at = ?,
             payos_account_number = ?, payos_transaction_time = ?,
             payos_description = ?, payos_currency = ?,
             counter_account_bank_id = ?, counter_account_bank_name = ?,
             counter_account_name = ?, counter_account_number = ?,
             virtual_account_name = ?, virtual_account_number = ?,
             payment_link_id = COALESCE(payment_link_id, ?)
         WHERE order_code = ? AND status IN ('pending', 'cancelled')`,
      )
        .bind(
          audit.payos_reference,
          audit.paid_at,
          audit.payos_account_number,
          audit.payos_transaction_time,
          audit.payos_description,
          audit.payos_currency,
          audit.counter_account_bank_id,
          audit.counter_account_bank_name,
          audit.counter_account_name,
          audit.counter_account_number,
          audit.virtual_account_name,
          audit.virtual_account_number,
          data.paymentLinkId ?? null,
          orderCode,
        )
        .run();
    } catch {
      // DB without the audit migration: fall back to the minimal update.
      await env.DB.prepare(
        `UPDATE donations
         SET status = 'success', payos_reference = ?, paid_at = ?
         WHERE order_code = ? AND status IN ('pending', 'cancelled')`,
      )
        .bind(data.reference || null, new Date().toISOString(), orderCode)
        .run();
    }
  }

  return json({ ok: true }, 200);
}

async function handleAdminList(env) {
  // Full donate history for audit: every status, newest first.
  // Donor bank fields are admin-only; the public wall never sees them.
  const statusList = successStatusSqlList();
  let donations = [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT order_code AS orderCode, amount, display_name AS displayName,
              message, anonymous, status, paid_at AS paidAt, created_at AS createdAt,
              payment_link_id AS paymentLinkId, payos_reference AS payosReference,
              payos_account_number AS payosAccountNumber,
              payos_transaction_time AS payosTransactionTime,
              payos_description AS payosDescription, payos_currency AS payosCurrency,
              counter_account_bank_id AS counterAccountBankId,
              counter_account_bank_name AS counterAccountBankName,
              counter_account_name AS counterAccountName,
              counter_account_number AS counterAccountNumber,
              virtual_account_name AS virtualAccountName,
              virtual_account_number AS virtualAccountNumber
       FROM donations
       ORDER BY COALESCE(paid_at, created_at) DESC
       LIMIT 500`,
    ).all();
    donations = results || [];
  } catch {
    // DB without the audit migration: select the base columns only.
    const { results } = await env.DB.prepare(
      `SELECT order_code AS orderCode, amount, display_name AS displayName,
              message, anonymous, status, paid_at AS paidAt, created_at AS createdAt
       FROM donations
       ORDER BY COALESCE(paid_at, created_at) DESC
       LIMIT 500`,
    ).all();
    donations = results || [];
  }

  const totalRow = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS totalReceived, COUNT(*) AS receivedCount
     FROM donations
     WHERE status IN (${statusList})`,
  ).first();

  return json({
    donations,
    totalReceived: Number(totalRow?.totalReceived) || 0,
    receivedCount: Number(totalRow?.receivedCount) || 0,
  });
}

async function handleGetPublicSettings(env) {
  return json(
    { donationsEnabled: await isDonationsEnabled(env) },
    200,
    { 'Cache-Control': 'public, max-age=30' },
  );
}

async function handleGetAdminSettings(env) {
  return json({ donationsEnabled: await isDonationsEnabled(env) });
}

async function handleUpdateAdminSettings(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('Dữ liệu không hợp lệ.', 400);
  }
  if (typeof body?.donationsEnabled !== 'boolean') {
    return error('Thiếu trạng thái bật/tắt ủng hộ.', 400);
  }
  await setSetting(env, 'donations_enabled', body.donationsEnabled ? '1' : '0');
  return json({ ok: true, donationsEnabled: body.donationsEnabled });
}

/** Restore a hidden gift onto the public wall (status = success). */
async function handleAdminShow(env, orderCode) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await env.DB.prepare(
    'SELECT status FROM donations WHERE order_code = ?',
  )
    .bind(code)
    .first();
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  if (row.status !== 'hidden' && !isSuccessStatus(row.status)) {
    return error('Chỉ có thể hiện khoản đã thanh toán hoặc đang ẩn.', 400);
  }
  await env.DB.prepare(
    `UPDATE donations SET status = 'success' WHERE order_code = ?`,
  )
    .bind(code)
    .run();
  return json({ ok: true, status: 'success' });
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
  if (!isSuccessStatus(row.status)) {
    return error('Chỉ có thể ẩn khoản đã thanh toán thành công.', 400);
  }
  await env.DB.prepare(
    `UPDATE donations SET status = 'hidden' WHERE order_code = ?`,
  )
    .bind(code)
    .run();
  return json({ ok: true, status: 'hidden' });
}

/**
 * Dev recovery: reset admin password with the Worker ADMIN_TOKEN secret
 * when the interactive password is lost. Does not require a session.
 */
async function handleAdminRecoverPassword(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return error('Dữ liệu không hợp lệ.', 400);
  }

  const recoveryToken =
    typeof body?.recoveryToken === 'string' ? body.recoveryToken.trim() : '';
  const adminToken = String(env.ADMIN_TOKEN || '').trim();
  if (!adminToken || !recoveryToken || !timingSafeEqual(recoveryToken, adminToken)) {
    return error('Mã khôi phục không đúng.', 401);
  }

  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  if (newPassword.length < 4 || newPassword.length > 72) {
    return error('Mật khẩu mới phải từ 4 đến 72 ký tự.', 400);
  }

  const username =
    typeof body?.username === 'string' && body.username.trim()
      ? body.username.trim()
      : 'admin';

  await ensureAdminSeeded(env);
  await env.DB.prepare(
    `INSERT INTO admin_users (username, password_hash, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, updated_at = excluded.updated_at`,
  )
    .bind(username, await hashPassword(newPassword), new Date().toISOString())
    .run();
  await env.DB.prepare('DELETE FROM admin_sessions WHERE username = ?')
    .bind(username)
    .run();
  return json({ ok: true, username });
}

async function requireAdmin(request, env) {
  const session = await authorizeAdmin(request, env);
  if (!session) return { response: error('Không có quyền truy cập.', 401) };
  return { session };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();
    const isApi = pathname.startsWith('/api/');
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGIN;

    // The frontend /admin page calls this Worker from the GitHub Pages
    // origin (or localhost during dev), same as the public donate page.
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
      } else if (method === 'GET' && pathname === '/api/settings') {
        response = await handleGetPublicSettings(env);
      } else if (method === 'GET' && pathname.startsWith('/api/donations/')) {
        response = await handleGetStatus(env, pathname.slice('/api/donations/'.length));
      } else if (method === 'POST' && pathname === '/api/webhooks/payos') {
        response = await handleWebhook(request, env);
      } else if (method === 'POST' && pathname === '/api/admin/login') {
        response = await handleAdminLogin(request, env);
      } else if (method === 'GET' && pathname === '/api/admin/me') {
        const { response: denied, session } = await requireAdmin(request, env);
        response = denied || json({ username: session.username });
      } else if (method === 'POST' && pathname === '/api/admin/logout') {
        const { response: denied, session } = await requireAdmin(request, env);
        response = denied || (await handleAdminLogout(request, env, session));
      } else if (method === 'POST' && pathname === '/api/admin/change-password') {
        const { response: denied, session } = await requireAdmin(request, env);
        response = denied || (await handleAdminChangePassword(request, env, session));
      } else if (method === 'POST' && pathname === '/api/admin/recover-password') {
        response = await handleAdminRecoverPassword(request, env);
      } else if (method === 'GET' && pathname === '/api/admin/settings') {
        const { response: denied } = await requireAdmin(request, env);
        response = denied || (await handleGetAdminSettings(env));
      } else if (method === 'POST' && pathname === '/api/admin/settings') {
        const { response: denied } = await requireAdmin(request, env);
        response = denied || (await handleUpdateAdminSettings(request, env));
      } else if (method === 'GET' && pathname === '/api/admin/donations') {
        const { response: denied } = await requireAdmin(request, env);
        response = denied || (await handleAdminList(env));
      } else if (
        method === 'POST' &&
        /^\/api\/admin\/donations\/\d+\/(show|publish)$/.test(pathname)
      ) {
        // /publish kept as an alias for older admin clients.
        const { response: denied } = await requireAdmin(request, env);
        if (denied) {
          response = denied;
        } else {
          const code = pathname.split('/')[4];
          response = await handleAdminShow(env, code);
        }
      } else if (method === 'POST' && /^\/api\/admin\/donations\/\d+\/hide$/.test(pathname)) {
        const { response: denied } = await requireAdmin(request, env);
        if (denied) {
          response = denied;
        } else {
          const code = pathname.split('/')[4];
          response = await handleAdminHide(env, code);
        }
      } else if (method === 'GET' && pathname === '/return') {
        const dest = new URL(PROD_RETURN_URL);
        dest.search = url.search;
        response = Response.redirect(dest.toString(), 302);
      } else if (method === 'GET' && pathname === '/cancel') {
        const dest = new URL(PROD_CANCEL_URL);
        dest.search = url.search;
        response = Response.redirect(dest.toString(), 302);
      } else if (method === 'GET' && pathname === '/admin') {
        // Admin UI now lives on the static site at /admin/.
        // Keep a hint for anyone still opening the old Worker URL.
        response = html(
          `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Admin — POET</title></head>` +
            `<body style="font-family:system-ui;background:#f4e6cf;color:#4a3324;padding:40px">` +
            `<h1>Trang admin đã chuyển chỗ.</h1>` +
            `<p>Mở trang quản trị mới tại <a href="https://maiphh.github.io/poet/admin/">/admin/</a>.</p>` +
            `</body></html>`,
          410,
        );
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

// Exported for deploy checks and unit tests.
export { cancelPaymentLink };
