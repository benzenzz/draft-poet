/** Random ids, SHA-256 and password hashing (Web Crypto, no dependencies). */
import { timingSafeEqual } from './payos.js';
import { ORDER_CODE_MAX, ORDER_CODE_MIN } from './config.js';

export function randomOrderCode() {
  const range = ORDER_CODE_MAX - ORDER_CODE_MIN + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return ORDER_CODE_MIN + (buf[0] % range);
}

export function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(message) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(message));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password) {
  const salt = randomHex(16);
  const hash = await sha256Hex(`${salt}$${password}`);
  return `${salt}$${hash}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const sep = stored.indexOf('$');
  if (sep <= 0) return false;
  const salt = stored.slice(0, sep);
  const expected = stored.slice(sep + 1);
  const actual = await sha256Hex(`${salt}$${password}`);
  return timingSafeEqual(actual, expected);
}
