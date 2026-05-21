/*
  # Fix subscription_tier constraint: rename 'student' to 'basic'

  ## Problem
  The profiles table had a CHECK constraint allowing 'student' as a subscription tier,
  but all application code (Stripe webhook, frontend gating, edge functions) uses 'basic'.
  This caused a constraint violation whenever Stripe tried to upgrade a user — meaning
  zero paying customers could successfully convert.

  ## Changes
  1. profiles table
     - Drops old CHECK constraint (free | student | pro)
     - Adds new CHECK constraint (free | basic | pro)
     - Updates any existing rows with 'student' tier to 'basic'
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

UPDATE profiles SET subscription_tier = 'basic' WHERE subscription_tier = 'student';

ALTER TABLE profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'basic', 'pro'));
