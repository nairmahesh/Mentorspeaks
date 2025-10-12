/*
  # Create Personalized Feed System

  ## Overview
  This migration creates a comprehensive personalized feed system that tracks user interests,
  activities, and provides smart recommendations based on behavior.

  ## New Tables Created

  ### 1. `user_interests`
  Tracks industries, topics, and mentor types that users are interested in
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `industry_id` (uuid, references industries, nullable)
  - `interest_type` (text: 'industry', 'mentor', 'topic')
  - `interest_value` (text: stores mentor IDs, topic names, etc.)
  - `created_at` (timestamp)

  ### 2. `user_activity_log`
  Tracks all user actions for behavioral analysis and recommendations
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `activity_type` (text: 'view_question', 'view_answer', 'ask_question', 'upvote', 'mentor_view', 'chapter_join', etc.)
  - `entity_type` (text: 'question', 'answer', 'mentor', 'chapter', etc.)
  - `entity_id` (uuid)
  - `metadata` (jsonb: additional context)
  - `created_at` (timestamp)

  ### 3. `user_feed_preferences`
  Stores user preferences for their feed experience
  - `user_id` (uuid, primary key, references profiles)
  - `show_recommended_mentors` (boolean, default true)
  - `show_trending_questions` (boolean, default true)
  - `show_chapter_updates` (boolean, default true)
  - `feed_order` (text: 'recent', 'personalized', 'trending', default 'personalized')
  - `onboarding_completed` (boolean, default false)
  - `updated_at` (timestamp)

  ## Security
  - RLS enabled on all tables
  - Users can only read/write their own data
  - Activity logs are write-only for users, read for system
*/

-- Create user_interests table
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  industry_id uuid REFERENCES industries(id) ON DELETE CASCADE,
  interest_type text NOT NULL CHECK (interest_type IN ('industry', 'mentor', 'topic', 'chapter')),
  interest_value text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_industry_id ON user_interests(industry_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_type ON user_interests(interest_type);

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_entity ON user_activity_log(entity_type, entity_id);

-- Create user_feed_preferences table
CREATE TABLE IF NOT EXISTS user_feed_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  show_recommended_mentors boolean DEFAULT true,
  show_trending_questions boolean DEFAULT true,
  show_chapter_updates boolean DEFAULT true,
  feed_order text DEFAULT 'personalized' CHECK (feed_order IN ('recent', 'personalized', 'trending')),
  onboarding_completed boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feed_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interests
CREATE POLICY "Users can view own interests"
  ON user_interests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interests"
  ON user_interests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON user_interests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view own activity"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON user_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_feed_preferences
CREATE POLICY "Users can view own preferences"
  ON user_feed_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_feed_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_feed_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to log activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, activity_type, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_activity_type, p_entity_type, p_entity_id, p_metadata);
END;
$$;

-- Create function to get personalized recommendations
CREATE OR REPLACE FUNCTION get_recommended_mentors(p_user_id uuid, p_limit int DEFAULT 10)
RETURNS TABLE(
  mentor_id uuid,
  relevance_score int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_interested_industries AS (
    SELECT DISTINCT industry_id
    FROM user_interests
    WHERE user_id = p_user_id AND interest_type = 'industry' AND industry_id IS NOT NULL
  ),
  user_viewed_mentors AS (
    SELECT DISTINCT entity_id as mentor_id
    FROM user_activity_log
    WHERE user_id = p_user_id 
      AND activity_type = 'mentor_view'
      AND created_at > now() - interval '30 days'
  )
  SELECT 
    p.id as mentor_id,
    (
      CASE WHEN p.is_stalwart THEN 50 ELSE 0 END +
      CASE WHEN EXISTS (
        SELECT 1 FROM user_interested_industries uii 
        WHERE uii.industry_id = ANY(
          SELECT DISTINCT i.id 
          FROM industries i 
          WHERE i.id = p.industry_id
        )
      ) THEN 100 ELSE 0 END +
      p.total_answers * 2
    )::int as relevance_score
  FROM profiles p
  WHERE p.role = 'mentor'
    AND p.id NOT IN (SELECT mentor_id FROM user_viewed_mentors)
  ORDER BY relevance_score DESC, p.total_answers DESC
  LIMIT p_limit;
END;
$$;

-- Create function to initialize user preferences
CREATE OR REPLACE FUNCTION initialize_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_feed_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to initialize preferences for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_preferences ON profiles;
CREATE TRIGGER trigger_initialize_user_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_preferences();
