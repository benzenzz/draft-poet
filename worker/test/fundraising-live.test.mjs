// Pure check of the live module's fundraising mapping: no DOM, no fetch.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFundraising } from '../../fundraising-live.mjs';

describe('parseFundraising (fundraising-live.mjs)', () => {
  it('fundraising object present -> raised plus both counts', () => {
    const data = {
      donations: [],
      totalAmount: 300000,
      totalCount: 2,
      fundraising: {
        individualAmount: 300000,
        individualCount: 2,
        businessAmount: 500000,
        businessCount: 1,
        raisedAmount: 800000,
      },
    };
    assert.deepEqual(parseFundraising(data), { raised: 800000, individual: 2, business: 1 });
  });
  it('fundraising object absent -> null, so the amount falls back to totalAmount', () => {
    assert.equal(parseFundraising({ donations: [], totalAmount: 300000, totalCount: 2 }), null);
    assert.equal(parseFundraising(null), null);
  });
  it('malformed raisedAmount -> null', () => {
    assert.equal(parseFundraising({ fundraising: { raisedAmount: -1 } }), null);
    assert.equal(parseFundraising({ fundraising: { raisedAmount: 'x' } }), null);
  });
  it('negative or missing counts are skipped per kind', () => {
    const out = parseFundraising({
      fundraising: { raisedAmount: 10, individualCount: 2 },
    });
    assert.equal(out.raised, 10);
    assert.equal(out.individual, 2);
    assert.equal(out.business, null);
  });
});
