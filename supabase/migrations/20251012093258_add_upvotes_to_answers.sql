/*
  # Add Upvotes to Answers

  1. New Tables
    - `answer_upvotes` - Track which users upvoted which answers
      - `id` (uuid, primary key)
      - `answer_id` (uuid, references answers)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
    
  2. Changes
    - Add `upvote_count` column to answers table
    - Add unique constraint to prevent duplicate upvotes
    
  3. Security
    - Enable RLS on answer_upvotes
    - Allow authenticated users to upvote
    - Users can only insert/delete their own upvotes
    - Anyone can view upvote counts
*/

-- Add upvote_count to answers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'answers' AND column_name = 'upvote_count'
  ) THEN
    ALTER TABLE answers ADD COLUMN upvote_count integer DEFAULT 0;
  END IF;
END $$;

-- Create answer_upvotes table
CREATE TABLE IF NOT EXISTS answer_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- Enable RLS
ALTER TABLE answer_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can view upvotes
CREATE POLICY "Anyone can view upvotes"
  ON answer_upvotes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can insert their own upvotes
CREATE POLICY "Users can insert own upvotes"
  ON answer_upvotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvotes
CREATE POLICY "Users can delete own upvotes"
  ON answer_upvotes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to increment upvote count
CREATE OR REPLACE FUNCTION increment_answer_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE answers
  SET upvote_count = upvote_count + 1
  WHERE id = NEW.answer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement upvote count
CREATE OR REPLACE FUNCTION decrement_answer_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE answers
  SET upvote_count = upvote_count - 1
  WHERE id = OLD.answer_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_answer_upvote ON answer_upvotes;
CREATE TRIGGER on_answer_upvote
  AFTER INSERT ON answer_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION increment_answer_upvotes();

DROP TRIGGER IF EXISTS on_answer_upvote_removed ON answer_upvotes;
CREATE TRIGGER on_answer_upvote_removed
  AFTER DELETE ON answer_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_answer_upvotes();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_answer_id ON answer_upvotes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_upvotes_user_id ON answer_upvotes(user_id);
