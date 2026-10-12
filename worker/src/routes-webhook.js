/** PayOS webhook: verify signature, mark pending gifts as paid. Idempotent. */
import { error, json } from './http.js';
import { verifyDataSignature } from './payos.js';
import { enrichManualDonation, findDonationForWebhook, markDonationPaid } from './store.js';
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
  const isManual = row.status === 'success' && String(row.payos_reference || '').startsWith('manual:');
  // Manual rows may carry an admin-corrected amount, so the PayOS amount
  // is not compared; enrichment never touches amount/status/paid_at.
  const successMatch = paidOk && (isManual || Number(data.amount) === Number(row.amount));
  if (!successMatch) return json({ ok: true }, 200);

  // Already success (including hidden gifts): leave status and hidden alone.
  // Manually confirmed earlier: just attach the PayOS audit fields.
  if (row.status === 'success') {
    if (String(row.payos_reference || '').startsWith('manual:') && data.reference) {
      await enrichManualDonation(env, data.orderCode, data);
    }
    return json({ ok: true }, 200);
  }

  if (row.status === 'pending') {
    // Audit fields from PayOS: receiving account + donor (counter) bank info.
    // Never trust these for auth; stored for later review only.
    // Payment success auto-publishes to the public wall (status = success).
    await markDonationPaid(env, data.orderCode, data, new Date().toISOString());
    await purgePublicListCache(url);
  }

  return json({ ok: true }, 200);
}
