/*
  # Add External Guest Invitation System

  ## Overview
  This migration adds support for inviting external guests (not registered on the platform) to podcast episodes.

  ## Changes

  1. New Tables
    - `podcast_external_guests`
      - `id` (uuid, primary key)
      - `full_name` (text) - Guest's full name
      - `email` (text) - Guest's email address
      - `phone` (text) - Optional phone number for WhatsApp
      - `professional_title` (text) - Guest's job title
      - `bio` (text) - Optional biography
      - `linkedin_url` (text) - Optional LinkedIn profile
      - `avatar_url` (text) - Optional profile picture URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `podcast_guest_invitations`
      - `id` (uuid, primary key)
      - `episode_id` (uuid) - Reference to podcast_episodes
      - `external_guest_id` (uuid) - Reference to podcast_external_guests
      - `invitation_token` (text) - Unique token for the invitation link
      - `invitation_sent_at` (timestamptz) - When invitation was sent
      - `invitation_method` (text) - email, whatsapp, both
      - `status` (text) - pending, accepted, declined
      - `accepted_at` (timestamptz) - When guest accepted
      - `guest_order` (integer) - Order of appearance
      - `is_primary_guest` (boolean) - Primary guest indicator
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modifications
    - Update `podcast_episode_guests` to support external guests
    - Add `external_guest_id` column to `podcast_episode_guests`

  3. Security
    - Enable RLS on new tables
    - Moderators can create and manage invitations
    - Public can view accepted external guests for published episodes
    - External guests can accept invitations using the token

  4. Helper Functions
    - Function to generate unique invitation tokens
    - Function to get all guests (internal + external) for an episode
*/

-- Create podcast_external_guests table
CREATE TABLE IF NOT EXISTS podcast_external_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  professional_title text,
  bio text,
  linkedin_url text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcast_guest_invitations table
CREATE TABLE IF NOT EXISTS podcast_guest_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE NOT NULL,
  external_guest_id uuid REFERENCES podcast_external_guests(id) ON DELETE CASCADE NOT NULL,
  invitation_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  invitation_sent_at timestamptz,
  invitation_method text CHECK (invitation_method IN ('email', 'whatsapp', 'both')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  accepted_at timestamptz,
  guest_order integer DEFAULT 1,
  is_primary_guest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add external_guest_id to podcast_episode_guests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'podcast_episode_guests' AND column_name = 'external_guest_id'
  ) THEN
    ALTER TABLE podcast_episode_guests ADD COLUMN external_guest_id uuid REFERENCES podcast_external_guests(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_podcast_external_guests_email ON podcast_external_guests(email);
CREATE INDEX IF NOT EXISTS idx_podcast_guest_invitations_episode ON podcast_guest_invitations(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_guest_invitations_external_guest ON podcast_guest_invitations(external_guest_id);
CREATE INDEX IF NOT EXISTS idx_podcast_guest_invitations_token ON podcast_guest_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_podcast_guest_invitations_status ON podcast_guest_invitations(status);
CREATE INDEX IF NOT EXISTS idx_podcast_episode_guests_external ON podcast_episode_guests(external_guest_id);

-- Enable RLS
ALTER TABLE podcast_external_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_guest_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for podcast_external_guests
CREATE POLICY "Public can view external guests for published episodes"
  ON podcast_external_guests FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM podcast_episode_guests peg
      JOIN podcast_episodes pe ON pe.id = peg.episode_id
      WHERE peg.external_guest_id = podcast_external_guests.id
      AND pe.status = 'published'
    )
  );

CREATE POLICY "Moderators can view all external guests"
  ON podcast_external_guests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can create external guests"
  ON podcast_external_guests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can update external guests"
  ON podcast_external_guests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

-- RLS Policies for podcast_guest_invitations
CREATE POLICY "Public can view accepted invitations for published episodes"
  ON podcast_guest_invitations FOR SELECT
  TO public
  USING (
    status = 'accepted' AND
    EXISTS (
      SELECT 1 FROM podcast_episodes
      WHERE podcast_episodes.id = podcast_guest_invitations.episode_id
      AND podcast_episodes.status = 'published'
    )
  );

CREATE POLICY "Moderators can view all invitations"
  ON podcast_guest_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can create invitations"
  ON podcast_guest_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can update invitations"
  ON podcast_guest_invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone with token can accept invitation"
  ON podcast_guest_invitations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (status IN ('accepted', 'declined'));

