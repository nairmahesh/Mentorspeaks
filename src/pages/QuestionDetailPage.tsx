import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, Question, Answer, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PublicLayout } from '../components/PublicLayout';
import { CallBookingModal } from '../components/CallBookingModal';
import { Eye, Share2, Video, Play, UserCircle, Calendar, ArrowBigUp, Phone } from 'lucide-react';

type AnswerWithMentor = Answer & {
  mentor: Profile;
  user_has_upvoted?: boolean;
};

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<AnswerWithMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestion();
      loadAnswers();
      incrementViewCount();
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

  const loadAnswers = async () => {
    const { data } = await supabase
      .from('answers')
      .select('*, mentor:profiles!answers_mentor_id_fkey(*)')
      .eq('question_id', id)
      .eq('status', 'published')
      .order('upvote_count', { ascending: false });

    if (data && user) {
      const answerIds = data.map(a => a.id);
      const { data: upvotes } = await supabase
        .from('answer_upvotes')
        .select('answer_id')
        .in('answer_id', answerIds)
        .eq('user_id', user.id);

      const upvotedIds = new Set(upvotes?.map(u => u.answer_id) || []);
      const answersWithUpvotes = data.map(answer => ({
        ...answer,
        user_has_upvoted: upvotedIds.has(answer.id)
      }));
      setAnswers(answersWithUpvotes as AnswerWithMentor[]);
    } else if (data) {
      setAnswers(data as AnswerWithMentor[]);
    }
    setLoading(false);
  };

  const incrementViewCount = async () => {
    await supabase.rpc('increment_question_views', { question_id: id });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleAnswer = () => {
    if (user) {
      navigate(`/questions/${question!.id}/answer`);
    } else {
      navigate('/login');
    }
  };

  const handleUpvote = async (answerId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const answer = answers.find(a => a.id === answerId);
    if (!answer) return;

    if (answer.user_has_upvoted) {
      await supabase
        .from('answer_upvotes')
        .delete()
        .eq('answer_id', answerId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('answer_upvotes')
        .insert({ answer_id: answerId, user_id: user.id });
    }

    loadAnswers();
  };

  const handleCallClick = (mentor: Profile) => {
    setSelectedMentor(mentor);
    setIsCallModalOpen(true);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!question) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Question not found</h2>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {question.title}
              </h1>
              {question.description && (
                <p className="text-lg text-slate-600 leading-relaxed">
                  {question.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{question.view_count} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(question.created_at).toLocaleDateString()}</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  question.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : question.status === 'answered'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {question.status}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {profile?.role === 'mentor' && (
                <button
                  onClick={handleAnswer}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Answer</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Answers ({answers.length})
          </h2>

          <div className="space-y-6">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start space-x-4 mb-4">
                  {answer.mentor.avatar_url ? (
                    <img
                      src={answer.mentor.avatar_url}
                      alt={answer.mentor.full_name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-slate-400" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {answer.mentor.full_name}
                    </h3>
                    {answer.mentor.professional_title && (
                      <p className="text-sm text-slate-600">
                        {answer.mentor.professional_title}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(answer.created_at).toLocaleDateString()}
                  </span>
                </div>

                {answer.content_type === 'video' && answer.content_url && (
                  <div className="bg-slate-900 rounded-lg overflow-hidden mb-4 aspect-video flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-2 opacity-75" />
                      <p className="text-sm">Video player placeholder</p>
                      <p className="text-xs text-slate-400 mt-1">{answer.duration_seconds}s</p>
                    </div>
                  </div>
                )}

                {answer.transcript && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">Transcript</h4>
                    <p className="text-slate-700 leading-relaxed">{answer.transcript}</p>
                  </div>
                )}

                {answer.summary && (
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">Summary</h4>
                    <p className="text-slate-700 leading-relaxed">{answer.summary}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleUpvote(answer.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                        answer.user_has_upvoted
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <ArrowBigUp className="w-5 h-5" />
                      <span className="font-medium">{answer.upvote_count || 0}</span>
                      <span className="hidden sm:inline">Upvote</span>
                    </button>

                    <button
                      onClick={() => handleCallClick(answer.mentor)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call with {answer.mentor.full_name?.split(' ')[0]}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span>{answer.view_count} views</span>
                    <span>{answer.share_count} shares</span>
                  </div>
                </div>
              </div>
            ))}

            {answers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-600">No answers yet. Be the first to answer!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedMentor && (
        <CallBookingModal
          mentor={selectedMentor}
          isOpen={isCallModalOpen}
          onClose={() => {
            setIsCallModalOpen(false);
            setSelectedMentor(null);
          }}
        />
      )}
    </PublicLayout>
  );
}
