/*
  # Create leads and analytics tables

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `quoter_id` (uuid, references quoters)
      - `user_id` (uuid, references profiles) - the quoter owner
      - `name` (text) - lead's name
      - `email` (text) - lead's email
      - `phone` (text) - lead's phone
      - `address` (text) - property address
      - `estimated_linear_feet` (numeric) - measured from satellite
      - `quoted_price` (numeric) - the generated quote amount
      - `selected_material` (text)
      - `selected_addons` (jsonb) - array of selected add-ons
      - `status` (text) - new/contacted/quoted/converted/lost
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `quoter_events`
      - `id` (uuid, primary key)
      - `quoter_id` (uuid, references quoters)
      - `user_id` (uuid, references profiles) - the quoter owner
      - `event_type` (text) - view/click/quote_started/quote_completed
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Owner can read/manage their leads
    - Anon can insert leads and events (from embedded widget)
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quoter_id uuid NOT NULL REFERENCES quoters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  estimated_linear_feet numeric NOT NULL DEFAULT 0,
  quoted_price numeric NOT NULL DEFAULT 0,
  selected_material text NOT NULL DEFAULT '',
  selected_addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_quoter_id ON leads(quoter_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can insert leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quoters
      WHERE quoters.id = quoter_id
      AND quoters.status = 'active'
    )
  );

CREATE TABLE IF NOT EXISTS quoter_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quoter_id uuid NOT NULL REFERENCES quoters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quoter_events_quoter_id ON quoter_events(quoter_id);
CREATE INDEX IF NOT EXISTS idx_quoter_events_user_id ON quoter_events(user_id);
CREATE INDEX IF NOT EXISTS idx_quoter_events_type ON quoter_events(event_type);
CREATE INDEX IF NOT EXISTS idx_quoter_events_created ON quoter_events(created_at);

ALTER TABLE quoter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
  ON quoter_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can insert events"
  ON quoter_events FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quoters
      WHERE quoters.id = quoter_id
      AND quoters.status = 'active'
    )
  );