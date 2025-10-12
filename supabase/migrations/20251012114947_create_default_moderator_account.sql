/*
  # Create Default Moderator Account

  1. Changes:
    - Creates a default moderator account with email: moderator@effymentor.com
    - Password: 123456
    - Sets up as admin moderator
    - This is safe to run multiple times (idempotent)

  2. Security Note:
    - This is a development/demo account
    - Change password in production immediately
*/

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'moderator@effymentor.com';

  -- Only create if doesn't exist
  IF new_user_id IS NULL THEN
    -- Create user in auth.users (Supabase handles password hashing)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'moderator@effymentor.com',
      crypt('123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO new_user_id;

    -- Create profile for the moderator
    INSERT INTO profiles (id, full_name, role, bio)
    VALUES (
      new_user_id,
      'effyMentor Admin',
      'mentor',
      'Platform Administrator and Podcast Moderator'
    );

    -- Make them a podcast moderator with admin privileges
    INSERT INTO podcast_moderators (user_id, is_admin, bio)
    VALUES (
      new_user_id,
      true,
      'Platform administrator with full moderator privileges. Can create and manage all podcasts and assign moderator roles.'
    );

    RAISE NOTICE 'Successfully created moderator account: moderator@effymentor.com';
  ELSE
    RAISE NOTICE 'Moderator account already exists: moderator@effymentor.com';
  END IF;
END $$;
