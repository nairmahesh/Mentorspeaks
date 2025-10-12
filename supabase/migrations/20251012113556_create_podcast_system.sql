/*
  # Create Podcast System

  1. New Tables:
    - `podcast_series`
      - `id` (uuid, primary key)
      - `title` (text) - Podcast series name
      - `description` (text) - Series description
      - `cover_image_url` (text) - Series cover image
      - `created_by` (uuid) - Admin/moderator who created it
      - `status` (text) - draft, active, archived
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `podcast_episodes`
      - `id` (uuid, primary key)
      - `series_id` (uuid) - Reference to podcast_series
      - `title` (text) - Episode title
      - `description` (text) - Episode description
      - `guest_id` (uuid) - Mentor being interviewed
      - `moderator_id` (uuid) - Moderator conducting interview
      - `episode_number` (integer) - Episode number in series
      - `recording_type` (text) - video, audio
      - `recording_url` (text) - Final recording URL
      - `thumbnail_url` (text) - Episode thumbnail
      - `duration_minutes` (integer) - Episode duration
      - `status` (text) - draft, scheduled, recording, completed, published
      - `scheduled_at` (timestamptz) - When to record/publish
      - `published_at` (timestamptz) - When published
      - `view_count` (integer) - Number of views
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `podcast_questions`
      - `id` (uuid, primary key)
      - `episode_id` (uuid) - Reference to podcast_episodes
      - `question_text` (text) - The question
      - `answer_text` (text) - Pre-filled answer for teleprompter
      - `question_order` (integer) - Order in episode
      - `is_ai_generated` (boolean) - Whether AI generated
      - `created_by` (uuid) - Who created the question
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `podcast_moderators`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to profiles
      - `is_admin` (boolean) - Can manage all podcasts
      - `bio` (text) - Moderator bio
      - `created_at` (timestamptz)

  2. Security:
    - Enable RLS on all tables
    - Moderators and admins can create/edit
    - Public can view published content
    - Guests can view their episodes

  3. Indexes:
    - Foreign key indexes for performance
    - Status indexes for filtering
*/

-- Create podcast_series table
CREATE TABLE IF NOT EXISTS podcast_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcast_episodes table
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES podcast_series(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  guest_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  moderator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  episode_number integer DEFAULT 1,
  recording_type text DEFAULT 'video' CHECK (recording_type IN ('video', 'audio')),
  recording_url text,
  thumbnail_url text,
  duration_minutes integer,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'recording', 'completed', 'published')),
  scheduled_at timestamptz,
  published_at timestamptz,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcast_questions table
CREATE TABLE IF NOT EXISTS podcast_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  answer_text text,
  question_order integer DEFAULT 1,
  is_ai_generated boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcast_moderators table
CREATE TABLE IF NOT EXISTS podcast_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  is_admin boolean DEFAULT false,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_series ON podcast_episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_guest ON podcast_episodes(guest_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_moderator ON podcast_episodes(moderator_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_status ON podcast_episodes(status);
CREATE INDEX IF NOT EXISTS idx_podcast_questions_episode ON podcast_questions(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_questions_order ON podcast_questions(episode_id, question_order);

-- Enable RLS
ALTER TABLE podcast_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_moderators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for podcast_series
CREATE POLICY "Public can view active series"
  ON podcast_series FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Moderators can view all series"
  ON podcast_series FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can create series"
  ON podcast_series FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can update series"
  ON podcast_series FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

-- RLS Policies for podcast_episodes
CREATE POLICY "Public can view published episodes"
  ON podcast_episodes FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Moderators can view all episodes"
  ON podcast_episodes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can view their episodes"
  ON podcast_episodes FOR SELECT
  TO authenticated
  USING (guest_id = auth.uid());

CREATE POLICY "Moderators can create episodes"
  ON podcast_episodes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can update episodes"
  ON podcast_episodes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

-- RLS Policies for podcast_questions
CREATE POLICY "Public can view questions for published episodes"
  ON podcast_questions FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM podcast_episodes
      WHERE podcast_episodes.id = podcast_questions.episode_id
      AND podcast_episodes.status = 'published'
    )
  );

CREATE POLICY "Moderators can view all questions"
  ON podcast_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can view questions for their episodes"
  ON podcast_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_episodes
      WHERE podcast_episodes.id = podcast_questions.episode_id
      AND podcast_episodes.guest_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can create questions"
  ON podcast_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can update questions"
  ON podcast_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can delete questions"
  ON podcast_questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

-- RLS Policies for podcast_moderators
CREATE POLICY "Public can view moderators"
  ON podcast_moderators FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage moderators"
  ON podcast_moderators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
      AND podcast_moderators.is_admin = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_podcast_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_podcast_series_updated_at') THEN
    CREATE TRIGGER update_podcast_series_updated_at
      BEFORE UPDATE ON podcast_series
      FOR EACH ROW
      EXECUTE FUNCTION update_podcast_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_podcast_episodes_updated_at') THEN
    CREATE TRIGGER update_podcast_episodes_updated_at
      BEFORE UPDATE ON podcast_episodes
      FOR EACH ROW
      EXECUTE FUNCTION update_podcast_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_podcast_questions_updated_at') THEN
    CREATE TRIGGER update_podcast_questions_updated_at
      BEFORE UPDATE ON podcast_questions
      FOR EACH ROW
      EXECUTE FUNCTION update_podcast_updated_at();
  END IF;
END $$;
