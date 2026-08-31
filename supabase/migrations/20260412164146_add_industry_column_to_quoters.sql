/*
  # Add industry column to quoters table

  1. Changes
    - Add `industry` column (text) to `quoters` table
    - Supported values: gutters, roofs, decks, fences, landscaping
    - Default value: 'gutters' (for backward compatibility with existing quoters)
    - Add index on industry column for filtering

  2. Notes
    - Existing quoters will automatically get 'gutters' as their industry
    - No data loss, purely additive change
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quoters' AND column_name = 'industry'
  ) THEN
    ALTER TABLE quoters ADD COLUMN industry text NOT NULL DEFAULT 'gutters';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quoters_industry ON quoters(industry);
