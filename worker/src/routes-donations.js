/**
 * Public donation routes: create a pending gift + PayOS link,
 * published wall, per-order status, public on/off flag.
 */
import { PAYMENT_TTL_SECONDS, RATE_LIMIT_MAX_PER_HOUR } from './config.js';
import { error, json, readJsonBody } from './http.js';
import { randomOrderCode } from './crypto.js';
import { resolvePayosReturnUrls } from './callback-urls.js';
import { createPaymentLink, hmacSha256Hex, verifyDataSignature } from './payos.js';
import { validateAmount, validateDisplayName, validateMessage } from './validation.js';
import {
  countRecentAttempts,
  deleteDonation,
  findDonationStatus,
  insertPendingDonation,
  isDonationsEnabled,
  listPublicDonations,
  pruneAttempts,
  recordAttempt,
  setPaymentLinkId,
} from './store.js';

async function checkRateLimit(request, env) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return { response: error('Không xác định được địa chỉ IP.', 400) };

  const ipHashFull = await hmacSha256Hex(env.PAYOS_CHECKSUM_KEY, ip);
  const ipHash = ipHashFull.slice(0, 32);
  const now = new Date();
  const nowIso = now.toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

  await pruneAttempts(env, ipHash, twoHoursAgo);
  if ((await countRecentAttempts(env, ipHash, oneHourAgo)) >= RATE_LIMIT_MAX_PER_HOUR) {
    return { response: error('Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau một giờ.', 429) };
  }
  return { ipHash, nowIso };
}

async function insertWithRetry(env, base) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const orderCode = randomOrderCode();
    try {
      await insertPendingDonation(env, { ...base, orderCode });
      return orderCode;
    } catch (err) {
      const msg = String(err?.message || err);
      if (!/UNIQUE|constraint|PRIMARY/i.test(msg)) throw err;
    }
  }
  return null;
}

export async function handleCreateDonation(request, env) {
  if (!(await isDonationsEnabled(env))) {
    return error('Trang ủng hộ đang tạm tắt. Quay lại sau giúp nhé.', 403);
  }

  const limit = await checkRateLimit(request, env);
  if (limit.response) return limit.response;

  const { body, response: badBody } = await readJsonBody(request);
  if (badBody) return badBody;

  const amountError = validateAmount(body?.amount);
  if (amountError) return error(amountError, 400);

  const anonymous = Boolean(body?.anonymous);
  const { displayName, error: nameError } = validateDisplayName(body?.displayName, anonymous);
  if (nameError) return error(nameError, 400);

  const { message, error: messageError } = validateMessage(body?.message);
  if (messageError) return error(messageError, 400);

  const resolved = resolvePayosReturnUrls({
    origin: request.headers.get('Origin'),
    allowedOrigin: env.ALLOWED_ORIGIN,
    returnUrl: body?.returnUrl,
    cancelUrl: body?.cancelUrl,
  });
  if (!resolved) return error('Địa chỉ quay lại không hợp lệ.', 400);

  await recordAttempt(env, limit.ipHash, limit.nowIso);

  const orderCode = await insertWithRetry(env, {
    amount: body.amount,
    displayName,
    message,
    anonymous,
    nowIso: limit.nowIso,
  });
  if (!orderCode) return error('Không tạo được mã đơn. Vui lòng thử lại.', 500);

  // Bank message is the 9-digit orderCode itself (e.g. "482917364").
  // Unique per gift, fits the 9-char limit on unlinked PayOS accounts,
  // and is what donors/admins search for in the bank app or sao ke.
  // The donor's loi nhan stays on the wall and never goes in this field.
  const payosBody = {
    orderCode,
    amount: body.amount,
    description: String(orderCode),
    returnUrl: resolved.returnUrl,
    cancelUrl: resolved.cancelUrl,
    expiredAt: Math.floor(Date.now() / 1000) + PAYMENT_TTL_SECONDS,
    items: [{ name: 'Ung ho POET', quantity: 1, price: body.amount }],
  };

  let payosRes;
  try {
    payosRes = await createPaymentLink(env, payosBody);
  } catch {
    await deleteDonation(env, orderCode);
    return error('Không kết nối được PayOS.', 502);
  }

  const okCode = payosRes?.code === '00';
  const sigOk =
    payosRes?.data &&
    (await verifyDataSignature(payosRes.data, payosRes.signature, env.PAYOS_CHECKSUM_KEY));
  if (!okCode || !sigOk) {
    await deleteDonation(env, orderCode);
    return error('PayOS từ chối yêu cầu thanh toán.', 502);
  }

  await setPaymentLinkId(env, orderCode, payosRes.data.paymentLinkId);
  return json({ orderCode, checkoutUrl: payosRes.data.checkoutUrl });
}

export async function handleListPublic(env) {
  const { donations, totalAmount, totalCount } = await listPublicDonations(env);
  return json(
    { donations, totalAmount, totalCount },
    200,
    { 'Cache-Control': 'public, max-age=30' },
  );
}

export async function handleGetStatus(env, orderCode) {
  const code = Number(orderCode);
  if (!Number.isInteger(code)) return error('Mã đơn không hợp lệ.', 400);
  const row = await findDonationStatus(env, code);
  if (!row) return error('Không tìm thấy khoản ủng hộ.', 404);
  return json({
    status: row.status,
    hidden: row.status === 'success' ? Boolean(row.hidden) : false,
  });
}

export async function handleGetPublicSettings(env) {
  return json(
    { donationsEnabled: await isDonationsEnabled(env) },
    200,
    { 'Cache-Control': 'public, max-age=30' },
  );
}
