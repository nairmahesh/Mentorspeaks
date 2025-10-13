/*
  # Mentor Social Media Management System

  1. New Tables
    - `social_media_accounts`
      - Links mentor profiles to their social media accounts
      - Stores platform type (LinkedIn, Twitter, etc.) and credentials
      - Tracks connection status and last sync time
    
    - `social_media_posts`
      - Stores all social media posts (drafts, scheduled, published)
      - Content, platform, media attachments
      - Scheduling information
      - Publication status tracking
    
    - `post_engagement_metrics`
      - Tracks engagement data for published posts
      - Views, likes, comments, shares, clicks
      - Updated periodically via API sync
    
    - `content_calendar`
      - Planning view for content strategy
      - Links to posts or can be standalone planning items
      - Campaign tracking
    
    - `mentor_analytics`
      - Aggregated analytics for mentor profiles
      - Profile views, search appearances, follower growth
      - Time-series data for trending
    
    - `mentee_relationships`
      - CRM for tracking mentee interactions
      - Notes, follow-up reminders, relationship scoring
      - Communication history

  2. Security
    - Enable RLS on all tables
    - Mentors can only access their own data
    - Encrypted storage for sensitive credentials
*/

-- Social Media Accounts
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'facebook')),
  account_name text NOT NULL,
  account_url text,
  is_connected boolean DEFAULT false,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  last_synced_at timestamptz,
  connection_status text DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'expired', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, platform)
);

-- Social Media Posts
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'facebook', 'multi')),
  post_type text DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'article', 'poll')),
  media_urls text[],
  hashtags text[],
  mentions text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
  scheduled_for timestamptz,
  published_at timestamptz,
  external_post_id text,
  external_post_url text,
  campaign_tag text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post Engagement Metrics
CREATE TABLE IF NOT EXISTS post_engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES social_media_posts(id) ON DELETE CASCADE NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  views_count int DEFAULT 0,
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares_count int DEFAULT 0,
  clicks_count int DEFAULT 0,
  engagement_rate decimal(5,2),
  reach_count int DEFAULT 0,
  impressions_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Content Calendar
CREATE TABLE IF NOT EXISTS content_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES social_media_posts(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  scheduled_date date NOT NULL,
  scheduled_time time,
  platform text CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'facebook', 'multi')),
  campaign_tag text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  color_tag text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mentor Analytics (Time-series data)
CREATE TABLE IF NOT EXISTS mentor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  profile_views int DEFAULT 0,
  search_appearances int DEFAULT 0,
  follower_count int DEFAULT 0,
  connection_requests int DEFAULT 0,
  profile_clicks int DEFAULT 0,
  total_engagements int DEFAULT 0,
  posts_published int DEFAULT 0,
  avg_engagement_rate decimal(5,2),
  top_performing_post_id uuid REFERENCES social_media_posts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, date)
);

-- Mentee Relationships (CRM)
CREATE TABLE IF NOT EXISTS mentee_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_name text,
  mentee_email text,
  mentee_company text,
  mentee_title text,
  relationship_stage text DEFAULT 'prospect' CHECK (relationship_stage IN ('prospect', 'active', 'alumni', 'inactive')),
  first_contact_date date,
  last_contact_date date,
  next_followup_date date,
  relationship_score int DEFAULT 0 CHECK (relationship_score >= 0 AND relationship_score <= 100),
  total_sessions int DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,
  notes text,
  tags text[],
  custom_fields jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Relationship Interactions Log
CREATE TABLE IF NOT EXISTS relationship_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id uuid REFERENCES mentee_relationships(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('call', 'email', 'meeting', 'message', 'session', 'note')),
  interaction_date timestamptz DEFAULT now(),
  subject text,
  notes text,
  duration_minutes int,
  outcome text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_mentor_status ON social_media_posts(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_media_posts(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_social_posts_published ON social_media_posts(published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_calendar_mentor_date ON content_calendar(mentor_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_analytics_mentor_date ON mentor_analytics(mentor_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_relationships_mentor ON mentee_relationships(mentor_id, relationship_stage);
CREATE INDEX IF NOT EXISTS idx_relationships_followup ON mentee_relationships(next_followup_date) WHERE next_followup_date IS NOT NULL;

-- Enable RLS
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_media_accounts
CREATE POLICY "Mentors can view own social accounts"
  ON social_media_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can insert own social accounts"
  ON social_media_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update own social accounts"
  ON social_media_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own social accounts"
  ON social_media_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = mentor_id);

-- RLS Policies for social_media_posts
CREATE POLICY "Mentors can view own posts"
  ON social_media_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can insert own posts"
  ON social_media_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update own posts"
  ON social_media_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own posts"
  ON social_media_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = mentor_id);

-- RLS Policies for post_engagement_metrics
CREATE POLICY "Mentors can view own post metrics"
  ON post_engagement_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_media_posts
      WHERE social_media_posts.id = post_engagement_metrics.post_id
      AND social_media_posts.mentor_id = auth.uid()
    )
  );

CREATE POLICY "System can insert post metrics"
  ON post_engagement_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_media_posts
      WHERE social_media_posts.id = post_engagement_metrics.post_id
      AND social_media_posts.mentor_id = auth.uid()
    )
  );

-- RLS Policies for content_calendar
CREATE POLICY "Mentors can view own calendar"
  ON content_calendar FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can insert own calendar items"
  ON content_calendar FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update own calendar items"
  ON content_calendar FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own calendar items"
  ON content_calendar FOR DELETE
  TO authenticated
  USING (auth.uid() = mentor_id);

-- RLS Policies for mentor_analytics
CREATE POLICY "Mentors can view own analytics"
  ON mentor_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id);

CREATE POLICY "System can insert analytics"
  ON mentor_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "System can update analytics"
  ON mentor_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

-- RLS Policies for mentee_relationships
CREATE POLICY "Mentors can view own relationships"
  ON mentee_relationships FOR SELECT
  TO authenticated
  USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can insert own relationships"
  ON mentee_relationships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update own relationships"
  ON mentee_relationships FOR UPDATE
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own relationships"
  ON mentee_relationships FOR DELETE
  TO authenticated
  USING (auth.uid() = mentor_id);

-- RLS Policies for relationship_interactions
CREATE POLICY "Mentors can view own relationship interactions"
  ON relationship_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentee_relationships
      WHERE mentee_relationships.id = relationship_interactions.relationship_id
      AND mentee_relationships.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can insert own relationship interactions"
  ON relationship_interactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM mentee_relationships
      WHERE mentee_relationships.id = relationship_interactions.relationship_id
      AND mentee_relationships.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update own relationship interactions"
  ON relationship_interactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentee_relationships
      WHERE mentee_relationships.id = relationship_interactions.relationship_id
      AND mentee_relationships.mentor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mentee_relationships
      WHERE mentee_relationships.id = relationship_interactions.relationship_id
      AND mentee_relationships.mentor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can delete own relationship interactions"
  ON relationship_interactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentee_relationships
      WHERE mentee_relationships.id = relationship_interactions.relationship_id
      AND mentee_relationships.mentor_id = auth.uid()
    )
  );