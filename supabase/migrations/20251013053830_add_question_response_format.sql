/*
  # Add Response Format to Questions

  1. New Column
    - `response_format` (text) - Indicates how the user wants their question answered:
      - 'qa' (default) - Traditional text-based Q&A format
      - 'podcast' - Answer delivered as a podcast episode
  
  2. Changes
    - Add response_format column to questions table with default 'qa'
    - Allow mentors to see which format the user prefers
    - This enables the platform to route questions appropriately
  
  3. Notes
    - Default is 'qa' for backward compatibility
    - Podcast responses will be created through the podcast system
    - Mentors can choose to answer in the requested format or not
*/

-- Add response_format column to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'response_format'
  ) THEN
    ALTER TABLE questions ADD COLUMN response_format text DEFAULT 'qa' NOT NULL;
    
    -- Add a check constraint to ensure valid values
    ALTER TABLE questions ADD CONSTRAINT questions_response_format_check 
      CHECK (response_format IN ('qa', 'podcast'));
  END IF;
END $$;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_response_format ON questions(response_format);
