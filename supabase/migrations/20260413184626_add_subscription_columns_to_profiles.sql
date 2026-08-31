/*
  # Add Subscription Columns to Profiles

  1. Modified Tables
    - `profiles`
      - `stripe_customer_id` (text) - Stripe customer ID for this user
      - `stripe_subscription_id` (text) - Active Stripe subscription ID
      - `subscription_status` (text) - Current subscription status (e.g., active, trialing, past_due, canceled, incomplete)
      - `subscription_current_period_end` (timestamptz) - When the current billing period ends

  2. Important Notes
    - All columns have safe defaults
    - New users default to empty/null subscription status (treated as "no subscription")
    - No destructive operations on existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_id text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_current_period_end') THEN
    ALTER TABLE profiles ADD COLUMN subscription_current_period_end timestamptz;
  END IF;
END $$;