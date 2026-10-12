/** PayOS webhook: verify signature, mark pending gifts as paid. Idempotent. */
import { error, json } from './http.js';
import { verifyDataSignature } from './payos.js';
import { findDonationForWebhook, markDonationPaid } from './store.js';

export async function handleWebhook(request, env) {
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
  if (!row) return json({ ok: true }, 200);

  const successMatch =
    payload.success === true &&
    payload.code === '00' &&
    data.code === '00' &&
    Number(data.amount) === Number(row.amount);
  if (!successMatch) return json({ ok: true }, 200);

  // Already success (including hidden gifts): leave status and hidden alone.
  if (row.status === 'success') {
    return json({ ok: true }, 200);
  }

  if (row.status === 'pending') {
    // Audit fields from PayOS: receiving account + donor (counter) bank info.
    // Never trust these for auth; stored for later review only.
    // Payment success auto-publishes to the public wall (status = success).
    await markDonationPaid(env, data.orderCode, data, new Date().toISOString());
  }

  return json({ ok: true }, 200);
}
