/*
  # Add Settings Columns to Profiles

  1. Modified Tables
    - `profiles`
      - `logo_url` (text) - URL of uploaded company logo
      - `website` (text) - Company website URL
      - `address` (text) - Street address
      - `city` (text) - City
      - `state` (text) - State/Province
      - `zip` (text) - ZIP/Postal code
      - `timezone` (text) - User's preferred timezone
      - `default_industry` (text) - Default industry for new quoters
      - `notification_email` (text) - Email for notifications (may differ from login email)
      - `email_notifications` (boolean) - Whether to receive email notifications
      - `sms_notifications` (boolean) - Whether to receive SMS notifications
      - `theme_mode` (text) - UI theme preference (dark/light/system)
      - `accent_color` (text) - Custom accent color hex
      - `dashboard_layout` (text) - Dashboard layout preference (grid/list)

  2. Important Notes
    - All columns have safe defaults
    - No destructive operations
    - Existing profiles are not affected
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'logo_url') THEN
    ALTER TABLE profiles ADD COLUMN logo_url text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE profiles ADD COLUMN website text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
    ALTER TABLE profiles ADD COLUMN address text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE profiles ADD COLUMN city text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'state') THEN
    ALTER TABLE profiles ADD COLUMN state text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'zip') THEN
    ALTER TABLE profiles ADD COLUMN zip text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
    ALTER TABLE profiles ADD COLUMN timezone text NOT NULL DEFAULT 'America/New_York';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'default_industry') THEN
    ALTER TABLE profiles ADD COLUMN default_industry text NOT NULL DEFAULT 'gutters';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notification_email') THEN
    ALTER TABLE profiles ADD COLUMN notification_email text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_notifications') THEN
    ALTER TABLE profiles ADD COLUMN email_notifications boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'sms_notifications') THEN
    ALTER TABLE profiles ADD COLUMN sms_notifications boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'theme_mode') THEN
    ALTER TABLE profiles ADD COLUMN theme_mode text NOT NULL DEFAULT 'dark';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'accent_color') THEN
    ALTER TABLE profiles ADD COLUMN accent_color text NOT NULL DEFAULT '#22c55e';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dashboard_layout') THEN
    ALTER TABLE profiles ADD COLUMN dashboard_layout text NOT NULL DEFAULT 'grid';
  END IF;
END $$;