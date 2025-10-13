import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Answer, Question, Profile } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { CallBookingModal } from '../components/CallBookingModal';
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
  Phone,
  Heart,
  Share2,
  Star,
  Sparkles,
  X,
  Mail
} from 'lucide-react';

type AnswerWithDetails = Answer & {
  question: Question;
  mentor: Profile;
};

interface PodcastGuest {
  guest_id: string;
  full_name: string;
  professional_title: string;
  avatar_url: string;
  is_primary: boolean;
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  episode_number: number;
  recording_type: string;
  thumbnail_url: string;
  duration_minutes: number;
  view_count: number;
  published_at: string;
  guest: { id: string; full_name: string; professional_title: string; avatar_url: string; is_available_for_consulting: boolean } | null;
  moderator?: { full_name: string; professional_title: string };
  guests?: PodcastGuest[];
}

export function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<AnswerWithDetails[]>([]);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [consultingGuest, setConsultingGuest] = useState<{ id: string; full_name: string } | null>(null);

  useEffect(() => {
    loadPodcasts();
  }, [filter]);

  const loadPodcasts = async () => {
    setLoading(true);
    try {
      // Load both old answers and new podcast episodes
      const [answersResult, episodesResult] = await Promise.all([
        supabase
          .from('answers')
          .select('*, question:questions!answers_question_id_fkey(*), mentor:profiles!answers_mentor_id_fkey(*)')
          .eq('status', 'published')
          .order('created_at', { ascending: false }),
        supabase
          .from('podcast_episodes')
          .select(`
            *,
            guest:guest_id(id, full_name, professional_title, avatar_url, is_available_for_consulting),
            moderator:podcast_moderators!podcast_episodes_moderator_id_fkey(
              moderator:moderator_id(full_name, professional_title)
            )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
      ]);

      if (answersResult.data) setPodcasts(answersResult.data as AnswerWithDetails[]);

      // Load guests for each episode
      if (episodesResult.data) {
        const episodesWithGuests = await Promise.all(
          episodesResult.data.map(async (ep: any) => {
            const { data: guests } = await supabase.rpc('get_episode_guests', { episode_uuid: ep.id });
            return { ...ep, guests: guests && guests.length > 0 ? guests : undefined };
          })
        );
        setEpisodes(episodesWithGuests as any);
      }
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

  const handleLike = (episodeId: string) => {
    setLikedEpisodes((prev) => {
      const newLiked = new Set(prev);
      if (newLiked.has(episodeId)) {
        newLiked.delete(episodeId);
      } else {
        newLiked.add(episodeId);
      }
      return newLiked;
    });
  };

  const handleShare = (episode: PodcastEpisode) => {
    setSelectedEpisode(episode);
    setShareModalOpen(true);
  };

  const copyLink = (episode: PodcastEpisode) => {
    const episodeUrl = `https://effymentor.com/podcasts/episode/${episode.id}`;
    navigator.clipboard.writeText(episodeUrl);
    alert('Link copied to clipboard!');
  };

  const shareViaEmail = (episode: PodcastEpisode) => {
    const episodeUrl = `https://effymentor.com/podcasts/episode/${episode.id}`;
    const subject = encodeURIComponent(`Check out this podcast: ${episode.title}`);
    const body = encodeURIComponent(
      `I thought you might enjoy this podcast episode!\n\n` +
      `${episode.title}\n` +
      `Episode ${episode.episode_number}\n\n` +
      `${episode.description}\n\n` +
      `Watch here: ${episodeUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = (episode: PodcastEpisode) => {
    const episodeUrl = `https://effymentor.com/podcasts/episode/${episode.id}`;
    const message = encodeURIComponent(
      `🎙️ Check out this podcast episode!\n\n` +
      `*${episode.title}*\n` +
      `Episode ${episode.episode_number}\n\n` +
      `${episode.description}\n\n` +
      `Watch here: ${episodeUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const featuredEpisodes = episodes.filter((_, index) => index < 3);
  const upcomingEpisodes = episodes.filter((ep) => new Date(ep.published_at) > new Date());

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="relative bg-gradient-to-br from-blue-600 via-teal-600 to-cyan-600 text-white py-16">
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
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
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

            <Link
              to="/podcasts/manage"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
            >
              Manage Podcasts
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Featured Episodes */}
              {featuredEpisodes.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center space-x-2 mb-6">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    <h3 className="text-2xl font-bold text-slate-900">Featured Episodes</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredEpisodes.map((episode) => (
                      <Link
                        key={episode.id}
                        to={`/podcasts/episode/${episode.id}`}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 hover:border-cyan-400 flex flex-col"
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-cyan-500 via-blue-600 to-slate-700 flex items-center justify-center overflow-hidden group">
                          {episode.thumbnail_url ? (
                            <img src={episode.thumbnail_url} alt={episode.title} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                              <div className="relative z-10 text-center">
                                <div className="w-20 h-20 rounded-full bg-white bg-opacity-95 flex items-center justify-center group-hover:scale-110 transition shadow-2xl mx-auto mb-3">
                                  <Play className="w-10 h-10 text-blue-600 ml-1" />
                                </div>
                                <Mic className="w-8 h-8 text-white opacity-60 mx-auto" />
                              </div>
                            </>
                          )}
                          <div className="absolute top-3 left-3">
                            <div className="bg-blue-600 px-3 py-1.5 rounded-full text-white text-xs font-bold">
                              EP {episode.episode_number}
                            </div>
                          </div>
                          <div className="absolute top-3 right-3">
                            <div className="bg-black bg-opacity-80 px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center space-x-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{episode.view_count || 0}</span>
                            </div>
                          </div>
                          {episode.duration_minutes && (
                            <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs font-medium">
                              {episode.duration_minutes} min
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center space-x-3 mb-4">
                            {episode.guest?.avatar_url ? (
                              <img
                                src={episode.guest.avatar_url}
                                alt={episode.guest.full_name}
                                className="w-12 h-12 rounded-full ring-2 ring-blue-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center ring-2 ring-blue-200">
                                <span className="text-white text-lg font-bold">
                                  {episode.guest?.full_name?.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900">{episode.guest?.full_name}</p>
                              {episode.guest?.professional_title && (
                                <p className="text-sm text-slate-600 truncate">{episode.guest.professional_title}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg leading-snug">
                              {episode.title}
                            </h3>
                            {episode.description && (
                              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                                {episode.description}
                              </p>
                            )}
                            {episode.moderator && (
                              <div className="flex items-center text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                                <Mic className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span className="truncate">
                                  Moderated by <span className="font-semibold text-slate-700">{episode.moderator.full_name}</span>
                                  {episode.moderator.professional_title && ` • ${episode.moderator.professional_title}`}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{episode.view_count || 0}</span>
                              </div>
                              <button
                                onClick={() => handleLike(episode.id)}
                                className={`flex items-center space-x-1 transition ${
                                  likedEpisodes.has(episode.id) ? 'text-pink-600' : 'hover:text-pink-600'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${likedEpisodes.has(episode.id) ? 'fill-pink-600' : ''}`} />
                                <span>24</span>
                              </button>
                              <button
                                onClick={() => handleShare(episode)}
                                className="flex items-center space-x-1 hover:text-blue-600 transition"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Share</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-center space-x-1 text-blue-600 group-hover:text-blue-700 font-bold text-sm">
                              <Play className="w-4 h-4" />
                              <span>Watch</span>
                            </div>
                            {episode.guest?.is_available_for_consulting && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConsultingGuest({ id: episode.guest.id, full_name: episode.guest.full_name });
                                }}
                                className="flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                              >
                                <Phone className="w-4 h-4" />
                                <span>Book Call</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Episodes */}
              {upcomingEpisodes.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center space-x-2 mb-6">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-slate-900">Upcoming Episodes</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingEpisodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all border-2 border-blue-200 flex flex-col cursor-not-allowed opacity-75"
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-cyan-500 via-teal-600 to-cyan-600 flex items-center justify-center overflow-hidden group">
                          {episode.thumbnail_url ? (
                            <img src={episode.thumbnail_url} alt={episode.title} className="w-full h-full object-cover opacity-80" />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                              <div className="relative z-10 text-center">
                                <div className="w-20 h-20 rounded-full bg-white bg-opacity-95 flex items-center justify-center group-hover:scale-110 transition shadow-2xl mx-auto mb-3">
                                  <Calendar className="w-10 h-10 text-blue-600" />
                                </div>
                                <p className="text-white font-bold text-sm">Coming Soon</p>
                              </div>
                            </>
                          )}
                          <div className="absolute top-3 left-3">
                            <div className="bg-blue-600 px-3 py-1.5 rounded-full text-white text-xs font-bold">
                              EP {episode.episode_number}
                            </div>
                          </div>
                          <div className="absolute top-3 right-3">
                            <div className="bg-amber-500 px-3 py-1.5 rounded-full text-white text-xs font-bold">
                              UPCOMING
                            </div>
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center space-x-3 mb-4">
                            {episode.guest?.avatar_url ? (
                              <img
                                src={episode.guest.avatar_url}
                                alt={episode.guest.full_name}
                                className="w-12 h-12 rounded-full ring-2 ring-blue-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-2 ring-blue-200">
                                <span className="text-white text-lg font-bold">
                                  {episode.guest?.full_name?.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900">{episode.guest?.full_name}</p>
                              {episode.guest?.professional_title && (
                                <p className="text-sm text-slate-600 truncate">{episode.guest.professional_title}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg leading-snug">
                              {episode.title}
                            </h3>
                            {episode.description && (
                              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                                {episode.description}
                              </p>
                            )}
                            {episode.moderator && (
                              <div className="flex items-center text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2">
                                <Mic className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span className="truncate">
                                  Moderated by <span className="font-semibold text-slate-700">{episode.moderator.full_name}</span>
                                  {episode.moderator.professional_title && ` • ${episode.moderator.professional_title}`}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-center text-sm text-slate-600 mb-4 pt-4 border-t border-slate-100">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Releases: {formatDate(episode.published_at)}</span>
                          </div>

                          <button
                            className="w-full flex items-center justify-center space-x-2 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold cursor-not-allowed text-sm"
                            disabled
                          >
                            <Clock className="w-4 h-4" />
                            <span>Not Available Yet</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Q&A Episodes */}
              {podcasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 hover:border-slate-400 flex flex-col"
                >
                  <Link to={`/questions/${podcast.question_id}`}>
                    <div className="relative aspect-video bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center overflow-hidden group">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-white bg-opacity-95 flex items-center justify-center group-hover:scale-110 transition shadow-2xl mx-auto mb-3">
                          <Play className="w-10 h-10 text-slate-700 ml-1" />
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
                          className="w-12 h-12 rounded-full ring-2 ring-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center ring-2 ring-slate-200">
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
                      <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg hover:text-blue-600 transition leading-snug">
                        {podcast.question?.title}
                      </h3>

                      {podcast.summary && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                          {podcast.summary}
                        </p>
                      )}
                    </Link>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{podcast.view_count || 0}</span>
                        </div>
                        <button
                          onClick={() => handleLike(podcast.id)}
                          className={`flex items-center space-x-1 transition ${
                            likedEpisodes.has(podcast.id) ? 'text-pink-600' : 'hover:text-pink-600'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedEpisodes.has(podcast.id) ? 'fill-pink-600' : ''}`} />
                          <span>{podcast.upvote_count || 0}</span>
                        </button>
                        <button
                          onClick={() => handleShare({
                            id: podcast.id,
                            title: podcast.question?.title || '',
                            description: podcast.summary || '',
                            episode_number: 0,
                            recording_type: 'audio',
                            thumbnail_url: '',
                            duration_minutes: Math.floor((podcast.duration_seconds || 0) / 60),
                            view_count: podcast.view_count || 0,
                            published_at: podcast.created_at,
                            guest: {
                              full_name: podcast.mentor?.full_name || '',
                              professional_title: podcast.mentor?.professional_title || '',
                              avatar_url: podcast.mentor?.avatar_url || ''
                            }
                          })}
                          className="flex items-center space-x-1 hover:text-blue-600 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/questions/${podcast.question_id}`}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-slate-800 hover:to-slate-900 transition text-sm"
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
              ) : null}

              {/* Empty State */}
              {episodes.length === 0 && podcasts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <Mic className="w-20 h-20 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">No podcasts yet</h3>
                  <p className="text-slate-600 mb-6">Be the first expert to share your knowledge!</p>
                </div>
              )}
            </>
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

      {/* Share Modal */}
      {shareModalOpen && selectedEpisode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Share Episode</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-1">{selectedEpisode.title}</h4>
              <p className="text-sm text-slate-600">Episode {selectedEpisode.episode_number}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  copyLink(selectedEpisode);
                  setShareModalOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Copy Link</p>
                  <p className="text-xs text-slate-600">Share via any platform</p>
                </div>
              </button>

              <button
                onClick={() => {
                  shareViaWhatsApp(selectedEpisode);
                  setShareModalOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Share via WhatsApp</p>
                  <p className="text-xs text-slate-600">Send to your contacts</p>
                </div>
              </button>

              <button
                onClick={() => {
                  shareViaEmail(selectedEpisode);
                  setShareModalOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Share via Email</p>
                  <p className="text-xs text-slate-600">Send to email recipients</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {consultingGuest && (
        <CallBookingModal
          mentor={{ id: consultingGuest.id, full_name: consultingGuest.full_name } as any}
          isOpen={true}
          onClose={() => setConsultingGuest(null)}
        />
      )}
    </Layout>
  );
}
