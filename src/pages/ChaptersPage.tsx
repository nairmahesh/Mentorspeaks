import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, Users, CheckCircle, ArrowRight, Globe, UserPlus } from 'lucide-react';

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
              .maybeSingle();

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

  const joinChapter = async (chapterId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading chapters...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Globe className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Join Your Regional Community</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Regional Chapters</h1>
            <p className="text-lg sm:text-xl text-orange-100 max-w-3xl mx-auto leading-relaxed">
              Connect with mentors and professionals in your region. Join chapter-exclusive events, discussions, and networking opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              to={`/chapters/${chapter.slug}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group"
            >
              <div className="h-32 sm:h-48 bg-gradient-to-br from-orange-500 to-orange-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 opacity-50" />
                    <h3 className="text-xl sm:text-2xl font-bold">{chapter.region}</h3>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{chapter.name}</h2>
                <p className="text-sm sm:text-base text-slate-600 mb-4 line-clamp-2">{chapter.description}</p>

                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm">{chapter.member_count} members</span>
                  </div>
                  {chapter.is_member ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm font-medium">Joined</span>
                    </div>
                  ) : user ? (
                    <button
                      onClick={(e) => joinChapter(chapter.id, e)}
                      disabled={joiningChapter === chapter.id}
                      className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{joiningChapter === chapter.id ? 'Joining...' : 'Join'}</span>
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center justify-center space-x-2 bg-orange-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-orange-700 transition group-hover:bg-orange-700">
                  <span className="text-sm sm:text-base">View Chapter</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Globe className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Chapters Yet</h3>
            <p className="text-slate-600">Check back soon as we expand to more regions!</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
