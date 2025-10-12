import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'seeker' | 'mentor' | 'ambassador' | 'admin';

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  professional_title: string | null;
  created_at: string;
  updated_at: string;
  offers_consulting?: boolean;
  consulting_type?: 'free' | 'paid' | 'hybrid';
  consulting_rate_inr?: number;
  free_hours_per_month?: number;
  consulting_description?: string | null;
  rating?: number;
  total_reviews?: number;
  total_answers?: number;
  total_videos?: number;
};

export type Industry = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
};

export type Question = {
  id: string;
  seeker_id: string;
  title: string;
  description: string | null;
  industry_id: string | null;
  tags: string[];
  is_paid: boolean;
  amount: number;
  status: 'open' | 'answered' | 'closed';
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type Answer = {
  id: string;
  question_id: string;
  mentor_id: string;
  content_type: 'video' | 'audio' | 'text';
  content_url: string | null;
  transcript: string | null;
  summary: string | null;
  teleprompter_notes: string | null;
  duration_seconds: number;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
};
