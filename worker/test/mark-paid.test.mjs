import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleAdminMarkPaid } from '../src/routes-admin.js';
import { handleWebhook } from '../src/routes-webhook.js';
import { parseReceivedAmount } from '../src/validation.js';
import { signDataObject } from '../src/payos.js';
import { totalsForAdmin } from '../src/store.js';

// Minimal in-memory D1 covering the statements these handlers use.
function fakeDB(rows) {
  const t = new Map(rows.map((r) => [r.order_code, { hidden: 0, ...r }]));
  const exec = (sql, a) => {
    const s = sql.replace(/\s+/g, ' ');
    if (/^SELECT status, hidden, amount FROM donations/.test(s) || /^SELECT order_code, amount, status, hidden, payos_reference/.test(s)) {
      const r = t.get(a[0]); return { first: r ? { ...r } : null };
    }
    if (/SUM\(amount\)/.test(s)) {
      const ok = [...t.values()].filter((r) => r.status === 'success');
      return { first: { totalReceived: ok.reduce((x, r) => x + r.amount, 0), receivedCount: ok.length } };
    }
    if (/SET status = 'success', paid_at = \?, payos_reference = \?/.test(s)) {
      const [paid, ref, note, amt, code] = a; const r = t.get(code);
      if (!r || r.status !== 'pending') return { changes: 0 };
      Object.assign(r, { status: 'success', paid_at: paid, payos_reference: ref,
        payos_description: note ?? r.payos_description, amount: amt ?? r.amount });
      return { changes: 1 };
    }
    if (/SET payos_description = payos_reference/.test(s)) {
      const code = a[11]; const r = t.get(code);
      if (!r || r.status !== 'success' || !String(r.payos_reference).startsWith('manual:')) return { changes: 0 };
      r.payos_description = r.payos_reference + (r.payos_description ? ' | ' + r.payos_description : '');
      r.payos_reference = a[0]; r.counter_account_name = a[6];
      return { changes: 1 };
    }
    if (/SET status = 'success', payos_reference = \?, paid_at = \?/.test(s)) {
      const code = a[a.length - 1]; const r = t.get(code);
      if (r && r.status === 'pending') Object.assign(r, { status: 'success', payos_reference: a[0], paid_at: a[1] });
      return { changes: r ? 1 : 0 };
    }
    throw new Error('unhandled SQL: ' + s);
  };
  return {
    t,
    prepare(sql) {
      let args = [];
      const st = {
        bind(...x) { args = x; return st; },
        async first() { return exec(sql, args).first; },
        async run() { return { meta: { changes: exec(sql, args).changes || 0 } }; },
        async all() { return { results: [] }; },
      };
      return st;
    },
  };
}

const KEY = 'test-checksum-key-0123456789abcdef';
const URL_ = new URL('http://localhost:8787/x');
const session = { username: 'admin' };
let env;
beforeEach(() => {
  env = { PAYOS_CHECKSUM_KEY: KEY, DB: fakeDB([
    { order_code: 111, amount: 50000, status: 'pending' },
    { order_code: 222, amount: 30000, status: 'success', paid_at: 'p0', payos_reference: 'R0' },
  ]) };
});
const mark = (body, code = 111) => handleAdminMarkPaid(
  new Request('http://x', { method: 'POST', body: body === undefined ? '' : JSON.stringify(body) }),
  env, String(code), URL_, session);
async function hook(code, amount, ref = 'FT123') {
  const data = { orderCode: code, amount, code: '00', desc: 'success', reference: ref,
    accountNumber: '1', transactionDateTime: 't', currency: 'VND', counterAccountName: 'NGUYEN A',
    description: String(code), paymentLinkId: 'pl' };
  const signature = await signDataObject(data, KEY);
  return handleWebhook(new Request('http://x', { method: 'POST',
    body: JSON.stringify({ code: '00', desc: 'success', success: true, data, signature }) }), env, URL_);
}
const row = (c = 111) => env.DB.t.get(c);

