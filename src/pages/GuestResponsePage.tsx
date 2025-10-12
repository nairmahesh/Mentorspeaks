import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import { Save, CheckCircle } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
}

interface Question {
  id: string;
  question_text: string;
  answer_text: string;
  question_order: number;
}

interface Invitation {
  id: string;
  status: string;
  episode: Episode;
}

export function GuestResponsePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    if (!token) return;

    try {
      const { data: invitationData, error: invError } = await supabase
        .from('episode_invitations')
        .select(`
          id,
          status,
          episode:episode_id(id, title, description)
        `)
        .eq('invitation_token', token)
        .single();

      if (invError) throw invError;

      setInvitation(invitationData as any);

      const { data: questionsData, error: qError } = await supabase
        .from('podcast_questions')
        .select('*')
        .eq('episode_id', (invitationData as any).episode.id)
        .order('question_order');

      if (qError) throw qError;

      setQuestions(questionsData || []);

      const initialAnswers: { [key: string]: string } = {};
      questionsData?.forEach((q) => {
        initialAnswers[q.id] = q.answer_text || '';
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.message || 'Invalid invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      for (const question of questions) {
        const answer = answers[question.id];
        if (answer) {
          const { error: updateError } = await supabase
            .from('podcast_questions')
            .update({ answer_text: answer })
            .eq('id', question.id);

          if (updateError) throw updateError;
        }
      }

      const { error: invError } = await supabase
        .from('episode_invitations')
        .update({
          status: 'responded',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitation!.id);

      if (invError) throw invError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save responses');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error && !invitation) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Invalid Invitation</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </PublicLayout>
    );
  }

  if (success) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h1>
          <p className="text-slate-600 text-lg mb-8">
            Your responses have been submitted successfully. We'll be in touch soon about the podcast recording.
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Podcast Episode: {invitation?.episode.title}
          </h1>
          <p className="text-slate-600">{invitation?.episode.description}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Please answer the following questions for the podcast episode.</p>
          <p className="text-sm mt-1">Your responses will help guide the conversation during recording.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Question {index + 1}: {question.question_text}
              </label>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your answer here..."
              />
            </div>
          ))}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Submit Responses'}</span>
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
