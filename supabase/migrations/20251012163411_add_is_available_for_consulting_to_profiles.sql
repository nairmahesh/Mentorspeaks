/*
  # Add consultation availability to profiles

  1. Changes
    - Add `is_available_for_consulting` column to profiles table
    - Default to false for existing users
    - Allows mentors to indicate if they're available for paid consultations

  2. Notes
    - This column is used to show consultation booking options on episode pages
    - Only mentors with this flag enabled will show consultation CTAs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_available_for_consulting'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_available_for_consulting boolean DEFAULT false;
  END IF;
END $$;
