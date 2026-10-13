/** PayOS webhook: verify signature, settle unpaid gifts. Idempotent. */
import { error, json } from './http.js';
import { verifyDataSignature } from './payos.js';
import { UNPAID_STATUSES, findDonationForWebhook, markDonationPaid } from './store.js';
import { purgePublicListCache } from './routes-donations.js';

export async function handleWebhook(request, env, url) {
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
  const row = await findDonationForWebhook(env, data.orderCode);
  if (!row) {
    // Signed by PayOS but unknown to us: log for follow-up (no personal data).
    console.warn(
      `payos webhook: no donation row for orderCode=${Number(data.orderCode)} amount=${Number(data.amount)}`,
    );
    return json({ ok: true }, 200);
  }

  const paidOk = payload.success === true && payload.code === '00' && data.code === '00';
  if (!paidOk || Number(data.amount) !== Number(row.amount)) return json({ ok: true }, 200);

  // Already success (including hidden gifts): leave status and hidden alone.
  if (row.status === 'success') return json({ ok: true }, 200);

  if (UNPAID_STATUSES.includes(row.status)) {
    // Pending or past the link expiry: a valid paid webhook still settles it.
    // Audit fields are stored for review only, never trusted for auth.
    await markDonationPaid(env, data.orderCode, data, new Date().toISOString());
    await purgePublicListCache(url);
  }

  return json({ ok: true }, 200);
}
