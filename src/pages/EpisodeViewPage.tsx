import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import { CallBookingModal } from '../components/CallBookingModal';
import { Share2, Linkedin, Facebook, Copy, CheckCircle, Code, Heart, Calendar, Play, Phone, MessageCircle } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  episode_number: number;
  recording_type: string;
  recording_url: string | null;
  thumbnail_url: string | null;
  scheduled_at: string;
  status: string;
  guest_id: string;
  guest: {
    id: string;
    full_name: string;
    professional_title: string;
    bio: string;
    linkedin_url: string;
    avatar_url: string;
    is_available_for_consulting: boolean;
  };
  moderator: {
    full_name: string;
  };
  series: {
    title: string;
  } | null;
}

interface Question {
  id: string;
  question_text: string;
  answer_text: string;
  question_order: number;
}

export function EpisodeViewPage() {
  const { episodeId } = useParams();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  useEffect(() => {
    loadEpisode();
  }, [episodeId]);

  const loadEpisode = async () => {
    if (!episodeId) return;

    try {
      const { data: episodeData, error: epError } = await supabase
        .from('podcast_episodes')
        .select(`
          *,
          guest:profiles!podcast_episodes_guest_id_fkey(id, full_name, professional_title, bio, linkedin_url, avatar_url, is_available_for_consulting),
          moderator:profiles!podcast_episodes_moderator_id_fkey(full_name),
          series:podcast_series(title)
        `)
        .eq('id', episodeId)
        .single();

      if (epError) throw epError;

      setEpisode(episodeData as any);

      const { data: questionsData, error: qError } = await supabase
        .from('podcast_questions')
        .select('*')
        .eq('episode_id', episodeId)
        .order('question_order');

      if (qError) throw qError;

      setQuestions(questionsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load episode');
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = window.location.href;
  const embedCode = `<iframe src="${currentUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading episode...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !episode) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Episode Not Found</h1>
          <p className="text-slate-600">{error || 'The episode you are looking for does not exist.'}</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-slate-900 rounded-xl overflow-hidden mb-6 shadow-xl aspect-video">
                {episode.recording_url ? (
                  <video
                    controls
                    className="w-full h-full"
                    poster={episode.thumbnail_url || undefined}
                  >
                    <source src={episode.recording_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="text-center">
                      <Play className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">Recording coming soon</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                  {episode.series && (
                    <div className="text-sm text-blue-100 font-semibold mb-1">
                      {episode.series.title} - Episode {episode.episode_number}
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-white">{episode.title}</h1>
                </div>

                <div className="p-6">
                  <p className="text-slate-600 leading-relaxed mb-4">{episode.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setLiked(!liked);
                        setLikeCount(prev => liked ? prev - 1 : prev + 1);
                      }}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition font-semibold border-2 ${
                        liked
                          ? 'bg-red-50 border-red-500 text-red-600'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                      <span>{liked ? 'Liked' : 'Like'}</span>
                      {likeCount > 0 && <span className="text-sm">({likeCount})</span>}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center space-x-2 border-2 border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition font-semibold"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </button>

                      {showShareMenu && (
                        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-10">
                          <h3 className="font-semibold text-slate-900 mb-3">Share this episode</h3>
                          <div className="space-y-2">
                            <button
                              onClick={shareToLinkedIn}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-slate-50 rounded-lg transition"
                            >
                              <Linkedin className="w-5 h-5 text-blue-600" />
                              <span className="text-slate-700">Share on LinkedIn</span>
                            </button>
                            <button
                              onClick={shareToFacebook}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-slate-50 rounded-lg transition"
                            >
                              <Facebook className="w-5 h-5 text-blue-600" />
                              <span className="text-slate-700">Share on Facebook</span>
                            </button>
                            <button
                              onClick={() => copyToClipboard(currentUrl)}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-slate-50 rounded-lg transition"
                            >
                              {copied ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Copy className="w-5 h-5 text-slate-600" />
                              )}
                              <span className="text-slate-700">
                                {copied ? 'Copied!' : 'Copy Link'}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setShowEmbedCode(!showEmbedCode);
                                setShowShareMenu(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-slate-50 rounded-lg transition"
                            >
                              <Code className="w-5 h-5 text-slate-600" />
                              <span className="text-slate-700">Embed Code</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {showEmbedCode && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-2">Embed this episode</h3>
                      <p className="text-sm text-slate-600 mb-3">
                        Copy and paste this code into your website:
                      </p>
                      <div className="relative">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
                          {embedCode}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(embedCode)}
                          className="absolute top-2 right-2 flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {episode.guest.is_available_for_consulting && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                    <div className="flex items-start space-x-4">
                      {episode.guest.avatar_url ? (
                        <img
                          src={episode.guest.avatar_url}
                          alt={episode.guest.full_name}
                          className="w-16 h-16 rounded-full ring-4 ring-green-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-4 ring-green-300">
                          <span className="text-white text-xl font-bold">
                            {episode.guest.full_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          Want Personalized Advice?
                        </h3>
                        <p className="text-slate-700 mb-4">
                          Book a one-on-one consultation with {episode.guest.full_name} to discuss your specific questions
                        </p>
                        <button
                          onClick={() => setIsCallModalOpen(true)}
                          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-md"
                        >
                          <Phone className="w-5 h-5" />
                          <span>Book Consultation with {episode.guest.full_name.split(' ')[0]}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Questions & Answers</h2>
                  {questions.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium">{questions.length} questions</span>
                    </div>
                  )}
                </div>

                {questions.length > 0 ? (
                  <div className="space-y-6">
                    {questions.map((question, index) => (
                      <div key={question.id} className="bg-slate-50 rounded-xl p-5 border-l-4 border-blue-600">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="font-bold text-slate-900 text-lg flex-1">
                            {question.question_text}
                          </h3>
                        </div>
                        {question.answer_text ? (
                          <div className="ml-10">
                            <div className="flex items-start space-x-2 mb-2">
                              <div className="w-1 h-6 bg-gradient-to-b from-cyan-600 to-blue-600 rounded-full mt-1"></div>
                              <h4 className="font-semibold text-slate-900">Answer</h4>
                            </div>
                            <p className="text-slate-700 leading-relaxed ml-3">{question.answer_text}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic ml-10">Answer pending</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No questions added yet</p>
                    <p className="text-slate-400 text-sm mt-1">Questions will appear here once added</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4">
                    <h2 className="text-lg font-bold text-white">Guest Speaker</h2>
                  </div>

                  <div className="p-6">
                    <div className="text-center mb-4">
                      {episode.guest.avatar_url ? (
                        <img
                          src={episode.guest.avatar_url}
                          alt={episode.guest.full_name}
                          className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-blue-100"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-4 ring-blue-100">
                          <span className="text-3xl font-bold text-white">
                            {episode.guest.full_name.charAt(0)}
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {episode.guest.full_name}
                      </h3>

                      {episode.guest.professional_title && (
                        <p className="text-blue-600 font-semibold text-sm">
                          {episode.guest.professional_title}
                        </p>
                      )}
                    </div>

                    {episode.guest.bio && (
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {episode.guest.bio}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {episode.guest.is_available_for_consulting && (
                        <button
                          onClick={() => setIsCallModalOpen(true)}
                          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-md"
                        >
                          <Phone className="w-5 h-5" />
                          <span>Book Consultation</span>
                        </button>
                      )}

                      {episode.guest.linkedin_url && (
                        <a
                          href={episode.guest.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center space-x-2 border-2 border-blue-600 text-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition font-semibold"
                        >
                          <Linkedin className="w-5 h-5" />
                          <span>Connect on LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Explore More</h3>
                  <p className="text-blue-50 text-sm mb-4">
                    Discover more expert insights and podcast episodes
                  </p>
                  <Link
                    to="/podcasts"
                    className="block w-full text-center px-4 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                  >
                    Browse Podcasts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {episode.guest.is_available_for_consulting && (
        <CallBookingModal
          mentor={episode.guest}
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
        />
      )}
    </PublicLayout>
  );
}
