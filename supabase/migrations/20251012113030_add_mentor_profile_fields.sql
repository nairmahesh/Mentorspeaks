/*
  # Add Mentor Profile Fields

  1. New Columns Added to `profiles` table:
    - `linkedin_url` (text) - LinkedIn profile URL (required for mentors)
    - `years_of_experience` (integer) - Total years of professional experience
    - `willing_to_mentor` (text array) - Types of mentees (students, entry_level, mid_level, senior_level, anyone)
    - `mentoring_rate_type` (text) - Type of mentoring rate (free, paid, both)
    - `free_hours_per_week` (integer) - Number of free hours per week (for free/both)
    - `hourly_rate` (numeric) - Hourly consulting rate in USD (for paid/both)

  2. Changes:
    - All new fields are nullable to support existing users
    - Added check constraint to ensure rate type is valid
    - Added check to ensure free_hours_per_week is positive when set
    - Added check to ensure hourly_rate is positive when set
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- LinkedIn URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text;
  END IF;

  -- Years of experience
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'years_of_experience'
  ) THEN
    ALTER TABLE profiles ADD COLUMN years_of_experience integer;
  END IF;

  -- Willing to mentor (array of mentee types)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'willing_to_mentor'
  ) THEN
    ALTER TABLE profiles ADD COLUMN willing_to_mentor text[] DEFAULT '{}';
  END IF;

  -- Mentoring rate type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'mentoring_rate_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN mentoring_rate_type text;
  END IF;

  -- Free hours per week
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'free_hours_per_week'
  ) THEN
    ALTER TABLE profiles ADD COLUMN free_hours_per_week integer;
  END IF;

  -- Hourly rate
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hourly_rate numeric(10, 2);
  END IF;
END $$;

-- Add constraints
DO $$
BEGIN
  -- Constraint for mentoring_rate_type
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_mentoring_rate_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_mentoring_rate_type_check
      CHECK (mentoring_rate_type IN ('free', 'paid', 'both'));
  END IF;

  -- Constraint for free_hours_per_week
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_free_hours_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_free_hours_check
      CHECK (free_hours_per_week IS NULL OR free_hours_per_week > 0);
  END IF;

  -- Constraint for hourly_rate
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_hourly_rate_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_hourly_rate_check
      CHECK (hourly_rate IS NULL OR hourly_rate > 0);
  END IF;
END $$;
