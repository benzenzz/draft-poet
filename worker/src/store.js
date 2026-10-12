/**
 * D1 access layer. All SQL lives here so route handlers stay I/O-light
 * and readable. Callers pass `env` (expects `env.DB`).
 */
import { ADMIN_LIST_LIMIT, PUBLIC_WALL_LIMIT } from './config.js';
import { hashPassword } from './crypto.js';

/* -- settings -- */

export async function getSetting(env, key, fallback) {
  try {
    const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?')
      .bind(key)
      .first();
    return row ? row.value : fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(env, key, value) {
  await env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
    .bind(key, value)
    .run();
}

export async function isDonationsEnabled(env) {
  return (await getSetting(env, 'donations_enabled', '1')) !== '0';
}

/* -- admin users / sessions -- */

/**
 * First-run seed of admin/admin. Only when ADMIN_TOKEN is configured, so a
 * deployment without the recovery secret can never expose a default login.
 * (With ADMIN_TOKEN set, prefer /api/admin/recover-password to set a real one.)
 */
export async function ensureAdminSeeded(env) {
  if (!String(env.ADMIN_TOKEN || '').trim()) return;
  try {
    // LIMIT 1 reads one row instead of scanning the whole table.
    const row = await env.DB.prepare('SELECT 1 AS x FROM admin_users LIMIT 1').first();
    if (row) return;
    const nowIso = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO admin_users (username, password_hash, updated_at) VALUES (?, ?, ?)',
    )
      .bind('admin', await hashPassword('admin'), nowIso)
      .run();
  } catch {
    // Tables may not be migrated yet; login will surface the error.
  }
}

export async function findAdminUser(env, username) {
  return env.DB.prepare('SELECT username, password_hash FROM admin_users WHERE username = ?')
    .bind(username)
    .first();
}

export async function upsertAdminPassword(env, username, passwordHash, nowIso) {
  await env.DB.prepare(
    'INSERT INTO admin_users (username, password_hash, updated_at) VALUES (?, ?, ?) ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, updated_at = excluded.updated_at',
  )
    .bind(username, passwordHash, nowIso)
    .run();
}

export async function createAdminSession(env, token, username, createdAt, expiresAt) {
  await env.DB.prepare(
    'INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)',
  )
    .bind(token, username, createdAt, expiresAt)
    .run();
}

/** Drop expired sessions. Called on login only, not on every admin request. */
export async function pruneExpiredAdminSessions(env, nowIso) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(nowIso).run();
}

export async function deleteAdminSession(env, token) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
}

export async function deleteOtherAdminSessions(env, username, keepToken) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE username = ? AND token != ?')
    .bind(username, keepToken)
    .run();
}

export async function deleteAdminSessionsForUser(env, username) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE username = ?').bind(username).run();
}

/* -- rate limiting -- */

/** Global cleanup of old attempt rows (all IPs). Called on admin login. */
export async function pruneAllAttempts(env, beforeIso) {
  await env.DB.prepare('DELETE FROM create_attempts WHERE created_at < ?').bind(beforeIso).run();
}


export async function pruneAttempts(env, ipHash, beforeIso) {
  await env.DB.prepare('DELETE FROM create_attempts WHERE ip_hash = ? AND created_at < ?')
    .bind(ipHash, beforeIso)
    .run();
}

export async function countRecentAttempts(env, ipHash, sinceIso) {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS c FROM create_attempts WHERE ip_hash = ? AND created_at >= ?',
  )
    .bind(ipHash, sinceIso)
    .first();
  return row?.c || 0;
}

export async function recordAttempt(env, ipHash, nowIso) {
  await env.DB.prepare('INSERT INTO create_attempts (ip_hash, created_at) VALUES (?, ?)')
    .bind(ipHash, nowIso)
    .run();
}

/* -- donations -- */