describe('parseReceivedAmount', () => {
  for (const v of [true, false, [7], {}, 0, -5, 1.5, '1e3', '-5', '12.5', '', ' ', NaN, Infinity, 20000001, '20000001']) {
    it(`rejects ${JSON.stringify(v)}`, () => assert.ok(parseReceivedAmount(v).error));
  }
  it('rejects missing', () => assert.ok(parseReceivedAmount(undefined).error));
  it('accepts number and digit string', () => {
    assert.equal(parseReceivedAmount(50000).value, 50000);
    assert.equal(parseReceivedAmount('50000').value, 50000);
    assert.equal(parseReceivedAmount(20000000).value, 20000000);
  });
});

describe('mark-paid endpoint', () => {
  for (const [name, body] of [['true', { receivedAmount: true }], ['[7]', { receivedAmount: [7] }],
    ['missing field', { note: 'x' }], ['empty body', undefined], ['> cap', { receivedAmount: 20000001 }],
    ['0', { receivedAmount: 0 }], ['array body', [50000]]]) {
    it(`400 for ${name}, nothing changes`, async () => {
      const res = await mark(body);
      assert.equal(res.status, 400);
      assert.equal(row().status, 'pending');
    });
  }
  it('matching amount succeeds, amount unchanged', async () => {
    const res = await mark({ receivedAmount: '50000' });
    assert.equal(res.status, 200);
    assert.equal(row().status, 'success'); assert.equal(row().amount, 50000);
    assert.match(row().payos_description, /^nhận: 50\.000 đ/);
  });
  it('mismatch without flag → 409, nothing changes', async () => {
    const res = await mark({ receivedAmount: 45000 });
    assert.equal(res.status, 409);
    const j = await res.json();
    assert.deepEqual([j.mismatch, j.expected, j.received], [true, 50000, 45000]);
    assert.equal(row().status, 'pending'); assert.equal(row().amount, 50000);
  });
  it('mismatch with confirmMismatch:"yes" (not true) still 409', async () => {
    assert.equal((await mark({ receivedAmount: 45000, confirmMismatch: 'yes' })).status, 409);
  });
  it('mismatch with flag → success, counted amount = received, original in note, totals use received', async () => {
    const res = await mark({ receivedAmount: 45000, confirmMismatch: true });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).mismatch, true);
    assert.equal(row().status, 'success'); assert.equal(row().amount, 45000);
    assert.match(row().payos_description, /đơn gốc: 50\.000 đ, nhận: 45\.000 đ \(LỆCH\)/);
    const tot = await totalsForAdmin(env);
    assert.equal(Number(tot.totalReceived ?? tot.total ?? tot?.[0]), 75000);
  });
  it('already-success order → 409', async () => {
    assert.equal((await mark({ receivedAmount: 30000 }, 222)).status, 409);
  });
});

describe('webhook after manual mark', () => {
  it('fills payOS fields, keeps status/amount/paid_at; replay is idempotent', async () => {
    await mark({ receivedAmount: 50000 });
    const before = { ...row() };
    assert.equal((await hook(111, 50000)).status, 200);
    const after1 = { ...row() };
    assert.equal(after1.payos_reference, 'FT123');
    assert.equal(after1.counter_account_name, 'NGUYEN A');
    assert.match(after1.payos_description, /^manual:admin \| nhận/);
    for (const k of ['status', 'amount', 'paid_at']) assert.equal(after1[k], before[k]);
    await hook(111, 50000);
    assert.deepEqual({ ...row() }, after1);
  });
  it('after confirmed mismatch, webhook (orig amount) does not overwrite corrected amount', async () => {
    await mark({ receivedAmount: 45000, confirmMismatch: true });
    const paid = row().paid_at;
    await hook(111, 50000);
    assert.equal(row().amount, 45000); assert.equal(row().status, 'success');
    assert.equal(row().paid_at, paid); assert.equal(row().payos_reference, 'FT123');
  });
  it('replay on a normal success row changes nothing', async () => {
    const b = { ...row(222) }; await hook(222, 30000); assert.deepEqual({ ...row(222) }, b);
  });
  it('bad signature rejected', async () => {
    const res = await handleWebhook(new Request('http://x', { method: 'POST',
      body: JSON.stringify({ success: true, code: '00', data: { orderCode: 111, amount: 50000, code: '00' }, signature: 'bad' }) }), env, URL_);
    assert.equal(res.status, 400); assert.equal(row().status, 'pending');
  });
});
