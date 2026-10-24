-- Safe to re-run.
CREATE INDEX IF NOT EXISTS idx_donations_success_amount ON donations (status, amount);