export async function insertPendingDonation(env, { orderCode, amount, displayName, message, anonymous, nowIso }) {
  await env.DB.prepare(
    `INSERT INTO donations (
       order_code, amount, display_name, message, anonymous, status, created_at
     ) VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
  )
    .bind(orderCode, amount, displayName, message, anonymous ? 1 : 0, nowIso)
    .run();
}

export async function deleteDonation(env, orderCode) {
  await env.DB.prepare('DELETE FROM donations WHERE order_code = ?').bind(orderCode).run();
}

export async function setPaymentLinkId(env, orderCode, paymentLinkId) {
  await env.DB.prepare('UPDATE donations SET payment_link_id = ? WHERE order_code = ?')
    .bind(paymentLinkId, orderCode)
    .run();
}

export async function listPublicDonations(env) {
  // One round trip for both queries. idx_donations_success_amount makes the
  // SUM/COUNT an index-only scan instead of reading whole donation rows.
  const [list, totals] = await env.DB.batch([
    env.DB.prepare(
      `SELECT display_name AS displayName,
              CASE WHEN hidden = 1 THEN '' ELSE message END AS message,
              amount, paid_at AS paidAt
       FROM donations
       WHERE status = 'success'
       ORDER BY paid_at DESC
       LIMIT ${PUBLIC_WALL_LIMIT}`,
    ),
    env.DB.prepare(
      `SELECT COALESCE(SUM(amount), 0) AS totalAmount, COUNT(*) AS totalCount
       FROM donations
       WHERE status = 'success'`,
    ),
  ]);
  const results = list.results;
  const totalRow = totals.results?.[0];

  return {
    donations: results || [],
    totalAmount: Number(totalRow?.totalAmount) || 0,
    totalCount: Number(totalRow?.totalCount) || 0,
  };
}

export async function findDonationStatus(env, orderCode) {
  try {
    return await env.DB.prepare(
      'SELECT status, hidden FROM donations WHERE order_code = ?',
    )
      .bind(orderCode)
      .first();
  } catch {
    return env.DB.prepare('SELECT status FROM donations WHERE order_code = ?')
      .bind(orderCode)
      .first();
  }
}

export async function findDonationForWebhook(env, orderCode) {
  try {
    return await env.DB.prepare(
      'SELECT order_code, amount, status, hidden FROM donations WHERE order_code = ?',
    )
      .bind(orderCode)
      .first();
  } catch {
    return env.DB.prepare(
      'SELECT order_code, amount, status FROM donations WHERE order_code = ?',
    )
      .bind(orderCode)
      .first();
  }
}

/**
 * Mark a pending donation as success with PayOS audit fields.
 * Does not touch hidden. Already-success rows are left alone (idempotent).
 * Falls back to the minimal update on DBs without the audit migration.
 */
export async function markDonationPaid(env, orderCode, data, paidAtIso) {
  const audit = {
    payos_reference: data.reference ?? null,
    paid_at: paidAtIso,
    payos_account_number: data.accountNumber ?? null,
    payos_transaction_time: data.transactionDateTime ?? null,
    payos_description: data.description ?? null,
    payos_currency: data.currency ?? null,
    counter_account_bank_id: data.counterAccountBankId ?? null,
    counter_account_bank_name: data.counterAccountBankName ?? null,
    counter_account_name: data.counterAccountName ?? null,
    counter_account_number: data.counterAccountNumber ?? null,
    virtual_account_name: data.virtualAccountName ?? null,
    virtual_account_number: data.virtualAccountNumber ?? null,
  };
  try {
    await env.DB.prepare(
      `UPDATE donations
       SET status = 'success', payos_reference = ?, paid_at = ?,
           payos_account_number = ?, payos_transaction_time = ?,
           payos_description = ?, payos_currency = ?,
           counter_account_bank_id = ?, counter_account_bank_name = ?,
           counter_account_name = ?, counter_account_number = ?,
           virtual_account_name = ?, virtual_account_number = ?,
           payment_link_id = COALESCE(payment_link_id, ?)
       WHERE order_code = ? AND status = 'pending'`,
    )
      .bind(
        audit.payos_reference,
        audit.paid_at,
        audit.payos_account_number,
        audit.payos_transaction_time,
        audit.payos_description,
        audit.payos_currency,
        audit.counter_account_bank_id,
        audit.counter_account_bank_name,
        audit.counter_account_name,
        audit.counter_account_number,
        audit.virtual_account_name,
        audit.virtual_account_number,
        data.paymentLinkId ?? null,
        orderCode,
      )
      .run();
  } catch {
    await env.DB.prepare(
      `UPDATE donations
       SET status = 'success', payos_reference = ?, paid_at = ?
       WHERE order_code = ? AND status = 'pending'`,
    )
      .bind(data.reference || null, paidAtIso, orderCode)
      .run();
  }
}

function withHiddenFlag(row) {
  if (!row) return row;
  return { ...row, hidden: Boolean(row.hidden) };
}

export async function listDonationsForAdmin(env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT order_code AS orderCode, amount, display_name AS displayName,
              message, anonymous, status, hidden, paid_at AS paidAt, created_at AS createdAt,
              payment_link_id AS paymentLinkId, payos_reference AS payosReference,
              payos_account_number AS payosAccountNumber,
              payos_transaction_time AS payosTransactionTime,
              payos_description AS payosDescription, payos_currency AS payosCurrency,
              counter_account_bank_id AS counterAccountBankId,
              counter_account_bank_name AS counterAccountBankName,
              counter_account_name AS counterAccountName,
              counter_account_number AS counterAccountNumber,
              virtual_account_name AS virtualAccountName,
              virtual_account_number AS virtualAccountNumber
       FROM donations
       ORDER BY created_at DESC
       LIMIT ${ADMIN_LIST_LIMIT}`,
    ).all();
    return (results || []).map(withHiddenFlag);
  } catch {
    // DB without the audit/hidden migration: select the base columns only.
    const { results } = await env.DB.prepare(
      `SELECT order_code AS orderCode, amount, display_name AS displayName,
              message, anonymous, status, paid_at AS paidAt, created_at AS createdAt
       FROM donations
       ORDER BY created_at DESC
       LIMIT ${ADMIN_LIST_LIMIT}`,
    ).all();
    return (results || []).map((row) => withHiddenFlag({ ...row, hidden: 0 }));
  }
}

