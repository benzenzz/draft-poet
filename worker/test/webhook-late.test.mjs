import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleWebhook } from '../src/routes-webhook.js';
import { signDataObject } from '../src/payos.js';
import worker from '../src/index.js';

const KEY = 'test-checksum-key-0123456789abcdef';
const URL_ = new URL('http://localhost:8787/api/webhooks/payos');

function fakeDB(rows) {
  const t = new Map(rows.map((r) => [r.order_code, { hidden: 0, ...r }]));
  let updates = 0;
  const exec = (sql, a) => {
    const s = sql.replace(/\s+/g, ' ');
    if (/^SELECT order_code, amount, status/.test(s)) { const r = t.get(a[0]); return { first: r ? { ...r } : null }; }
    if (/^UPDATE donations SET status = 'success', payos_reference = \?, paid_at = \?/.test(s)) {
      const code = a[a.length - 1]; const r = t.get(code);
      const m = /status IN \(([^)]*)\)/.exec(s); const allowed = m[1].split(',').map((x) => x.trim().replace(/'/g, ''));
      if (!r || !allowed.includes(r.status)) return { changes: 0 };
      updates++;
      Object.assign(r, { status: 'success', payos_reference: a[0], paid_at: a[1], counter_account_name: a[8] });
      return { changes: 1 };
    }
    throw new Error('unhandled SQL: ' + s);
  };
  return {
    t, get updates() { return updates; },
    prepare(sql) {
      let args = [];
      const st = {
        bind(...x) { args = x; return st; },
        async first() { return exec(sql, args).first; },
        async run() { return { meta: { changes: exec(sql, args).changes || 0 } }; },
      };
      return st;
    },
  };
}

async function hook(env, data, extra = {}) {
  const signature = await signDataObject(data, KEY);
  return handleWebhook(new Request(URL_, {
    method: 'POST', body: JSON.stringify({ code: '00', success: true, data, signature, ...extra }),
  }), env, URL_);
}
const paid = (orderCode, amount) => ({ orderCode, amount, code: '00', reference: 'FT123', counterAccountName: 'NGUYEN VAN A', description: String(orderCode) });

describe('late PayOS webhook', () => {
  for (const status of ['pending', 'expired', 'cancelled']) {
    it(`${status} order -> success with PayOS details`, async () => {
      const DB = fakeDB([{ order_code: 111, amount: 50000, status, created_at: '2020-01-01T00:00:00Z' }]);
      const res = await hook({ DB, PAYOS_CHECKSUM_KEY: KEY }, paid(111, 50000));
      assert.equal(res.status, 200);
      const r = DB.t.get(111);
      assert.equal(r.status, 'success');
      assert.equal(r.payos_reference, 'FT123');
      assert.equal(r.counter_account_name, 'NGUYEN VAN A');
    });
  }
  it('idempotent: second webhook does not update again', async () => {
    const DB = fakeDB([{ order_code: 112, amount: 50000, status: 'expired' }]);
    const env = { DB, PAYOS_CHECKSUM_KEY: KEY };
    await hook(env, paid(112, 50000));
    await hook(env, paid(112, 50000));
    assert.equal(DB.updates, 1);
  });
  it('hidden success row is left alone', async () => {
    const DB = fakeDB([{ order_code: 113, amount: 50000, status: 'success', hidden: 1, payos_reference: 'OLD' }]);
    await hook({ DB, PAYOS_CHECKSUM_KEY: KEY }, paid(113, 50000));
    assert.equal(DB.t.get(113).payos_reference, 'OLD');
    assert.equal(DB.t.get(113).hidden, 1);
  });
  it('bad signature -> 400, no change', async () => {
    const DB = fakeDB([{ order_code: 114, amount: 50000, status: 'expired' }]);
    const res = await handleWebhook(new Request(URL_, { method: 'POST',
      body: JSON.stringify({ code: '00', success: true, data: paid(114, 50000), signature: 'x'.repeat(64) }) }),
    { DB, PAYOS_CHECKSUM_KEY: KEY }, URL_);
    assert.equal(res.status, 400);
    assert.equal(DB.t.get(114).status, 'expired');
  });
  it('amount mismatch -> ignored', async () => {
    const DB = fakeDB([{ order_code: 115, amount: 50000, status: 'pending' }]);
    await hook({ DB, PAYOS_CHECKSUM_KEY: KEY }, paid(115, 40000));
    assert.equal(DB.t.get(115).status, 'pending');
  });
  it('not paid (code != 00) -> ignored', async () => {
    const DB = fakeDB([{ order_code: 116, amount: 50000, status: 'cancelled' }]);
    await hook({ DB, PAYOS_CHECKSUM_KEY: KEY }, { ...paid(116, 50000), code: '01' });
    assert.equal(DB.t.get(116).status, 'cancelled');
  });
});

describe('manual confirm removed', () => {
  it('POST /api/admin/donations/:code/mark-paid -> 404', async () => {
    const res = await worker.fetch(new Request('http://w/api/admin/donations/123456789/mark-paid', {
      method: 'POST', headers: { Authorization: 'Bearer x', 'Content-Type': 'application/json' }, body: '{"receivedAmount":50000}',
    }), { DB: fakeDB([]), PAYOS_CHECKSUM_KEY: KEY }, {});
    assert.equal(res.status, 404);
  });
});