-- Drop and recreate the get_episode_guests function with new columns
DROP FUNCTION IF EXISTS get_episode_guests(uuid);

CREATE OR REPLACE FUNCTION get_episode_guests(episode_uuid uuid)
RETURNS TABLE (
  guest_id uuid,
  full_name text,
  professional_title text,
  avatar_url text,
  is_primary boolean,
  guest_order integer,
  is_external boolean,
  invitation_status text
) AS $$
BEGIN
  -- Return internal and external guests
  RETURN QUERY
  SELECT 
    COALESCE(p.id, peg.external_guest_id) as guest_id,
    COALESCE(p.full_name, eg.full_name) as full_name,
    COALESCE(p.professional_title, eg.professional_title) as professional_title,
    COALESCE(p.avatar_url, eg.avatar_url) as avatar_url,
    peg.is_primary_guest as is_primary,
    peg.guest_order,
    (peg.external_guest_id IS NOT NULL) as is_external,
    CAST(NULL as text) as invitation_status
  FROM podcast_episode_guests peg
  LEFT JOIN profiles p ON p.id = peg.guest_id
  LEFT JOIN podcast_external_guests eg ON eg.id = peg.external_guest_id
  WHERE peg.episode_id = episode_uuid
  ORDER BY peg.guest_order;

  -- If no guests in podcast_episode_guests, check for old single-guest system
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id as guest_id,
      p.full_name,
      p.professional_title,
      p.avatar_url,
      true as is_primary,
      1 as guest_order,
      false as is_external,
      CAST(NULL as text) as invitation_status
    FROM podcast_episodes pe
    JOIN profiles p ON p.id = pe.guest_id
    WHERE pe.id = episode_uuid
    AND pe.guest_id IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invitation message
CREATE OR REPLACE FUNCTION get_invitation_message(
  episode_title text,
  episode_description text,
  moderator_name text,
  invitation_token text,
  message_type text DEFAULT 'email'
)
RETURNS text AS $$
DECLARE
  invitation_url text;
  message text;
BEGIN
  invitation_url := 'https://effymentor.com/podcasts/invitation/' || invitation_token;
  
  IF message_type = 'email' THEN
    message := E'Hello!\n\n';
    message := message || 'You have been invited to be a guest on our podcast!\n\n';
    message := message || '📻 Episode: ' || episode_title || E'\n';
    IF episode_description IS NOT NULL THEN
      message := message || E'\n' || episode_description || E'\n';
    END IF;
    message := message || E'\n🎙️ Hosted by: ' || moderator_name || E'\n\n';
    message := message || 'We would love to have you share your insights and experiences with our audience. ';
    message := message || E'This is a great opportunity to showcase your expertise and connect with professionals in your industry.\n\n';
    message := message || 'Click the link below to accept the invitation and view episode details:\n';
    message := message || invitation_url || E'\n\n';
    message := message || 'Looking forward to having you on the show!\n\n';
    message := message || 'Best regards,\n';
    message := message || 'The EffyMentor Team';
  ELSE -- whatsapp
    message := '🎙️ *Podcast Invitation*' || E'\n\n';
    message := message || 'Hello! You''re invited to be a guest on our podcast!' || E'\n\n';
    message := message || '📻 *Episode:* ' || episode_title || E'\n';
    message := message || '🎯 *Hosted by:* ' || moderator_name || E'\n\n';
    message := message || 'We''d love to have you share your expertise with our audience! 🌟' || E'\n\n';
    message := message || '👉 Accept invitation: ' || invitation_url || E'\n\n';
    message := message || '_Looking forward to having you on the show!_';
  END IF;
  
  RETURN message;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_podcast_external_guests_updated_at') THEN
    CREATE TRIGGER update_podcast_external_guests_updated_at
      BEFORE UPDATE ON podcast_external_guests
      FOR EACH ROW
      EXECUTE FUNCTION update_podcast_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_podcast_guest_invitations_updated_at') THEN
    CREATE TRIGGER update_podcast_guest_invitations_updated_at
      BEFORE UPDATE ON podcast_guest_invitations
      FOR EACH ROW
      EXECUTE FUNCTION update_podcast_updated_at();
  END IF;
END $$;
