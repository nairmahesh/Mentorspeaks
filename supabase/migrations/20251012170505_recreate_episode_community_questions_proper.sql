/*
  # Recreate Episode Community Q&A System

  1. Changes
    - Drop old episode_questions table
    - Create new episode_questions with proper schema
    - Create episode_question_upvotes table
    - Add RLS policies
    - Add upvote triggers

  2. Schema
    - episode_questions: community Q&A with answers
    - episode_question_upvotes: tracking user upvotes
*/

-- Drop old table and related objects
DROP TABLE IF EXISTS episode_questions CASCADE;
DROP TABLE IF EXISTS episode_question_upvotes CASCADE;

-- Create episode_questions table
CREATE TABLE episode_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  answer_text text,
  answered_at timestamptz,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create episode_question_upvotes table
CREATE TABLE episode_question_upvotes (
  question_id uuid REFERENCES episode_questions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (question_id, user_id)
);

-- Enable RLS
ALTER TABLE episode_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_question_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies for episode_questions
CREATE POLICY "Anyone can view episode questions"
  ON episode_questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can ask questions"
  ON episode_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON episode_questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guest can answer their episode questions"
  ON episode_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_episodes
      WHERE podcast_episodes.id = episode_questions.episode_id
      AND podcast_episodes.guest_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_episodes
      WHERE podcast_episodes.id = episode_questions.episode_id
      AND podcast_episodes.guest_id = auth.uid()
    )
  );

-- Policies for episode_question_upvotes
CREATE POLICY "Anyone can view upvotes"
  ON episode_question_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upvote"
  ON episode_question_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes"
  ON episode_question_upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to increment upvote count
CREATE OR REPLACE FUNCTION increment_episode_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE episode_questions
  SET upvotes = upvotes + 1
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement upvote count
CREATE OR REPLACE FUNCTION decrement_episode_question_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE episode_questions
  SET upvotes = upvotes - 1
  WHERE id = OLD.question_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for upvote counting
CREATE TRIGGER episode_question_upvote_added
  AFTER INSERT ON episode_question_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION increment_episode_question_upvotes();

CREATE TRIGGER episode_question_upvote_removed
  AFTER DELETE ON episode_question_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_episode_question_upvotes();

-- Create indexes
CREATE INDEX idx_episode_questions_episode_id ON episode_questions(episode_id);
CREATE INDEX idx_episode_questions_user_id ON episode_questions(user_id);
CREATE INDEX idx_episode_question_upvotes_question_id ON episode_question_upvotes(question_id);
