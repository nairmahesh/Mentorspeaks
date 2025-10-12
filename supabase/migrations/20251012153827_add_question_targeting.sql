/*
  # Add Question Targeting Feature

  1. Changes
    - Add `targeted_mentor_ids` array field to questions table to allow directing questions to specific mentors
    - Remove paid question requirement (all questions are free)
    - Keep `is_paid` and `amount` fields for future consultancy features but default to free
    - Add index for efficient mentor targeting queries

  2. Notes
    - Questions can now be directed to:
      - All mentors (targeted_mentor_ids = NULL or empty array)
      - Specific mentor(s) (targeted_mentor_ids contains mentor UUIDs)
    - Paid options are reserved for 1-on-1 consultancy bookings, not questions
*/

-- Add targeted_mentor_ids column to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'targeted_mentor_ids'
  ) THEN
    ALTER TABLE questions ADD COLUMN targeted_mentor_ids uuid[] DEFAULT NULL;
  END IF;
END $$;

-- Create index for efficient mentor targeting queries
CREATE INDEX IF NOT EXISTS idx_questions_targeted_mentors 
  ON questions USING GIN (targeted_mentor_ids);

-- Update existing questions to have NULL targeted_mentor_ids (open to all mentors)
UPDATE questions SET targeted_mentor_ids = NULL WHERE targeted_mentor_ids IS NULL;

-- Add comment explaining the field
COMMENT ON COLUMN questions.targeted_mentor_ids IS 
  'Array of mentor user IDs this question is directed to. NULL or empty means question is open to all mentors.';
