/*
  # Create Corporate Accounts System

  ## Overview
  This migration creates the infrastructure for corporate accounts to access the effyMentor platform
  with specialized features for internal and external communication, multilingual content distribution,
  and analytics tracking.

  ## 1. New Tables

  ### `corporate_accounts`
  Stores corporate/enterprise organization information
  - `id` (uuid, primary key) - Unique identifier
  - `company_name` (text) - Official company name
  - `company_email` (text, unique) - Primary contact email
  - `company_website` (text) - Company website URL
  - `industry` (text) - Industry/sector
  - `employee_count` (text) - Company size bracket
  - `contact_person_name` (text) - Primary contact person
  - `contact_person_title` (text) - Contact person's role/title
  - `phone_number` (text) - Contact phone
  - `status` (corporate_status enum) - Account status
  - `subscription_tier` (text) - Plan level
  - `billing_cycle` (text) - monthly/yearly
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last modification time

  ### `corporate_users`
  Links individual users to corporate accounts with specific roles
  - `id` (uuid, primary key)
  - `corporate_account_id` (uuid, references corporate_accounts)
  - `user_id` (uuid, references profiles)
  - `role` (corporate_user_role enum) - admin/manager/creator/viewer
  - `created_at` (timestamptz)

  ### `corporate_content`
  Tracks content created using corporate features
  - `id` (uuid, primary key)
  - `corporate_account_id` (uuid, references corporate_accounts)
  - `creator_id` (uuid, references profiles)
  - `content_type` (corporate_content_type enum) - video/audio/text
  - `title` (text) - Content title
  - `description` (text) - Content description
  - `content_url` (text) - Media file URL
  - `transcript` (text) - Transcript/script
  - `use_case` (text) - internal_engagement/thought_leadership/training/brand_storytelling
  - `target_audience` (text) - employees/investors/media/public
  - `languages` (text array) - Supported languages for dubbing
  - `is_published` (boolean) - Publication status
  - `view_count` (integer) - Views counter
  - `engagement_score` (numeric) - Calculated engagement metric
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `corporate_analytics`
  Tracks engagement and performance metrics
  - `id` (uuid, primary key)
  - `corporate_account_id` (uuid, references corporate_accounts)
  - `content_id` (uuid, references corporate_content)
  - `event_type` (text) - view/share/like/download
  - `user_segment` (text) - internal/external/distributor
  - `channel` (text) - platform/linkedin/internal_portal
  - `timestamp` (timestamptz)
  - `metadata` (jsonb) - Additional tracking data

  ## 2. Custom Types

  - `corporate_status` - pending/active/suspended/cancelled
  - `corporate_user_role` - admin/manager/creator/viewer
  - `corporate_content_type` - video/audio/text/presentation

  ## 3. Security

  - Enable RLS on all new tables
  - Corporate admins can manage their account users
  - Corporate users can view content from their organization
  - Analytics are restricted to corporate account members
  - Public read access for published content (optional per content)

  ## 4. Important Notes

  - Supports multilingual content through languages array
  - Flexible use_case field for various corporate scenarios
  - Analytics track both internal and external engagement
  - Subscription tiers can be customized per corporate needs
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE corporate_status AS ENUM ('pending', 'active', 'suspended', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE corporate_user_role AS ENUM ('admin', 'manager', 'creator', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE corporate_content_type AS ENUM ('video', 'audio', 'text', 'presentation');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create corporate_accounts table
CREATE TABLE IF NOT EXISTS corporate_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_email text UNIQUE NOT NULL,
  company_website text,
  industry text,
  employee_count text,
  contact_person_name text NOT NULL,
  contact_person_title text,
  phone_number text,
  status corporate_status DEFAULT 'pending' NOT NULL,
  subscription_tier text DEFAULT 'starter',
  billing_cycle text DEFAULT 'monthly',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create corporate_users table
CREATE TABLE IF NOT EXISTS corporate_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id uuid REFERENCES corporate_accounts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role corporate_user_role DEFAULT 'viewer' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(corporate_account_id, user_id)
);

-- Create corporate_content table
CREATE TABLE IF NOT EXISTS corporate_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id uuid REFERENCES corporate_accounts(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content_type corporate_content_type DEFAULT 'video' NOT NULL,
  title text NOT NULL,
  description text,
  content_url text,
  transcript text,
  use_case text,
  target_audience text,
  languages text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  view_count integer DEFAULT 0,
  engagement_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create corporate_analytics table
CREATE TABLE IF NOT EXISTS corporate_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id uuid REFERENCES corporate_accounts(id) ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES corporate_content(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  user_segment text,
  channel text,
  timestamp timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for corporate_accounts

-- Authenticated users can view their own corporate account
CREATE POLICY "Users can view their corporate account"
  ON corporate_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_accounts.id
      AND corporate_users.user_id = auth.uid()
    )
  );

-- Corporate admins can update their account
CREATE POLICY "Admins can update their corporate account"
  ON corporate_accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_accounts.id
      AND corporate_users.user_id = auth.uid()
      AND corporate_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_accounts.id
      AND corporate_users.user_id = auth.uid()
      AND corporate_users.role = 'admin'
    )
  );

-- New corporate accounts can be created by authenticated users
CREATE POLICY "Authenticated users can create corporate accounts"
  ON corporate_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for corporate_users

-- Users can view members of their corporate account
CREATE POLICY "Users can view corporate members"
  ON corporate_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM corporate_users cu
      WHERE cu.corporate_account_id = corporate_users.corporate_account_id
      AND cu.user_id = auth.uid()
    )
  );

-- Admins can add users to their corporate account
CREATE POLICY "Admins can add corporate users"
  ON corporate_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_users.corporate_account_id
      AND corporate_users.user_id = auth.uid()
      AND corporate_users.role = 'admin'
    )
  );

-- Admins can remove users from their corporate account
CREATE POLICY "Admins can remove corporate users"
  ON corporate_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM corporate_users cu
      WHERE cu.corporate_account_id = corporate_users.corporate_account_id
      AND cu.user_id = auth.uid()
      AND cu.role = 'admin'
    )
  );

-- RLS Policies for corporate_content

-- Anyone can view published content
CREATE POLICY "Anyone can view published content"
  ON corporate_content
  FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Corporate users can view all content from their organization
CREATE POLICY "Corporate users can view organization content"
  ON corporate_content
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_content.corporate_account_id
      AND corporate_users.user_id = auth.uid()
    )
  );

-- Creators and managers can create content
CREATE POLICY "Creators can create content"
  ON corporate_content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_content.corporate_account_id
      AND corporate_users.user_id = auth.uid()
      AND corporate_users.role IN ('admin', 'manager', 'creator')
    )
  );

-- Creators can update their own content, managers can update all
CREATE POLICY "Creators can update content"
  ON corporate_content
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_content.corporate_account_id
      AND corporate_users.user_id = auth.uid()
      AND (
        corporate_users.role IN ('admin', 'manager')
        OR (corporate_users.role = 'creator' AND corporate_content.creator_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_content.corporate_account_id
      AND corporate_users.user_id = auth.uid()
      AND (
        corporate_users.role IN ('admin', 'manager')
        OR (corporate_users.role = 'creator' AND corporate_content.creator_id = auth.uid())
      )
    )
  );

-- RLS Policies for corporate_analytics

-- Corporate users can view analytics for their organization
CREATE POLICY "Corporate users can view analytics"
  ON corporate_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM corporate_users
      WHERE corporate_users.corporate_account_id = corporate_analytics.corporate_account_id
      AND corporate_users.user_id = auth.uid()
    )
  );

-- System can insert analytics (triggers/edge functions)
CREATE POLICY "Allow analytics insertion"
  ON corporate_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_corporate_users_account ON corporate_users(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_corporate_users_user ON corporate_users(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_content_account ON corporate_content(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_corporate_content_creator ON corporate_content(creator_id);
CREATE INDEX IF NOT EXISTS idx_corporate_analytics_account ON corporate_analytics(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_corporate_analytics_content ON corporate_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_corporate_analytics_timestamp ON corporate_analytics(timestamp);
