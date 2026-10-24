/** Mask links and common VN/EN curse words for donation display text. */

const LINK_RE =
  /(?:https?:\/\/|www\.)[^\s<>"']+|([a-z0-9-]+\.)+(?:com|net|org|vn|io|co|me|info|biz|xyz|dev|app)(?:\/[^\s<>"']*)?/gi;

// Word-boundary-ish match; Vietnamese insults often sit next to punctuation.
const CURSE_PATTERNS = [
  // English
  /\b(?:f+u+c+k+(?:ing|ed|er|s)?|sh+i+t+(?:s|ty)?|b+i+t+c+h+(?:es|y)?|a+s+s+h+o+l+e+s?|c+u+n+t+s?|d+i+c+k+(?:s|head)?|p+u+s+s+y+|m+o+t+h+e+r+f+u+c+k+(?:er|ing)?|bastards?|whores?|slut+s?)\b/gi,
  // Vietnamese (ascii + common leet / tone-stripped)
  /\b(?:đ+[mẹéèêếệỉị]|đm+|đmm+|đmmm+|đéo|đụ+|địt|ditme|dit\s*me|đjt|djt|clm+|cmm+|vcl+|vl+|lồn|lon\b|cặc|cak|cac\b|đĩ|dĩ|đỉ|đỉ\b|chó\s*đẻ|cho\s*de|đồ\s*chó|do\s*cho|ngu\s*vl|óc\s*chó|oc\s*cho)\b/gi,
  /(?:đm|đmm|đéo|đụ|địt|đjt|clm|cmm|vcl)\b/gi,
];

function maskLinks(text) {
  return text.replace(LINK_RE, '[link]');
}

function maskCurses(text) {
  let out = text;
  for (const re of CURSE_PATTERNS) {
    out = out.replace(re, (match) => '*'.repeat(Math.min(Math.max(match.length, 3), 8)));
  }
  return out;
}

/** Strip control chars / angle brackets, then mask links and curses. */
export function maskDonationText(value) {
  if (typeof value !== 'string') return '';
  let text = value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>]/g, '');
  text = maskLinks(text);
  text = maskCurses(text);
  return text.trim();
}

export function hasUnsafeControlChars(value) {
  return /[\u0000-\u001f\u007f]/.test(value) || /[<>]/.test(value);
}
