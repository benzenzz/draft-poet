-- Safe to re-run. Admin list orders by created_at.
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations (created_at);
