/*
  # Add Mentor Statistics and Rating System

  1. New Columns in profiles table
    - `rating` (numeric) - Average mentor rating (0-5)
    - `total_reviews` (integer) - Number of reviews received
    - `total_answers` (integer) - Total answers provided
    - `total_videos` (integer) - Total video answers provided
    
  2. Changes
    - Add computed columns for better mentor discovery
    - Default values set appropriately
    
  3. Notes
    - These will be calculated and updated via application logic or triggers
    - Rating system allows for future review functionality
*/

-- Add rating and statistics columns to profiles table
DO $$
BEGIN
  -- Add rating column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'rating'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rating NUMERIC(3,2) DEFAULT 0;
  END IF;

  -- Add total_reviews column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_reviews'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;

  -- Add total_answers column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_answers'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_answers INTEGER DEFAULT 0;
  END IF;

  -- Add total_videos column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_videos'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_videos INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to update mentor statistics
CREATE OR REPLACE FUNCTION update_mentor_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_answers for the mentor
  UPDATE profiles
  SET 
    total_answers = (
      SELECT COUNT(*) 
      FROM answers 
      WHERE mentor_id = NEW.mentor_id AND status = 'published'
    ),
    total_videos = (
      SELECT COUNT(*) 
      FROM answers 
      WHERE mentor_id = NEW.mentor_id 
        AND status = 'published' 
        AND content_type = 'video'
    )
  WHERE id = NEW.mentor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update mentor stats when answers are created/updated
DROP TRIGGER IF EXISTS trigger_update_mentor_stats ON answers;
CREATE TRIGGER trigger_update_mentor_stats
  AFTER INSERT OR UPDATE OF status
  ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_stats();
