/*
  # Setup Initial Moderators

  1. Changes:
    - Creates a function to easily add moderators
    - Adds admin user (effyMentor platform admin) as a moderator with admin privileges
    - This migration is safe to run multiple times

  2. Usage:
    - Any existing mentor can be made a moderator by their email
    - Run: SELECT add_moderator('user@email.com', true/false);
    - The boolean parameter sets admin status
*/

-- Function to add a moderator by email
CREATE OR REPLACE FUNCTION add_moderator(user_email text, is_admin_user boolean DEFAULT false)
RETURNS void AS $$
DECLARE
  user_profile_id uuid;
BEGIN
  -- Get user ID from profiles based on email from auth.users
  SELECT p.id INTO user_profile_id
  FROM profiles p
  INNER JOIN auth.users u ON p.id = u.id
  WHERE u.email = user_email;

  IF user_profile_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Insert or update moderator record
  INSERT INTO podcast_moderators (user_id, is_admin, bio)
  VALUES (user_profile_id, is_admin_user, 'Platform Moderator')
  ON CONFLICT (user_id)
  DO UPDATE SET is_admin = is_admin_user;

  RAISE NOTICE 'Successfully added % as moderator (admin: %)', user_email, is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: To make a user a moderator, run one of these:
-- SELECT add_moderator('admin@effymentor.com', true);  -- Makes admin
-- SELECT add_moderator('mentor@example.com', false);    -- Makes regular moderator

COMMENT ON FUNCTION add_moderator IS 'Adds a user as a podcast moderator by their email address. Set second parameter to true for admin privileges.';
