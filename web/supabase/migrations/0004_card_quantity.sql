-- Add quantity column to cards (default 1 copy per listing)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1);
