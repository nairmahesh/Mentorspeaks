/*
  # Add increment question views function

  1. New Functions
    - `increment_question_views` - Safely increments view count for questions
  
  2. Purpose
    - Provides atomic increment operation for question view tracking
    - Prevents race conditions when multiple users view simultaneously
*/

CREATE OR REPLACE FUNCTION increment_question_views(question_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE questions
  SET view_count = view_count + 1
  WHERE id = question_id;
END;
$$;
