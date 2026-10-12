const PAYOS_BASE = 'https://api-merchant.payos.vn';

export function sortObjDataByKey(object) {
  return Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
}

export function convertObjToQueryStr(object) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }
      if ([null, undefined, 'undefined', 'null'].includes(value)) {
        value = '';
      }
      return `${key}=${value}`;
    })
    .join('&');
}

export async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function signDataObject(data, checksumKey) {
  const sorted = sortObjDataByKey(data);
  const query = convertObjToQueryStr(sorted);
  return hmacSha256Hex(checksumKey, query);
}

export async function verifyDataSignature(data, signature, checksumKey) {
  if (!signature || typeof signature !== 'string') return false;
  const expected = await signDataObject(data, checksumKey);
  return timingSafeEqual(expected, signature);
}

export function paymentRequestSignPayload({ amount, cancelUrl, description, orderCode, returnUrl }) {
  return `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
}

export async function createPaymentLink(env, body) {
  const signature = await hmacSha256Hex(
    env.PAYOS_CHECKSUM_KEY,
    paymentRequestSignPayload(body),
  );
  const res = await fetch(`${PAYOS_BASE}/v2/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': env.PAYOS_CLIENT_ID,
      'x-api-key': env.PAYOS_API_KEY,
    },
    body: JSON.stringify({ ...body, signature }),
  });
  return res.json();
}

export async function cancelPaymentLink(env, orderCode, cancellationReason = 'test') {
  const res = await fetch(`${PAYOS_BASE}/v2/payment-requests/${orderCode}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': env.PAYOS_CLIENT_ID,
      'x-api-key': env.PAYOS_API_KEY,
    },
    body: JSON.stringify({ cancellationReason }),
  });
  return res.json();
}

export async function confirmWebhook(env, webhookUrl) {
  const res = await fetch(`${PAYOS_BASE}/confirm-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': env.PAYOS_CLIENT_ID,
      'x-api-key': env.PAYOS_API_KEY,
    },
    body: JSON.stringify({ webhookUrl }),
  });
  return res.json();
}
