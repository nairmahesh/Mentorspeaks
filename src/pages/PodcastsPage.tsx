import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Answer, Question, Profile } from '../lib/supabase';
import { Layout } from '../components/Layout';
import {
  Mic,
  Play,
  Eye,
  ArrowBigUp,
  Clock,
  MessageSquare,
  Calendar,
  Filter,
  TrendingUp,
  Radio,
  Headphones,
  Phone
} from 'lucide-react';

type AnswerWithDetails = Answer & {
  question: Question;
  mentor: Profile;
};

export function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<AnswerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');

  useEffect(() => {
    loadPodcasts();
  }, [filter]);

  const loadPodcasts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('answers')
        .select('*, question:questions!answers_question_id_fkey(*), mentor:profiles!answers_mentor_id_fkey(*)')
        .eq('status', 'published');

      if (filter === 'trending') {
        query = query.order('upvote_count', { ascending: false });
      } else if (filter === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setPodcasts(data as AnswerWithDetails[]);
    } catch (error) {
      console.error('Error loading podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white py-16">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Radio className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span className="text-sm font-bold">EXPERT PODCASTS</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Listen & Learn
              </h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Explore podcast episodes where industry experts share their knowledge and answer community questions
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">All Episodes</h2>
              <p className="text-slate-600 mt-1">{podcasts.length} podcast episodes available</p>
            </div>

            <div className="flex items-center space-x-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filter === 'all'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1 ${
                  filter === 'trending'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </button>
              <button
                onClick={() => setFilter('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1 ${
                  filter === 'recent'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Recent</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : podcasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 hover:border-orange-400 flex flex-col"
                >
                  <Link to={`/questions/${podcast.question_id}`}>
                    <div className="relative aspect-video bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 flex items-center justify-center overflow-hidden group">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-white bg-opacity-95 flex items-center justify-center group-hover:scale-110 transition shadow-2xl mx-auto mb-3">
                          <Play className="w-10 h-10 text-red-600 ml-1" />
                        </div>
                        <Mic className="w-8 h-8 text-white opacity-60 mx-auto" />
                      </div>
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center space-x-1 shadow-lg">
                          <ArrowBigUp className="w-3.5 h-3.5" />
                          <span>{podcast.upvote_count || 0}</span>
                        </div>
                        <div className="bg-black bg-opacity-80 px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{podcast.view_count}</span>
                        </div>
                      </div>
                      {podcast.duration_seconds && (
                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs font-medium">
                          {formatDuration(podcast.duration_seconds)}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center space-x-3 mb-4">
                      {podcast.mentor?.avatar_url ? (
                        <img
                          src={podcast.mentor.avatar_url}
                          alt={podcast.mentor.full_name}
                          className="w-12 h-12 rounded-full ring-2 ring-orange-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center ring-2 ring-orange-200">
                          <span className="text-white text-lg font-bold">
                            {podcast.mentor?.full_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900">{podcast.mentor?.full_name}</p>
                        {podcast.mentor?.professional_title && (
                          <p className="text-sm text-slate-600 truncate">{podcast.mentor.professional_title}</p>
                        )}
                      </div>
                    </div>

                    <Link to={`/questions/${podcast.question_id}`} className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg hover:text-orange-600 transition leading-snug">
                        {podcast.question?.title}
                      </h3>

                      {podcast.summary && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                          {podcast.summary}
                        </p>
                      )}
                    </Link>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(podcast.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{podcast.view_count} listens</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/questions/${podcast.question_id}`}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition text-sm"
                      >
                        <Play className="w-4 h-4" />
                        <span>Listen</span>
                      </Link>
                      {podcast.mentor?.is_available_for_consulting && (
                        <Link
                          to={`/questions/${podcast.question_id}`}
                          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Book Call</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <Mic className="w-20 h-20 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No podcasts yet</h3>
              <p className="text-slate-600 mb-6">Be the first expert to share your knowledge!</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-slate-900 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Have a Question?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Ask our community of experts and get podcast-style responses
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl text-lg"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Ask a Question</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
