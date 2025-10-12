/*
  # Add Mentor Consulting Preferences

  1. Changes to profiles table
    - Add `offers_consulting` boolean field
    - Add `consulting_type` enum field (free, paid, hybrid)
    - Add `consulting_rate_inr` numeric field for hourly rate
    - Add `free_hours_per_month` integer field for hybrid/free consulting
    - Add `consulting_description` text field

  2. Purpose
    - Enable mentors to offer one-on-one consulting services
    - Support different consulting models (free, paid, hybrid)
    - Track consulting availability and preferences
*/

-- Add consulting type enum
DO $$ BEGIN
  CREATE TYPE consulting_type AS ENUM ('free', 'paid', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add consulting fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'offers_consulting'
  ) THEN
    ALTER TABLE profiles ADD COLUMN offers_consulting boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'consulting_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN consulting_type consulting_type DEFAULT 'paid';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'consulting_rate_inr'
  ) THEN
    ALTER TABLE profiles ADD COLUMN consulting_rate_inr numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'free_hours_per_month'
  ) THEN
    ALTER TABLE profiles ADD COLUMN free_hours_per_month integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'consulting_description'
  ) THEN
    ALTER TABLE profiles ADD COLUMN consulting_description text;
  END IF;
END $$;
