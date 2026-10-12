CREATE TABLE IF NOT EXISTS donations (
  order_code INTEGER PRIMARY KEY,
  amount INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  anonymous INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  payment_link_id TEXT,
  payos_reference TEXT,
  created_at TEXT NOT NULL,
  paid_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_donations_public ON donations (status, paid_at);

CREATE TABLE IF NOT EXISTS create_attempts (
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_ip ON create_attempts (ip_hash, created_at);
