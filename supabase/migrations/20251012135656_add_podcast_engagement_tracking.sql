/*
  # Add Podcast Engagement Tracking

  1. New Tables
    - `podcast_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `episode_id` (uuid, references podcast_episodes)
      - `created_at` (timestamptz)
    - `podcast_shares`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, nullable for anonymous shares)
      - `episode_id` (uuid, references podcast_episodes)
      - `share_platform` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own likes
    - Add policies for anyone to create shares (tracking)
    - Add policies to read like counts and share counts

  3. Indexes
    - Add composite unique index on podcast_likes (user_id, episode_id)
    - Add indexes for efficient querying
*/

-- Create podcast_likes table
CREATE TABLE IF NOT EXISTS podcast_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, episode_id)
);

-- Create podcast_shares table
CREATE TABLE IF NOT EXISTS podcast_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE NOT NULL,
  share_platform text DEFAULT 'direct' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_podcast_likes_episode ON podcast_likes(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_likes_user ON podcast_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_shares_episode ON podcast_shares(episode_id);

-- Enable RLS
ALTER TABLE podcast_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_shares ENABLE ROW LEVEL SECURITY;

-- Policies for podcast_likes
CREATE POLICY "Users can view all likes"
  ON podcast_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON podcast_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON podcast_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for podcast_shares
CREATE POLICY "Anyone can view share counts"
  ON podcast_shares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can record shares"
  ON podcast_shares FOR INSERT
  TO authenticated
  WITH CHECK (true);
