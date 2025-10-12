import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import { Share2, Linkedin, Facebook, Instagram, Copy, CheckCircle, Code } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  episode_number: number;
  recording_type: string;
  scheduled_at: string;
  status: string;
  guest: {
    full_name: string;
    professional_title: string;
    bio: string;
    linkedin_url: string;
  };
  moderator: {
    full_name: string;
  };
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
          guest:profiles!podcast_episodes_guest_id_fkey(full_name, professional_title, bio, linkedin_url),
          moderator:profiles!podcast_episodes_moderator_id_fkey(full_name)
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold mb-2">Episode {episode.episode_number}</div>
                <h1 className="text-4xl font-bold mb-4">{episode.title}</h1>
                <p className="text-blue-100 text-lg">{episode.description}</p>
              </div>
              <div className="relative ml-4">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10">
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
          </div>

          {showEmbedCode && (
            <div className="bg-slate-50 border-t border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Embed this episode</h3>
              <p className="text-sm text-slate-600 mb-3">
                Copy and paste this code into your website or blog:
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

          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Guest Profile</h2>
            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {episode.guest.full_name}
              </h3>
              {episode.guest.professional_title && (
                <p className="text-blue-600 font-medium mb-3">
                  {episode.guest.professional_title}
                </p>
              )}
              {episode.guest.bio && (
                <p className="text-slate-700 mb-4">{episode.guest.bio}</p>
              )}
              {episode.guest.linkedin_url && (
                <a
                  href={episode.guest.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>Connect on LinkedIn</span>
                </a>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Q&A</h2>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border-l-4 border-blue-600 pl-6">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Q{index + 1}: {question.question_text}
                  </h3>
                  {question.answer_text ? (
                    <p className="text-slate-700 leading-relaxed">{question.answer_text}</p>
                  ) : (
                    <p className="text-slate-400 italic">No answer provided yet</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
