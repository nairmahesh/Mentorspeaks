import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { Copy, Mail, MessageCircle, Check, ExternalLink, ArrowLeft } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  episode_number: number;
  guest: {
    full_name: string;
    email: string;
    professional_title: string;
  };
}

export function ShareEpisodePage() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadEpisode();
  }, [episodeId]);

  const loadEpisode = async () => {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select(`
        id,
        title,
        description,
        episode_number,
        guest:guest_id(full_name, email, professional_title)
      `)
      .eq('id', episodeId)
      .single();

    if (data) setEpisode(data as any);
    setLoading(false);
  };

  const recordingLink = `https://effymentor.com/podcasts/record/${episodeId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(recordingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Podcast Recording Invitation: ${episode?.title}`);
    const body = encodeURIComponent(
      `Hi ${episode?.guest.full_name},\n\n` +
      `We're excited to have you as a guest on our podcast!\n\n` +
      `Episode: ${episode?.title}\n` +
      `Episode Number: ${episode?.episode_number}\n\n` +
      `Please use the link below to record your responses:\n` +
      `${recordingLink}\n\n` +
      `You can preview the questions, record your answers, and submit when ready.\n\n` +
      `Looking forward to hearing your insights!\n\n` +
      `Best regards`
    );
    window.location.href = `mailto:${episode?.guest.email}?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hi ${episode?.guest.full_name}! 👋\n\n` +
      `We're excited to have you as a guest on our podcast!\n\n` +
      `*${episode?.title}* (Episode ${episode?.episode_number})\n\n` +
      `Please record your responses here:\n` +
      `${recordingLink}\n\n` +
      `Looking forward to your insights! 🎙️`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </Layout>
    );
  }

  if (!episode) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Episode Not Found</h1>
          <Link to="/podcasts/manage" className="text-orange-600 hover:text-orange-700">
            Back to Podcast Management
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/podcasts/manage')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Management</span>
        </button>

        <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl p-8 mb-8 border border-green-200">
          <div className="flex items-center space-x-2 text-green-700 mb-4">
            <Check className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Episode Created Successfully!</h1>
          </div>
          <p className="text-slate-700">
            Your podcast episode has been created. Now share it with your guest to record their responses.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Episode Details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-slate-700">Title:</span>
              <p className="text-slate-900 mt-1">{episode.title}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Episode Number:</span>
              <p className="text-slate-900 mt-1">#{episode.episode_number}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Guest:</span>
              <p className="text-slate-900 mt-1">
                {episode.guest.full_name} • {episode.guest.professional_title}
              </p>
            </div>
            {episode.description && (
              <div>
                <span className="font-semibold text-slate-700">Description:</span>
                <p className="text-slate-600 mt-1">{episode.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Share Recording Link</h2>
          <p className="text-slate-600 mb-6">
            Send this link to {episode.guest.full_name} so they can record their podcast responses.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={recordingLink}
                readOnly
                className="flex-1 bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleEmailShare}
              className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
            >
              <Mail className="w-5 h-5" />
              <span>Share via Email</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share via WhatsApp</span>
            </button>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-orange-600 flex-shrink-0">1.</span>
                <span>The guest receives the recording link</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-orange-600 flex-shrink-0">2.</span>
                <span>They can preview the questions and prepare their responses</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-orange-600 flex-shrink-0">3.</span>
                <span>They record video/audio answers for each question</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-orange-600 flex-shrink-0">4.</span>
                <span>They can preview, modify, and re-record before submitting</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-orange-600 flex-shrink-0">5.</span>
                <span>You'll be notified when they submit their responses</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <Link
            to={`/podcasts/record/${episodeId}`}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Preview Recording Page</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
