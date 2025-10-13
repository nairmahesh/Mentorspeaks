/*
  # Add Multi-Guest Podcast Support

  ## Overview
  This migration adds support for multiple guests per podcast episode, allowing both:
  1. Single-session podcasts with multiple speakers (panel discussions)
  2. Multi-session podcasts (series with different guests per episode)

  ## Changes

  1. New Tables
    - `podcast_episode_guests`
      - `id` (uuid, primary key)
      - `episode_id` (uuid) - Reference to podcast_episodes
      - `guest_id` (uuid) - Reference to profiles (mentor)
      - `guest_order` (integer) - Order of appearance in episode
      - `is_primary_guest` (boolean) - Main guest indicator
      - `created_at` (timestamptz)

  2. Modifications
    - Keep `guest_id` in `podcast_episodes` for backward compatibility
    - Add helper function to get all guests for an episode
    - Add helper function to sync old guest_id to new table

  3. Security
    - Enable RLS on podcast_episode_guests
    - Public can view guests for published episodes
    - Moderators can manage guests
    - Guests can view their own episode participations

  4. Notes
    - The UI will show a clear option: "Single Guest" or "Multiple Guests"
    - For backward compatibility, single guest episodes use guest_id field
    - Multi-guest episodes use the podcast_episode_guests table
*/

-- Create podcast_episode_guests table
CREATE TABLE IF NOT EXISTS podcast_episode_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE NOT NULL,
  guest_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  guest_order integer DEFAULT 1,
  is_primary_guest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(episode_id, guest_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_podcast_episode_guests_episode ON podcast_episode_guests(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episode_guests_guest ON podcast_episode_guests(guest_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episode_guests_order ON podcast_episode_guests(episode_id, guest_order);

-- Enable RLS
ALTER TABLE podcast_episode_guests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for podcast_episode_guests
CREATE POLICY "Public can view guests for published episodes"
  ON podcast_episode_guests FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM podcast_episodes
      WHERE podcast_episodes.id = podcast_episode_guests.episode_id
      AND podcast_episodes.status = 'published'
    )
  );

CREATE POLICY "Moderators can view all episode guests"
  ON podcast_episode_guests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can view their episode participations"
  ON podcast_episode_guests FOR SELECT
  TO authenticated
  USING (guest_id = auth.uid());

CREATE POLICY "Moderators can add episode guests"
  ON podcast_episode_guests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can update episode guests"
  ON podcast_episode_guests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can delete episode guests"
  ON podcast_episode_guests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

-- Function to get all guests for an episode (includes both old and new system)
CREATE OR REPLACE FUNCTION get_episode_guests(episode_uuid uuid)
RETURNS TABLE (
  guest_id uuid,
  full_name text,
  professional_title text,
  avatar_url text,
  is_primary boolean,
  guest_order integer
) AS $$
BEGIN
  -- First check if there are entries in podcast_episode_guests
  IF EXISTS (SELECT 1 FROM podcast_episode_guests WHERE episode_id = episode_uuid) THEN
    -- Return from the new multi-guest table
    RETURN QUERY
    SELECT 
      p.id,
      p.full_name,
      p.professional_title,
      p.avatar_url,
      peg.is_primary_guest,
      peg.guest_order
    FROM podcast_episode_guests peg
    JOIN profiles p ON p.id = peg.guest_id
    WHERE peg.episode_id = episode_uuid
    ORDER BY peg.guest_order;
  ELSE
    -- Fallback to old single-guest system
    RETURN QUERY
    SELECT 
      p.id,
      p.full_name,
      p.professional_title,
      p.avatar_url,
      true as is_primary_guest,
      1 as guest_order
    FROM podcast_episodes pe
    JOIN profiles p ON p.id = pe.guest_id
    WHERE pe.id = episode_uuid
    AND pe.guest_id IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
