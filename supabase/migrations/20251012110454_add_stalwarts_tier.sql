/*
  # Add Stalwarts Tier for Elite Mentors

  1. Changes
    - Add `is_stalwart` boolean column to profiles table
    - Add `stalwart_designation` text column for special titles (e.g., "CXO", "Industry Leader", "Veteran Expert")
    - Add index for efficient querying of stalwarts
  
  2. Purpose
    - Create a special tier for elite mentors (CXOs, industry stalwarts)
    - Allow showcasing premium mentors in dedicated sections
    - Enable filtering and highlighting of top-tier mentors

  3. Security
    - Only admins should be able to set stalwart status
    - Public can read stalwart status for display purposes
*/

-- Add stalwart tier columns to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_stalwart'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_stalwart boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stalwart_designation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stalwart_designation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stalwart_order'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stalwart_order integer;
  END IF;
END $$;

-- Create index for efficient stalwart queries
CREATE INDEX IF NOT EXISTS idx_profiles_stalwarts ON profiles(is_stalwart, stalwart_order) WHERE is_stalwart = true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_stalwart IS 'Indicates if this mentor is part of the elite Stalwarts Corner';
COMMENT ON COLUMN profiles.stalwart_designation IS 'Special title for stalwarts (e.g., CXO, Industry Leader, Veteran Expert)';
COMMENT ON COLUMN profiles.stalwart_order IS 'Display order for stalwarts (lower numbers appear first)';
