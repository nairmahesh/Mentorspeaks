/*
  # Create Mentor Test Account

  Creates a test mentor account with credentials:
  - Email: mentor@effymentor.com
  - Password: 123456
  - Role: mentor
*/

-- Create auth user (Supabase handles password hashing)
-- Note: In production, use Supabase's signup API. This is for development.
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'mentor@effymentor.com',
    crypt('123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO profiles (
    id,
    full_name,
    role,
    professional_title,
    bio,
    avatar_url,
    is_available_for_consulting,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Test Mentor',
    'mentor',
    'Senior Technology Mentor',
    'Experienced mentor helping professionals grow their careers and build their personal brands.',
    null,
    true,
    now(),
    now()
  );

END $$;
