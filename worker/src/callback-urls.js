/** PayOS return/cancel URL validation. Pure, unit-tested. */
import { PROD_CANCEL_URL, PROD_RETURN_URL } from './config.js';
import { isLocalDevOrigin } from './http.js';

function isAllowedCallback(url, origin, pathSuffix) {
  return (
    url.origin === origin &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash &&
    url.pathname.endsWith(pathSuffix)
  );
}

/**
 * Resolve PayOS return/cancel URLs. Returns { returnUrl, cancelUrl } or null.
 * - No Origin header (curl, PayOS server calls): fall back to production URLs.
 * - Otherwise the supplied URLs must live on the same origin and end with
 *   /ung-ho/return.html and /ung-ho/cancel.html (no query, hash or userinfo).
 */
export function resolvePayosReturnUrls({ origin, allowedOrigin, returnUrl, cancelUrl }) {
  if (!origin) {
    return { returnUrl: PROD_RETURN_URL, cancelUrl: PROD_CANCEL_URL };
  }

  if (origin !== allowedOrigin && !isLocalDevOrigin(origin)) {
    return null;
  }

  if (typeof returnUrl !== 'string' || typeof cancelUrl !== 'string') {
    return null;
  }

  let parsedReturn;
  let parsedCancel;
  try {
    parsedReturn = new URL(returnUrl);
    parsedCancel = new URL(cancelUrl);
  } catch {
    return null;
  }

  if (
    !isAllowedCallback(parsedReturn, origin, '/ung-ho/return.html') ||
    !isAllowedCallback(parsedCancel, origin, '/ung-ho/cancel.html')
  ) {
    return null;
  }

  return { returnUrl: parsedReturn.href, cancelUrl: parsedCancel.href };
}
