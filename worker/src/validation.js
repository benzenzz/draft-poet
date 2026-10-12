/**
 * Donation input validation. Returns sanitized values or a Vietnamese
 * error message. Masking (link/curse) lives in mask.js.
 */
import { MAX_AMOUNT, MIN_AMOUNT } from './config.js';
import { hasUnsafeControlChars, maskDonationText } from './mask.js';

export function validateAmount(amount) {
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return 'Số tiền phải từ 10.000 đến 20.000.000 đồng.';
  }
  return null;
}

export function validateDisplayName(rawName, anonymous) {
  if (anonymous) return { displayName: 'Ẩn danh', error: null };
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  if (name.length < 1 || name.length > 40) {
    return { displayName: null, error: 'Tên hiển thị phải từ 1 đến 40 ký tự.' };
  }
  if (hasUnsafeControlChars(name)) {
    return { displayName: null, error: 'Tên hiển thị chứa nội dung không được phép.' };
  }
  const displayName = maskDonationText(name).slice(0, 40);
  if (!displayName) {
    return { displayName: null, error: 'Tên hiển thị phải từ 1 đến 40 ký tự.' };
  }
  return { displayName, error: null };
}

export function validateMessage(rawMessage) {
  const text = typeof rawMessage === 'string' ? rawMessage.trim() : '';
  if (text.length < 1 || text.length > 160) {
    return { message: null, error: 'Lời nhắn phải từ 1 đến 160 ký tự.' };
  }
  if (hasUnsafeControlChars(text)) {
    return { message: null, error: 'Lời nhắn chứa nội dung không được phép.' };
  }
  const message = maskDonationText(text).slice(0, 160);
  if (!message) {
    return { message: null, error: 'Lời nhắn phải từ 1 đến 160 ký tự.' };
  }
  return { message, error: null };
}
