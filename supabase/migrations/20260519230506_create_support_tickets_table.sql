/*
  # Create support tickets table

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `name` (text) - submitter's name
      - `email` (text) - submitter's email
      - `message` (text) - ticket content
      - `status` (text) - ticket status, defaults to 'new'
      - `created_at` (timestamptz) - when the ticket was submitted

  2. Security
    - Enable RLS on `support_tickets` table
    - Add INSERT policy for anonymous/public access (contact form)
    - No SELECT/UPDATE/DELETE policies for public users
*/

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a support ticket"
  ON support_tickets
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
