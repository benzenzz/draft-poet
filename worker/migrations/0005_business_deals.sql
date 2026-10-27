-- Manual business-deal ledger. Separate table on purpose: a business deal has
-- no PayOS order code and must never appear on the public message wall, so it
-- cannot live in `donations`. One global ledger, no season column.
-- Safe to re-run (CREATE ... IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS business_deals (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  tax_code TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
-- Public fundraising aggregate reads received money in one index-only scan.
CREATE INDEX IF NOT EXISTS idx_business_deals_status_amount
  ON business_deals (status, amount);
