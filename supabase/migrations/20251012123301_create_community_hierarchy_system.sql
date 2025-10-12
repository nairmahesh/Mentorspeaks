/*
  # Create Community Hierarchy and Management System

  1. New Tables
    - `regional_chapters`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., "India MentorSpeak"
      - `slug` (text, unique) - e.g., "india-mentorspeak"
      - `region` (text) - e.g., "India", "Middle East", "SEA"
      - `description` (text)
      - `cover_image_url` (text)
      - `status` (text) - 'active', 'inactive'
      - `created_at` (timestamptz)

    - `community_moderators`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `chapter_id` (uuid, references regional_chapters, nullable)
      - `role` (text) - 'super_admin', 'chapter_admin', 'community_moderator'
      - `permissions` (jsonb) - flexible permissions object
      - `is_active` (boolean)
      - `assigned_by` (uuid, references profiles)
      - `created_at` (timestamptz)

    - `mentor_verification_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `chapter_id` (uuid, references regional_chapters, nullable)
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `requested_at` (timestamptz)
      - `reviewed_at` (timestamptz, nullable)
      - `reviewed_by` (uuid, references profiles, nullable)
      - `review_notes` (text, nullable)
      - `documents` (jsonb) - proof of expertise

    - `moderation_actions`
      - `id` (uuid, primary key)
      - `moderator_id` (uuid, references profiles)
      - `action_type` (text) - 'block_user', 'delete_comment', 'blacklist_user', 'approve_mentor', 'reject_mentor'
      - `target_type` (text) - 'user', 'comment', 'question', 'answer'
      - `target_id` (uuid)
      - `reason` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)

    - `chapter_memberships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `chapter_id` (uuid, references regional_chapters)
      - `joined_at` (timestamptz)

  2. Updates to profiles table
    - Add `verification_status` (text) - 'unverified', 'pending', 'verified'
    - Add `is_blocked` (boolean)
    - Add `is_blacklisted` (boolean)
    - Add `verified_at` (timestamptz)
    - Add `verified_by` (uuid)

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each role
*/

-- Create regional_chapters table
CREATE TABLE IF NOT EXISTS regional_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  region text NOT NULL,
  description text,
  cover_image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- Create community_moderators table
CREATE TABLE IF NOT EXISTS community_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES regional_chapters(id) ON DELETE SET NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'chapter_admin', 'community_moderator')),
  permissions jsonb DEFAULT '{"can_verify_mentors": false, "can_moderate_content": false, "can_create_podcasts": false, "can_assign_moderators": false}'::jsonb,
  is_active boolean DEFAULT true,
  assigned_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Create mentor_verification_requests table
CREATE TABLE IF NOT EXISTS mentor_verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES regional_chapters(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  review_notes text,
  documents jsonb DEFAULT '{}'::jsonb
);

-- Create moderation_actions table
CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('block_user', 'unblock_user', 'delete_comment', 'blacklist_user', 'unblacklist_user', 'approve_mentor', 'reject_mentor', 'delete_question', 'delete_answer')),
  target_type text NOT NULL CHECK (target_type IN ('user', 'comment', 'question', 'answer')),
  target_id uuid NOT NULL,
  reason text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create chapter_memberships table
CREATE TABLE IF NOT EXISTS chapter_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES regional_chapters(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Update profiles table with new fields
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_blocked'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_blocked boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_blacklisted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_blacklisted boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verified_by'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verified_by uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE regional_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for regional_chapters
CREATE POLICY "Anyone can view active chapters"
  ON regional_chapters
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Moderators can manage chapters"
  ON regional_chapters
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
      AND community_moderators.role IN ('super_admin', 'chapter_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
      AND community_moderators.role IN ('super_admin', 'chapter_admin')
    )
  );

-- RLS Policies for community_moderators
CREATE POLICY "Users can view their own moderator status"
  ON community_moderators
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all moderators"
  ON community_moderators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_moderators cm
      WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND cm.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_moderators cm
      WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
      AND cm.role = 'super_admin'
    )
  );

-- RLS Policies for mentor_verification_requests
CREATE POLICY "Users can view their own verification requests"
  ON mentor_verification_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create verification requests"
  ON mentor_verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Moderators can view all verification requests"
  ON mentor_verification_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
      AND (community_moderators.permissions->>'can_verify_mentors')::boolean = true
    )
  );

CREATE POLICY "Moderators can update verification requests"
  ON mentor_verification_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
      AND (community_moderators.permissions->>'can_verify_mentors')::boolean = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
      AND (community_moderators.permissions->>'can_verify_mentors')::boolean = true
    )
  );

-- RLS Policies for moderation_actions
CREATE POLICY "Moderators can view moderation actions"
  ON moderation_actions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
    )
  );

CREATE POLICY "Moderators can create moderation actions"
  ON moderation_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    moderator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
    )
  );

-- RLS Policies for chapter_memberships
CREATE POLICY "Users can view their own memberships"
  ON chapter_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join chapters"
  ON chapter_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Moderators can view all memberships"
  ON chapter_memberships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
    )
  );
