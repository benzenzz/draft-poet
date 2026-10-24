/**
 * Server price list for the donate gift picker. Must match ung-ho/items.js
 * (the frontend list). The server trusts only this list, never the browser.
 */
export const GIFTS = Object.freeze({
  but: 10000,
  tap: 20000,
  sach: 50000,
  mau: 100000,
  ao: 200000,
  balo: 500000,
});
