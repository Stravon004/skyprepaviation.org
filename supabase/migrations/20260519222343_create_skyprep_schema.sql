/*
  # SkyPrep Aviation Platform — Initial Schema

  ## Summary
  Creates the core data model for the SkyPrep aviation training platform.

  ## New Tables

  1. `profiles` — User profiles with subscription info
     - id (uuid, FK to auth.users)
     - email, full_name
     - subscription_tier: free | student | pro
     - subscription_expires_at (nullable)

  2. `questions` — FAA knowledge test question bank
     - certificate: PPL | IFR | CPL | ATP
     - category, subcategory for topic grouping
     - options (jsonb array of answer choices)
     - correct_answer (0-indexed integer)
     - explanation (text)

  3. `exam_sessions` — Completed practice exam records
     - Links user to questions answered, score, time taken
     - question_results (jsonb): array of {questionId, selectedAnswer, correct}

  4. `flashcard_progress` — Spaced repetition state per user per question
     - SM-2 algorithm fields: ease_factor, interval_days, repetitions
     - next_review_at for scheduling

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own data
  - Questions table is readable by all authenticated users (read-only)

  ## Notes
  - Questions are seeded with sample data (PPL category)
  - Profiles are created automatically on signup via AuthContext
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'student', 'pro')),
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate text NOT NULL CHECK (certificate IN ('PPL', 'IFR', 'CPL', 'ATP')),
  category text NOT NULL,
  subcategory text,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_certificate ON questions(certificate);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Exam sessions
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate text NOT NULL,
  total_questions integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  time_taken_seconds integer,
  question_results jsonb NOT NULL DEFAULT '[]',
  completed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);

ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exam sessions"
  ON exam_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam sessions"
  ON exam_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Flashcard progress
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  ease_factor numeric NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 1,
  repetitions integer NOT NULL DEFAULT 0,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review ON flashcard_progress(user_id, next_review_at);

ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcard progress"
  ON flashcard_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcard progress"
  ON flashcard_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcard progress"
  ON flashcard_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seed sample questions (PPL)
INSERT INTO questions (certificate, category, subcategory, question, options, correct_answer, explanation) VALUES
('PPL', 'Regulations', 'Currency', 'To act as pilot in command of an aircraft carrying passengers, a pilot must have made at least 3 takeoffs and 3 landings within the preceding', '["30 days", "60 days", "90 days"]', 0, 'FAR 61.57(a) requires 3 takeoffs and 3 landings within the preceding 90 days to carry passengers. However, for night currency (1 hour after sunset to 1 hour before sunrise), the same 3 takeoffs and 3 landings requirement applies but must be done at night.'),
('PPL', 'Regulations', 'Currency', 'No person may act as pilot in command of an aircraft unless that person has made at least 3 takeoffs and 3 landings to a full stop in the preceding 90 days when that aircraft has', '["A tailwheel", "Retractable gear", "More than 200 hp"]', 0, 'FAR 61.57(d) requires that tailwheel currency be achieved through 3 full-stop landings in a tailwheel aircraft in the preceding 90 days.'),
('PPL', 'Weather', 'VFR Minimums', 'What are the VFR weather minimums for Class G airspace below 1,200 feet AGL during the day?', '["1 mile visibility and clear of clouds", "3 miles visibility and 500-1000-2000 cloud clearances", "1 mile visibility and 500 feet below clouds"]', 0, 'In Class G airspace below 1,200 AGL during the day, VFR minimums are 1 statute mile visibility and clear of clouds (FAR 91.155).'),
('PPL', 'Weather', 'VFR Minimums', 'What are the VFR weather minimums in Class B airspace?', '["3 statute miles and clear of clouds", "3 statute miles and 500-1000-2000 cloud clearances", "5 statute miles and 1000-1000-3000 cloud clearances"]', 0, 'Class B airspace VFR minimums are 3 statute miles visibility and clear of clouds (FAR 91.155).'),
('PPL', 'Aerodynamics', 'Lift and Drag', 'What is the result of a stall?', '["The wing exceeds its critical angle of attack", "The engine stops producing power", "Airspeed drops below Vs"]', 0, 'A stall occurs when the wing exceeds its critical angle of attack (typically around 16-18 degrees), causing airflow separation over the upper wing surface and a sudden loss of lift.'),
('PPL', 'Aerodynamics', 'Stability', 'Longitudinal stability in an aircraft is provided primarily by the', '["Horizontal stabilizer", "Vertical stabilizer", "Ailerons"]', 0, 'Longitudinal (pitch) stability is primarily provided by the horizontal stabilizer. When the nose pitches up, the stabilizer generates a downward force to return the aircraft to equilibrium.'),
('PPL', 'Navigation', 'Charts', 'What does a magenta dashed line on a sectional chart indicate?', '["Class E airspace beginning at 700 AGL", "Class D airspace boundary", "Military operations area"]', 0, 'A magenta dashed line on a VFR sectional chart indicates the boundary of Class E airspace that begins at 700 feet AGL (used as a transition area around airports).'),
('PPL', 'Navigation', 'Charts', 'On a VFR sectional chart, what color is used to depict Class B airspace?', '["Solid blue lines", "Solid magenta lines", "Solid blue lines with a blue ceiling/floor note"]', 0, 'Class B airspace is depicted on VFR sectional charts with solid blue lines. The airspace limits (floor and ceiling) are printed in blue near the boundary lines.'),
('PPL', 'Systems', 'Electrical', 'If the aircraft''s ammeter shows a discharge, the pilot should', '["Reduce electrical load and land as soon as practical", "Turn off the master switch", "Switch to the backup alternator"]', 0, 'A discharging ammeter indicates the alternator is not supplying power and the battery is being drained. The correct action is to reduce electrical load to extend battery life and land as soon as practical.'),
('PPL', 'Systems', 'Fuel', 'At what fuel quantity should a pilot consider making a precautionary landing?', '["When fuel quantity drops to final reserve (30 minutes VFR)", "When the low fuel light illuminates", "When less than 1/4 tank remains"]', 0, 'FAR 91.151 requires VFR flights to carry enough fuel to reach the destination plus 30 minutes at normal cruise speed during the day (45 minutes at night). A precautionary landing should be considered when approaching these minimums.'),
('PPL', 'Weather', 'Thunderstorms', 'What is the recommended action when encountering inadvertent VFR flight into IMC?', '["Execute a 180-degree turn and exit the IMC", "Climb above the clouds", "Descend below the clouds"]', 0, 'The recommended action is to execute a 180-degree turn to exit the IMC conditions using instrument references. Continuing into IMC as a VFR-only pilot is extremely dangerous and leads to spatial disorientation.'),
('PPL', 'Regulations', 'Airspace', 'What is the maximum speed allowed below 10,000 feet MSL?', '["250 knots indicated airspeed", "200 knots indicated airspeed", "300 knots indicated airspeed"]', 0, 'FAR 91.117 establishes a maximum speed of 250 KIAS below 10,000 feet MSL. There is also a 200 KIAS limit within 4 nm of the primary airport in Class C or D airspace below 2,500 AGL.'),
('IFR', 'Procedures', 'Holds', 'When entering a holding pattern and the aircraft is in the parallel entry sector, the pilot should', '["Fly parallel to the holding course outbound on the non-holding side, then turn to intercept", "Turn to the holding fix immediately", "Fly direct entry regardless of position"]', 0, 'A parallel entry is used when the aircraft is in the parallel entry sector. The aircraft flies parallel to the holding course outbound on the non-holding side for one minute, then turns to intercept the inbound course.'),
('IFR', 'Regulations', 'Alternate', 'What weather minimums are required for an airport to be listed as an alternate when the airport has a precision approach?', '["600-2 at the ETA", "800-2 at the ETA", "1000-3 at the ETA"]', 0, 'For airports with precision approaches, the alternate minimums are 600 feet ceiling and 2 miles visibility at the ETA (FAR 91.169). For non-precision approaches, it is 800-2.'),
('IFR', 'Weather', 'Icing', 'Structural icing is most likely to occur when flying through', '["Visible moisture with temperatures between +2°C and -20°C", "Cirrus clouds above 25,000 feet", "Clear air with below-freezing temperatures"]', 0, 'Structural icing occurs when supercooled liquid water droplets (found in visible moisture like clouds, rain, or freezing drizzle) strike an aircraft surface. The highest risk is between +2°C and -20°C.'),
('CPL', 'Regulations', 'Commercial Privileges', 'A commercial pilot certificate allows the holder to', '["Act as PIC of an aircraft for compensation or hire", "Fly any aircraft regardless of endorsements", "Carry passengers on international flights without restrictions"]', 0, 'A commercial pilot certificate authorizes the holder to act as pilot in command of an aircraft for compensation or hire (FAR 61.133), subject to applicable endorsements and ratings.'),
('ATP', 'Regulations', 'Part 121', 'Under Part 121 operations, the minimum rest period for flight crew members between duty periods is', '["10 consecutive hours", "8 consecutive hours", "9 consecutive hours"]', 0, 'Under FAR Part 121 (current rest rules), flight crew members must receive a minimum of 10 consecutive hours rest between duty periods, providing an 8-hour sleep opportunity free from all duties.');
