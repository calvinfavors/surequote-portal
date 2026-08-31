/*
  # Create quoters table

  1. New Tables
    - `quoters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text) - name of the quoter
      - `slug` (text, unique) - URL-friendly identifier for embedding
      - `status` (text) - active/inactive
      - `config` (jsonb) - materials, pricing, add-ons, styles
      - `branding` (jsonb) - colors, fonts, logo URL, company info
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS
    - Policies for authenticated users to manage their own quoters
    - Public read policy for active quoters (needed for embed)
*/

CREATE TABLE IF NOT EXISTS quoters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  config jsonb NOT NULL DEFAULT '{
    "materials": [],
    "price_per_linear_foot": 0,
    "add_ons": [],
    "gutter_sizes": [],
    "gutter_styles": [],
    "minimum_charge": 0
  }'::jsonb,
  branding jsonb NOT NULL DEFAULT '{
    "primary_color": "#16a34a",
    "secondary_color": "#000000",
    "text_color": "#ffffff",
    "font_family": "Inter",
    "logo_url": "",
    "company_name": "",
    "company_phone": "",
    "company_email": "",
    "button_radius": "8",
    "show_powered_by": true
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quoters_user_id ON quoters(user_id);
CREATE INDEX IF NOT EXISTS idx_quoters_slug ON quoters(slug);

ALTER TABLE quoters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quoters"
  ON quoters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quoters"
  ON quoters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quoters"
  ON quoters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quoters"
  ON quoters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read active quoters by slug"
  ON quoters FOR SELECT
  TO anon
  USING (status = 'active');