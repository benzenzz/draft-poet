/** Admin auth: bearer sessions + legacy ADMIN_TOKEN fallback. */
import { timingSafeEqual } from './payos.js';
import { error, json } from './http.js';
import { ensureAdminSeeded } from './store.js';

export function getBearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : '';
}

/** Returns { username, legacy, token? } or null. */
export async function authorizeAdmin(request, env) {
  const token = getBearerToken(request);
  if (!token) return null;

  const adminToken = String(env.ADMIN_TOKEN || '').trim();
  if (adminToken && timingSafeEqual(token, adminToken)) {
    return { username: 'admin', legacy: true };
  }

  try {
    const nowIso = new Date().toISOString();
    await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?')
      .bind(nowIso)
      .run();
    const row = await env.DB.prepare(
      'SELECT username FROM admin_sessions WHERE token = ? AND expires_at > ?',
    )
      .bind(token, nowIso)
      .first();
    if (!row) return null;
    return { username: row.username, legacy: false, token };
  } catch {
    return null;
  }
}

/** Gate for admin routes: { session } or { response: 401 }. */
export async function requireAdmin(request, env) {
  const session = await authorizeAdmin(request, env);
  if (!session) return { response: error('Không có quyền truy cập.', 401) };
  return { session };
}

export { ensureAdminSeeded };
export async function adminMe(request, env) {
  const { response: denied, session } = await requireAdmin(request, env);
  return denied || json({ username: session.username });
}