export async function totalsForAdmin(env) {
  return env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) AS totalReceived, COUNT(*) AS receivedCount
     FROM donations
     WHERE status = 'success'`,
  ).first();
}

/** Set message visibility. Caller must ensure status = success. */
export async function setDonationHidden(env, orderCode, hidden) {
  await env.DB.prepare('UPDATE donations SET hidden = ? WHERE order_code = ? AND status = ?')
    .bind(hidden ? 1 : 0, orderCode, 'success')
    .run();
}

export async function updateAdminPassword(env, username, passwordHash, nowIso) {
  await env.DB.prepare(
    'UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE username = ?',
  )
    .bind(passwordHash, nowIso, username)
    .run();
}

export async function findAdminPasswordHash(env, username) {
  return env.DB.prepare('SELECT password_hash FROM admin_users WHERE username = ?')
    .bind(username)
    .first();
}

/**
 * Admin manual confirmation (bank transfer seen, webhook missed).
 * Only pending rows change; returns true when a row was updated.
 */
export async function markDonationPaidManually(env, orderCode, username, note, paidAtIso) {
  const res = await env.DB.prepare(
    `UPDATE donations
     SET status = 'success', paid_at = ?, payos_reference = ?,
         payos_description = COALESCE(?, payos_description)
     WHERE order_code = ? AND status = 'pending'`,
  )
    .bind(paidAtIso, `manual:${username}`, note, orderCode)
    .run();
  return (res?.meta?.changes || 0) > 0;
}
