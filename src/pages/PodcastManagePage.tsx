import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Video, Edit, Trash2, Calendar, Eye, Shield } from 'lucide-react';

interface PodcastSeries {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface PodcastEpisode {
  id: string;
  series_id: string;
  title: string;
  episode_number: number;
  guest_id: string;
  moderator_id: string;
  status: string;
  recording_type: string;
  scheduled_at: string;
  guest?: { full_name: string };
  moderator?: { full_name: string };
}

export function PodcastManagePage() {
  const { user } = useAuth();
  const [series, setSeries] = useState<PodcastSeries[]>([]);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkModeratorStatus();
  }, [user]);

  const checkModeratorStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('podcast_moderators')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setIsModerator(true);
      setIsAdmin(data.is_admin || false);
      loadData();
    } else {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);

    const [seriesResult, episodesResult] = await Promise.all([
      supabase
        .from('podcast_series')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('podcast_episodes')
        .select(`
          *,
          guest:guest_id(full_name),
          moderator:moderator_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    if (seriesResult.data) setSeries(seriesResult.data);
    if (episodesResult.data) setEpisodes(episodesResult.data as any);

    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isModerator) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You need to be a podcast moderator to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Podcast Management</h1>
          <div className="flex space-x-3">
            {isAdmin && (
              <Link
                to="/moderators/manage"
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition"
              >
                <Shield className="w-5 h-5" />
                <span>Manage Moderators</span>
              </Link>
            )}
            <Link
              to="/podcasts/series/new"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>New Series</span>
            </Link>
            <Link
              to="/podcasts/episode/new"
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Video className="w-5 h-5" />
              <span>New Episode</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Podcast Series</h2>
            <div className="space-y-3">
              {series.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{s.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{s.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          s.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : s.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/podcasts/series/${s.id}/edit`}
                      className="text-blue-600 hover:text-blue-700 p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
              {series.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-600">No series yet. Create your first one!</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Episodes</h2>
            <div className="space-y-3">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-500">
                          EP {ep.episode_number}
                        </span>
                        {ep.recording_type === 'video' && (
                          <Video className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mt-1">{ep.title}</h3>
                      <div className="text-sm text-slate-600 mt-2 space-y-1">
                        <div>Guest: {ep.guest?.full_name || 'Not assigned'}</div>
                        <div>Moderator: {ep.moderator?.full_name || 'Not assigned'}</div>
                      </div>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ep.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : ep.status === 'recording'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.status === 'scheduled'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ep.status}
                        </span>
                        {ep.scheduled_at && (
                          <span className="text-xs text-slate-500 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(ep.scheduled_at).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Link
                        to={`/podcasts/episode/${ep.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {ep.status === 'scheduled' || ep.status === 'draft' ? (
                        <Link
                          to={`/podcasts/episode/${ep.id}/record`}
                          className="text-green-600 hover:text-green-700 p-2"
                        >
                          <Video className="w-4 h-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {episodes.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-600">No episodes yet. Create your first one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
