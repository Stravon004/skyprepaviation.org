/*
  # Enforce server-side subscription gating on questions

  ## Summary
  Replaces the open SELECT policy on `questions` with a restrictive policy that
  limits which certificates a user can access based on their profile subscription_tier.

  ## Changes

  ### questions table RLS
  - Drops the existing permissive SELECT policy (if any)
  - Adds a new policy that allows:
    - free users: PPL only
    - basic users: PPL and IFR
    - pro users: all certificates (PPL, IFR, CPL, ATP)
    - unauthenticated: no access

  ### flashcard_progress table RLS
  - Adds free-tier daily limit enforcement note (enforced at app layer;
    RLS cannot count rows per day efficiently, so we rely on app-layer enforcement
    for the 20/day flashcard limit — this migration only documents the intent)

  ## Security Notes
  - auth.uid() is used for all ownership checks
  - Policy uses a subquery join to profiles to read the user's tier
  - This prevents client-side bypass of cert gating
*/

-- Drop any existing open SELECT policy on questions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'questions' AND policyname = 'Questions are publicly readable'
  ) THEN
    DROP POLICY "Questions are publicly readable" ON questions;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'questions' AND policyname = 'Authenticated users can read questions'
  ) THEN
    DROP POLICY "Authenticated users can read questions" ON questions;
  END IF;
END $$;

-- New gated policy: authenticated users see certs allowed by their subscription
CREATE POLICY "Users can read questions allowed by their subscription tier"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    (
      certificate = 'PPL'
    ) OR (
      certificate IN ('PPL', 'IFR')
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.subscription_tier IN ('basic', 'pro')
      )
    ) OR (
      certificate IN ('PPL', 'IFR', 'CPL', 'ATP')
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.subscription_tier = 'pro'
      )
    )
  );
