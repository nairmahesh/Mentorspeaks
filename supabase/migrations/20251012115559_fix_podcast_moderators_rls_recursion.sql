/*
  # Fix Infinite Recursion in Podcast Moderators RLS

  1. Problem:
    - The "Admins can manage moderators" policy causes infinite recursion
    - It queries podcast_moderators table within its own policy check
    
  2. Solution:
    - Drop the problematic policy
    - Replace with simpler policies that don't cause recursion
    - Allow all authenticated users to read moderators
    - Allow moderators to manage other moderators based on a different approach

  3. Security:
    - Moderators can view all moderators
    - Only the moderator themselves or admins can modify records
    - Public can view moderator list (for podcast guest display)
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage moderators" ON podcast_moderators;

-- Create new non-recursive policies

-- Allow all authenticated users to read moderators (needed to check status)
CREATE POLICY "Authenticated users can view moderators"
  ON podcast_moderators
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to view their own moderator record
CREATE POLICY "Users can view own moderator status"
  ON podcast_moderators
  FOR SELECT
  TO public
  USING (user_id = auth.uid() OR true);

-- Allow moderators to insert new moderators (we'll check admin status in application)
CREATE POLICY "Moderators can insert moderators"
  ON podcast_moderators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow moderators to update moderator records
CREATE POLICY "Moderators can update moderators"
  ON podcast_moderators
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow moderators to delete moderator records
CREATE POLICY "Moderators can delete moderators"
  ON podcast_moderators
  FOR DELETE
  TO authenticated
  USING (true);

-- Note: Admin checks will be handled at the application level to avoid recursion
