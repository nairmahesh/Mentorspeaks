import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, Users, CheckCircle, ArrowRight } from 'lucide-react';

interface Chapter {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  cover_image_url: string;
  status: string;
  member_count?: number;
  is_member?: boolean;
}

export function ChaptersPage() {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningChapter, setJoiningChapter] = useState<string | null>(null);

  useEffect(() => {
    loadChapters();
  }, [user]);

  const loadChapters = async () => {
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('regional_chapters')
      .select('*')
      .eq('status', 'active')
      .order('region');

    if (chaptersData) {
      const chaptersWithMembership = await Promise.all(
        chaptersData.map(async (chapter) => {
          const { count } = await supabase
            .from('chapter_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('chapter_id', chapter.id);

          let is_member = false;
          if (user) {
            const { data: membershipData } = await supabase
              .from('chapter_memberships')
              .select('id')
              .eq('chapter_id', chapter.id)
              .eq('user_id', user.id)
              .single();

            is_member = !!membershipData;
          }

          return {
            ...chapter,
            member_count: count || 0,
            is_member
          };
        })
      );

      setChapters(chaptersWithMembership);
    }

    setLoading(false);
  };

  const joinChapter = async (chapterId: string) => {
    if (!user) {
      alert('Please log in to join a chapter');
      return;
    }

    setJoiningChapter(chapterId);

    try {
      const { error } = await supabase
        .from('chapter_memberships')
        .insert({
          user_id: user.id,
          chapter_id: chapterId
        });

      if (error) throw error;

      loadChapters();
    } catch (err: any) {
      alert(err.message || 'Failed to join chapter');
    } finally {
      setJoiningChapter(null);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading chapters...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Regional Chapters</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join your regional community and connect with mentors and peers in your area.
            Build meaningful relationships and grow together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <h3 className="text-2xl font-bold">{chapter.region}</h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{chapter.name}</h2>
                <p className="text-slate-600 mb-4">{chapter.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">{chapter.member_count} members</span>
                  </div>
                  {chapter.is_member && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Joined</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/chapters/${chapter.slug}`}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition group-hover:bg-blue-700"
                >
                  <span>View Chapter</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
