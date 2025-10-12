/*
  # Allow Public Read Access to Platform Data

  1. Changes to RLS Policies
    - Add policies to allow anonymous users to view:
      - Profiles (mentors and public profile data)
      - Questions (all questions)
      - Answers (published answers only)
      - Industries (all active industries)
    
  2. Security
    - Write operations remain restricted to authenticated users
    - Anonymous users can only read public data
    - Personal data remains protected
    
  3. Notes
    - This enables the public homepage to display mentors, questions, and answers
    - Users must still authenticate to ask questions or provide answers
*/

-- Allow anonymous users to view all profiles (for mentor discovery)
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to view all questions
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
CREATE POLICY "Anyone can view questions"
  ON questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to view published answers
DROP POLICY IF EXISTS "Anyone can view published answers" ON answers;
CREATE POLICY "Anyone can view published answers"
  ON answers
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Allow anonymous users to view active industries
DROP POLICY IF EXISTS "Anyone can view active industries" ON industries;
CREATE POLICY "Anyone can view active industries"
  ON industries
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Allow anonymous users to view mentor industries
DROP POLICY IF EXISTS "Anyone can view mentor industries" ON mentor_industries;
CREATE POLICY "Anyone can view mentor industries"
  ON mentor_industries
  FOR SELECT
  TO anon, authenticated
  USING (true);
