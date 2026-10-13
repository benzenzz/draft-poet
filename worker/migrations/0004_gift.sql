-- Concept D: one gift type per donation, shown on the wall as "Tên tặng N Gift".
-- Both nullable: custom-amount donations and older rows have no gift.
ALTER TABLE donations ADD COLUMN gift_id TEXT;
ALTER TABLE donations ADD COLUMN gift_qty INTEGER;
