import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

interface Series {
  id: string;
  title: string;
}

interface Mentor {
  id: string;
  full_name: string;
  professional_title: string;
}

interface Question {
  question_text: string;
  answer_text: string;
  is_ai_generated: boolean;
}

export function CreateEpisodePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [series, setSeries] = useState<Series[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [moderators, setModerators] = useState<Mentor[]>([]);

  const [seriesId, setSeriesId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guestId, setGuestId] = useState('');
  const [moderatorId, setModeratorId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [recordingType, setRecordingType] = useState<'video' | 'audio'>('video');
  const [scheduledAt, setScheduledAt] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [seriesResult, mentorsResult, moderatorsResult] = await Promise.all([
      supabase.from('podcast_series').select('id, title').eq('status', 'active'),
      supabase.from('profiles').select('id, full_name, professional_title').eq('role', 'mentor'),
      supabase
        .from('podcast_moderators')
        .select('user_id, profiles(id, full_name, professional_title)')
    ]);

    if (seriesResult.data) setSeries(seriesResult.data);
    if (mentorsResult.data) setMentors(mentorsResult.data);
    if (moderatorsResult.data) {
      const mods = moderatorsResult.data
        .map((m: any) => m.profiles)
        .filter(Boolean);
      setModerators(mods);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', answer_text: '', is_ai_generated: false }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | boolean) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const generateAIQuestions = async () => {
    const aiQuestions: Question[] = [
      {
        question_text: 'Can you tell us about your professional journey and what led you to your current role?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'What are some of the biggest challenges you\'ve faced in your career, and how did you overcome them?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'What advice would you give to someone just starting out in your industry?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'How do you stay current with the latest trends and developments in your field?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'What do you think is the most important skill for success in your profession?',
        answer_text: '',
        is_ai_generated: true
      }
    ];

    setQuestions([...questions, ...aiQuestions]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: episode, error: episodeError } = await supabase
        .from('podcast_episodes')
        .insert({
          series_id: seriesId || null,
          title,
          description,
          guest_id: guestId,
          moderator_id: moderatorId || user!.id,
          episode_number: parseInt(episodeNumber),
          recording_type: recordingType,
          scheduled_at: scheduledAt || null,
          status: 'draft'
        })
        .select()
        .single();

      if (episodeError) throw episodeError;

      if (questions.length > 0 && episode) {
        const questionsData = questions.map((q, index) => ({
          episode_id: episode.id,
          question_text: q.question_text,
          answer_text: q.answer_text || null,
          question_order: index + 1,
          is_ai_generated: q.is_ai_generated,
          created_by: user!.id
        }));

        const { error: questionsError } = await supabase
          .from('podcast_questions')
          .insert(questionsData);

        if (questionsError) throw questionsError;
      }

      navigate(`/podcasts/episode/${episode.id}/edit`);
    } catch (err: any) {
      setError(err.message || 'Failed to create episode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Podcast Episode</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Episode Details</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Podcast Series (Optional)
              </label>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Standalone Episode</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Episode Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Journey from Developer to CTO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Episode description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Guest (Mentor) *
                </label>
                <select
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a mentor</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} {m.professional_title && `- ${m.professional_title}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Moderator
                </label>
                <select
                  value={moderatorId}
                  onChange={(e) => setModeratorId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Me (Current User)</option>
                  {moderators.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Episode Number
                </label>
                <input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recording Type
                </label>
                <select
                  value={recordingType}
                  onChange={(e) => setRecordingType(e.target.value as 'video' | 'audio')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={generateAIQuestions}
                  className="flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Questions</span>
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center space-x-2 text-sm bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Question {index + 1}
                          {q.is_ai_generated && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              AI Generated
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={q.question_text}
                          onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter question..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Pre-filled Answer (Teleprompter)
                        </label>
                        <textarea
                          value={q.answer_text}
                          onChange={(e) => updateQuestion(index, 'answer_text', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Optional: Add answer text that will appear in the teleprompter..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="ml-3 text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-600">
                    No questions added yet. Add questions manually or generate them with AI.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Episode'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/podcasts/manage')}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
