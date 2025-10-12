/*
  # Enable Multiple Mentor Answers for Community Q&A

  1. New Tables
    - `episode_question_answers` - stores multiple answers from different mentors
      - `id` (uuid, primary key)
      - `question_id` (uuid, references episode_questions)
      - `mentor_id` (uuid, references profiles)
      - `answer_text` (text)
      - `upvotes` (integer)
      - `created_at` (timestamptz)
    
    - `episode_answer_upvotes` - track upvotes on answers
      - `answer_id` (uuid, references episode_question_answers)
      - `user_id` (uuid, references profiles)
      - Primary key on (answer_id, user_id)

  2. Changes
    - Keep episode_questions.answer_text for backward compatibility (guest's primary answer)
    - Add new table for additional mentor answers
    - Update RLS to allow any mentor to answer

  3. Security
    - Enable RLS on new tables
    - Only mentors/ambassadors/admins can post answers
    - Anyone can read answers
    - Users can upvote answers
*/

-- Create episode_question_answers table for multiple mentor responses
CREATE TABLE IF NOT EXISTS episode_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES episode_questions(id) ON DELETE CASCADE NOT NULL,
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  answer_text text NOT NULL,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create episode_answer_upvotes table
CREATE TABLE IF NOT EXISTS episode_answer_upvotes (
  answer_id uuid REFERENCES episode_question_answers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (answer_id, user_id)
);

-- Enable RLS
ALTER TABLE episode_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_answer_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies for episode_question_answers
CREATE POLICY "Anyone can view answers"
  ON episode_question_answers FOR SELECT
  USING (true);

CREATE POLICY "Mentors can post answers"
  ON episode_question_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = mentor_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('mentor', 'ambassador', 'admin')
    )
  );

CREATE POLICY "Mentors can update own answers"
  ON episode_question_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own answers"
  ON episode_question_answers FOR DELETE
  TO authenticated
  USING (auth.uid() = mentor_id);

-- Policies for episode_answer_upvotes
CREATE POLICY "Anyone can view answer upvotes"
  ON episode_answer_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upvote answers"
  ON episode_answer_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their answer upvotes"
  ON episode_answer_upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to increment answer upvote count
CREATE OR REPLACE FUNCTION increment_episode_answer_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE episode_question_answers
  SET upvotes = upvotes + 1
  WHERE id = NEW.answer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement answer upvote count
CREATE OR REPLACE FUNCTION decrement_episode_answer_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE episode_question_answers
  SET upvotes = upvotes - 1
  WHERE id = OLD.answer_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for answer upvote counting
DROP TRIGGER IF EXISTS episode_answer_upvote_added ON episode_answer_upvotes;
CREATE TRIGGER episode_answer_upvote_added
  AFTER INSERT ON episode_answer_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION increment_episode_answer_upvotes();

DROP TRIGGER IF EXISTS episode_answer_upvote_removed ON episode_answer_upvotes;
CREATE TRIGGER episode_answer_upvote_removed
  AFTER DELETE ON episode_answer_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_episode_answer_upvotes();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_episode_question_answers_question_id ON episode_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_episode_question_answers_mentor_id ON episode_question_answers(mentor_id);
CREATE INDEX IF NOT EXISTS idx_episode_answer_upvotes_answer_id ON episode_answer_upvotes(answer_id);
