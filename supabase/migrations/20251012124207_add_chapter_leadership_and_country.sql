/*
  # Add Chapter Leadership and Country-based Access

  1. Updates to profiles table
    - Add `country` field for region-based chapter access

  2. Updates to regional_chapters table
    - Add `allowed_countries` (jsonb array) - which countries can join
    
  3. New Tables
    - `chapter_leadership`
      - `id` (uuid, primary key)
      - `chapter_id` (uuid, references regional_chapters)
      - `user_id` (uuid, references profiles)
      - `role` (text) - 'chapter_lead', 'co_lead', 'community_manager', 'advisor'
      - `title` (text) - Custom title for display
      - `bio` (text) - Leadership bio specific to this chapter
      - `display_order` (integer) - Order in leadership list
      - `is_active` (boolean)
      - `appointed_at` (timestamptz)
      - `appointed_by` (uuid, references profiles)

    - `chapter_join_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `chapter_id` (uuid, references regional_chapters)
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `requested_at` (timestamptz)
      - `reviewed_at` (timestamptz, nullable)
      - `reviewed_by` (uuid, references profiles, nullable)
      - `review_notes` (text, nullable)

  4. Update chapter_memberships
    - Add `status` field - 'active', 'inactive'
    - Add `approved_by` field

  5. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Add country to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text;
  END IF;
END $$;

-- Add allowed_countries to regional_chapters
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'regional_chapters' AND column_name = 'allowed_countries'
  ) THEN
    ALTER TABLE regional_chapters ADD COLUMN allowed_countries jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update chapters with allowed countries
UPDATE regional_chapters SET allowed_countries = '["India", "Bangladesh", "Sri Lanka", "Nepal", "Pakistan", "Bhutan", "Maldives"]'::jsonb WHERE slug = 'india-mentorspeak';
UPDATE regional_chapters SET allowed_countries = '["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "Jordan", "Lebanon", "Egypt", "Turkey", "Israel"]'::jsonb WHERE slug = 'middle-east-mentorspeak';
UPDATE regional_chapters SET allowed_countries = '["Singapore", "Malaysia", "Indonesia", "Thailand", "Philippines", "Vietnam", "Myanmar", "Cambodia", "Laos", "Brunei", "Timor-Leste"]'::jsonb WHERE slug = 'women-leadership-sea';

-- Create chapter_leadership table
CREATE TABLE IF NOT EXISTS chapter_leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES regional_chapters(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('chapter_lead', 'co_lead', 'community_manager', 'advisor')),
  title text NOT NULL,
  bio text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  appointed_at timestamptz DEFAULT now(),
  appointed_by uuid REFERENCES profiles(id),
  UNIQUE(chapter_id, user_id)
);

-- Create chapter_join_requests table
CREATE TABLE IF NOT EXISTS chapter_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES regional_chapters(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  review_notes text,
  UNIQUE(user_id, chapter_id)
);

-- Update chapter_memberships with new fields
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chapter_memberships' AND column_name = 'status'
  ) THEN
    ALTER TABLE chapter_memberships ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chapter_memberships' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE chapter_memberships ADD COLUMN approved_by uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE chapter_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapter_leadership
CREATE POLICY "Anyone can view active chapter leadership"
  ON chapter_leadership
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Chapter admins can manage leadership"
  ON chapter_leadership
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
      AND (
        community_moderators.role = 'super_admin'
        OR (community_moderators.role = 'chapter_admin' AND community_moderators.chapter_id = chapter_leadership.chapter_id)
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
      AND (
        community_moderators.role = 'super_admin'
        OR (community_moderators.role = 'chapter_admin' AND community_moderators.chapter_id = chapter_leadership.chapter_id)
      )
    )
  );

-- RLS Policies for chapter_join_requests
CREATE POLICY "Users can view their own join requests"
  ON chapter_join_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create join requests"
  ON chapter_join_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Chapter leadership can view join requests"
  ON chapter_join_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chapter_leadership
      WHERE chapter_leadership.user_id = auth.uid()
      AND chapter_leadership.chapter_id = chapter_join_requests.chapter_id
      AND chapter_leadership.is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
    )
  );

CREATE POLICY "Chapter leadership can update join requests"
  ON chapter_join_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chapter_leadership
      WHERE chapter_leadership.user_id = auth.uid()
      AND chapter_leadership.chapter_id = chapter_join_requests.chapter_id
      AND chapter_leadership.is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chapter_leadership
      WHERE chapter_leadership.user_id = auth.uid()
      AND chapter_leadership.chapter_id = chapter_join_requests.chapter_id
      AND chapter_leadership.is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM community_moderators
      WHERE community_moderators.user_id = auth.uid()
      AND community_moderators.is_active = true
    )
  );
