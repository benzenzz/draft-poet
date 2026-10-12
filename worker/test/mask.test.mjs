import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hasUnsafeControlChars, maskDonationText } from '../src/mask.js';

describe('maskDonationText', () => {
  it('masks http links', () => {
    assert.equal(maskDonationText('xem https://evil.example/x nhé'), 'xem [link] nhé');
  });

  it('masks www links', () => {
    assert.equal(maskDonationText('vào www.spam.vn ngay'), 'vào [link] ngay');
  });

  it('masks english curses', () => {
    const out = maskDonationText('what the fuck is this shit');
    assert.match(out, /\*{3,}/);
    assert.doesNotMatch(out, /fuck/i);
    assert.doesNotMatch(out, /shit/i);
  });

  it('masks vietnamese curses', () => {
    const out = maskDonationText('đm thằng này vcl');
    assert.match(out, /\*{3,}/);
    assert.doesNotMatch(out, /đm/i);
  });

  it('strips angle brackets', () => {
    assert.equal(maskDonationText('hello <script>'), 'hello script');
  });
});

describe('hasUnsafeControlChars', () => {
  it('flags control characters', () => {
    assert.equal(hasUnsafeControlChars('ok\u0000'), true);
    assert.equal(hasUnsafeControlChars('ok'), false);
  });
});
