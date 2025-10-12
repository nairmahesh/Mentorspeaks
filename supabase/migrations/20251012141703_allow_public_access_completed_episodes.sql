/*
  # Allow Public Access to Completed Episodes

  1. Changes
    - Update RLS policy to allow public read access to episodes with status 'completed' or 'published'
    - This allows sharing of completed episodes before they're officially published
    - Ensures podcast questions are also accessible for completed episodes

  2. Security
    - Maintains RLS protection
    - Only allows read access to completed/published episodes
    - Does not affect moderator or guest access policies
*/

-- Drop existing public read policies
DROP POLICY IF EXISTS "Public can view published episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Public can view questions for published episodes" ON podcast_questions;

-- Create new policies that allow access to completed OR published episodes
CREATE POLICY "Public can view completed and published episodes"
  ON podcast_episodes FOR SELECT
  TO public
  USING (status IN ('completed', 'published'));

CREATE POLICY "Public can view questions for completed and published episodes"
  ON podcast_questions FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM podcast_episodes
      WHERE podcast_episodes.id = podcast_questions.episode_id
      AND podcast_episodes.status IN ('completed', 'published')
    )
  );