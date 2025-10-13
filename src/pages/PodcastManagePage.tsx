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
  const [mainTab, setMainTab] = useState<'episodes' | 'series'>('episodes');
  const [activeTab, setActiveTab] = useState<'today' | 'past' | 'future'>('today');
  const [stats, setStats] = useState({ total: 0, past: 0, today: 0, future: 0 });

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
        .order('scheduled_at', { ascending: false, nullsFirst: false })
    ]);

    if (seriesResult.data) setSeries(seriesResult.data);
    if (episodesResult.data) {
      const eps = episodesResult.data as any;
      setEpisodes(eps);

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const past = eps.filter((e: any) => {
        if (!e.scheduled_at) return false;
        return new Date(e.scheduled_at) < startOfDay;
      }).length;

      const today = eps.filter((e: any) => {
        if (!e.scheduled_at) return false;
        const date = new Date(e.scheduled_at);
        return date >= startOfDay && date < endOfDay;
      }).length;

      const future = eps.filter((e: any) => {
        if (!e.scheduled_at) return false;
        return new Date(e.scheduled_at) >= endOfDay;
      }).length;

      setStats({ total: eps.length, past, today, future });
    }

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
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
              >
                <Shield className="w-5 h-5" />
                <span>Manage Moderators</span>
              </Link>
            )}
            <Link
              to="/podcasts/new"
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Create Podcast</span>
            </Link>
          </div>
        </div>

        <div className="mb-8 border-b border-slate-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setMainTab('episodes')}
              className={`px-6 py-3 font-semibold transition relative ${
                mainTab === 'episodes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Episodes
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                {stats.total}
              </span>
            </button>
            <button
              onClick={() => setMainTab('series')}
              className={`px-6 py-3 font-semibold transition relative ${
                mainTab === 'series'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Series
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
                {series.length}
              </span>
            </button>
          </div>
        </div>

        {mainTab === 'series' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Your Podcast Series</h2>
              <p className="text-slate-600">Organize episodes into series for better content structure</p>
            </div>

            <div className="space-y-4">
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
                <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Series Yet</h3>
                  <p className="text-slate-600 mb-6">Create your first podcast series to organize your episodes</p>
                  <Link
                    to="/podcasts/new"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Podcast</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {mainTab === 'episodes' && (
          <div>
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-slate-600">Total Episodes</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.today}</div>
                  <div className="text-sm text-slate-600">Today</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.future}</div>
                  <div className="text-sm text-slate-600">Upcoming</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="text-2xl font-bold text-slate-600">{stats.past}</div>
                  <div className="text-sm text-slate-600">Past</div>
                </div>
              </div>

              <div className="flex space-x-2 mb-4 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`px-4 py-2 font-medium transition ${
                    activeTab === 'today'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today ({stats.today})
                </button>
                <button
                  onClick={() => setActiveTab('future')}
                  className={`px-4 py-2 font-medium transition ${
                    activeTab === 'future'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Future ({stats.future})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 font-medium transition ${
                    activeTab === 'past'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Past ({stats.past})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {episodes.filter(ep => {
                if (!ep.scheduled_at) return activeTab === 'today';
                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const epDate = new Date(ep.scheduled_at);

                if (activeTab === 'today') return epDate >= startOfDay && epDate < endOfDay;
                if (activeTab === 'past') return epDate < startOfDay;
                if (activeTab === 'future') return epDate >= endOfDay;
                return false;
              }).map((ep) => (
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
                        to={`/podcasts/episode/${ep.id}/view`}
                        className="text-slate-600 hover:text-slate-700 p-2"
                        title="View & Share Episode"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/podcasts/episode/${ep.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 p-2"
                        title="Edit Episode"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {ep.status === 'scheduled' || ep.status === 'draft' ? (
                        <Link
                          to={`/podcasts/record/${ep.id}`}
                          className="text-green-600 hover:text-green-700 p-2"
                          title="Record Episode"
                        >
                          <Video className="w-4 h-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {episodes.filter(ep => {
                if (!ep.scheduled_at) return activeTab === 'today';
                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const epDate = new Date(ep.scheduled_at);

                if (activeTab === 'today') return epDate >= startOfDay && epDate < endOfDay;
                if (activeTab === 'past') return epDate < startOfDay;
                if (activeTab === 'future') return epDate >= endOfDay;
                return false;
              }).length === 0 && (
                <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No {activeTab === 'today' ? 'episodes today' : activeTab === 'future' ? 'upcoming episodes' : 'past episodes'}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {episodes.length === 0
                      ? 'Create your first podcast episode to get started'
                      : `Schedule an episode for ${activeTab === 'today' ? 'today' : activeTab === 'future' ? 'the future' : 'viewing past recordings'}`
                    }
                  </p>
                  {episodes.length === 0 && (
                    <Link
                      to="/podcasts/new"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Your First Podcast</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
