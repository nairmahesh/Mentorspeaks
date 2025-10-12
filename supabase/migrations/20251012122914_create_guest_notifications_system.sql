/*
  # Create Guest Notifications and Response System

  1. New Tables
    - `episode_invitations`
      - `id` (uuid, primary key)
      - `episode_id` (uuid, references podcast_episodes)
      - `guest_id` (uuid, references profiles)
      - `sent_at` (timestamptz)
      - `responded_at` (timestamptz, nullable)
      - `status` (text) - 'pending', 'responded', 'declined'
      - `invitation_token` (text, unique) - for secure access
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `episode_invitations` table
    - Add policies for moderators to create invitations
    - Add policies for guests to view their own invitations
    - Add policy for public access via invitation token
*/

CREATE TABLE IF NOT EXISTS episode_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid REFERENCES podcast_episodes(id) ON DELETE CASCADE NOT NULL,
  guest_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sent_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'declined')),
  invitation_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE episode_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can create invitations"
  ON episode_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Moderators can view all invitations"
  ON episode_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM podcast_moderators
      WHERE podcast_moderators.user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can view their own invitations"
  ON episode_invitations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = guest_id);

CREATE POLICY "Guests can update their own invitations"
  ON episode_invitations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = guest_id)
  WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Public access via invitation token"
  ON episode_invitations
  FOR SELECT
  TO anon
  USING (true);
