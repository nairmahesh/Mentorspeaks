import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, Question, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Send, Copy, Check, UserPlus } from 'lucide-react';

export function SeekOpinionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<string>('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadQuestion();
      loadMentors();
    }
  }, [id]);

  const loadQuestion = async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (data) setQuestion(data);
  };

  const loadMentors = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor')
      .order('full_name');
    if (data) setMentors(data);
  };

  const generateShareLink = async () => {
    if (!question || !user) return;

    setError('');
    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('seek_opinions')
        .insert({
          question_id: question.id,
          requester_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const link = `${window.location.origin}/seek-opinion/${data.share_token}`;
      setShareLink(link);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const inviteMentor = async () => {
    if (!question || !user || !selectedMentor) return;

    setError('');
    setLoading(true);

    try {
      const { error: inviteError } = await supabase.from('invitations').insert({
        question_id: question.id,
        inviter_id: user.id,
        invitee_id: selectedMentor,
        status: 'pending',
      });

      if (inviteError) throw inviteError;

      setSuccess(true);
      setSelectedMentor('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!question) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Seek Opinion</h1>
          <p className="text-slate-600">Invite specific mentors or share externally</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-sm font-medium text-slate-600 mb-2">Your Question</h2>
          <h3 className="text-xl font-bold text-slate-900">{question.title}</h3>
          {question.description && (
            <p className="text-slate-600 mt-2">{question.description}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Invitation sent successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Invite Platform Mentor</h2>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              Select a mentor from effyMentor to answer your question
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="mentor" className="block text-sm font-medium text-slate-700 mb-2">
                  Select Mentor
                </label>
                <select
                  id="mentor"
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a mentor...</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.full_name}
                      {mentor.professional_title && ` - ${mentor.professional_title}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={inviteMentor}
                disabled={loading || !selectedMentor}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Send className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-slate-900">Share Externally</h2>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              Generate a shareable link to invite external professionals
            </p>

            {!shareLink ? (
              <button
                onClick={generateShareLink}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Generating...' : 'Generate Share Link'}</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Shareable Link
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Tip:</strong> Share this link on LinkedIn, WhatsApp, email, or any platform to invite external mentors to answer your question.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
