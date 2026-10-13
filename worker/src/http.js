/** JSON / HTML / CORS response helpers. Pure, no D1 or fetch. */

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

export function error(message, status, extraHeaders = {}) {
  return json({ error: message }, status, extraHeaders);
}

export function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function applyCors(response, origin) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}

export function isLocalDevOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
  } catch {
    return false;
  }
}

/** Returns { origin, allowed, corsOrigin, sameHost } for the CORS gate. */
export function resolveCors(request, env, url) {
  const origin = request.headers.get('Origin');
  const allowed = env.ALLOWED_ORIGIN;
  const sameHost = origin === url.origin;
  // localhost is only trusted when this Worker is itself configured for dev
  // (ALLOWED_ORIGIN is localhost, or ALLOW_LOCALHOST_ORIGINS=1).
  const devMode = isLocalDevOrigin(allowed) || String(env.ALLOW_LOCALHOST_ORIGINS || '') === '1';
  const corsOrigin = origin === allowed || (devMode && isLocalDevOrigin(origin)) ? origin : '';
  return { origin, allowed, corsOrigin, sameHost };
}

/**
 * Parse a JSON body, returning { body } or { response } with a 400 error.
 * Keeps every handler's invalid-body path identical.
 */
export async function readJsonBody(request) {
  try {
    return { body: await request.json() };
  } catch {
    return { response: error('Dữ liệu không hợp lệ.', 400) };
  }
}
