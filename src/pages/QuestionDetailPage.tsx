import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, Question, Answer, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PublicLayout } from '../components/PublicLayout';
import { CallBookingModal } from '../components/CallBookingModal';
import { Eye, Share2, Video, Play, UserCircle, Calendar, ArrowBigUp, Phone, Mic, Clock, MessageCircle, FileText } from 'lucide-react';

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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
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
      <div className="bg-gradient-to-br from-blue-50 via-white to-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {question.title}
              </h1>
              {question.description && (
                <p className="text-lg text-blue-50 leading-relaxed">
                  {question.description}
                </p>
              )}
            </div>

            <div className="px-8 py-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-slate-500" />
                    <span className="font-medium">{question.view_count} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <span className="font-medium">{new Date(question.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-slate-500" />
                    <span className="font-medium">{answers.length} {answers.length === 1 ? 'answer' : 'answers'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {question.response_format === 'podcast' ? (
                      <>
                        <Mic className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-purple-600">Podcast</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-600">Q&A</span>
                      </>
                    )}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
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
                    className="flex items-center space-x-2 px-5 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  {profile?.role === 'mentor' && (
                    <button
                      onClick={handleAnswer}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold shadow-md"
                    >
                      <Video className="w-4 h-4" />
                      <span>Record Answer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">
                  Expert Responses
                </h2>
                {answers.length > 0 && (
                  <div className="text-sm text-slate-600 font-medium">
                    {answers.length} expert{answers.length === 1 ? '' : 's'} answered
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {answers.map((answer) => (
                <div
                  key={answer.id}
                  className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 hover:border-cyan-400 transition-all overflow-hidden"
                >
                  <div className="flex items-start space-x-4 p-6 border-b border-slate-200 bg-slate-50">
                    {answer.mentor.avatar_url ? (
                      <img
                        src={answer.mentor.avatar_url}
                        alt={answer.mentor.full_name}
                        className="w-16 h-16 rounded-full ring-4 ring-blue-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center ring-4 ring-blue-100">
                        <span className="text-white text-2xl font-bold">
                          {answer.mentor.full_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900">
                        {answer.mentor.full_name}
                      </h3>
                      {answer.mentor.professional_title && (
                        <p className="text-sm text-slate-600 font-medium mt-1">
                          {answer.mentor.professional_title}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(answer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {answer.duration_seconds && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDuration(answer.duration_seconds)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {answer.content_type === 'video' && answer.content_url && (
                      <div className="relative bg-slate-900 rounded-xl overflow-hidden mb-6 aspect-video flex items-center justify-center group cursor-pointer hover:bg-slate-800 transition">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20"></div>
                        <div className="relative text-center text-white">
                          <div className="w-20 h-20 rounded-full bg-white bg-opacity-90 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition shadow-2xl">
                            <Play className="w-10 h-10 text-blue-600 ml-1" />
                          </div>
                          <p className="text-sm font-semibold">Click to play video response</p>
                          {answer.duration_seconds && (
                            <p className="text-xs text-slate-300 mt-2">{formatDuration(answer.duration_seconds)}</p>
                          )}
                        </div>
                      </div>
                    )}


                    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-200 mb-4">
                      <button
                        onClick={() => handleUpvote(answer.id)}
                        className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition font-semibold ${
                          answer.user_has_upvoted
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                            : 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <ArrowBigUp className={`w-5 h-5 ${answer.user_has_upvoted ? 'fill-current' : ''}`} />
                        <span>{answer.upvote_count || 0}</span>
                        <span className="hidden sm:inline">Upvote</span>
                      </button>

                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">{answer.view_count} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="w-4 h-4" />
                          <span className="font-medium">{answer.share_count} shares</span>
                        </div>
                      </div>
                    </div>

                    {answer.mentor.is_available_for_consulting && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                        <div className="flex items-start space-x-4">
                          {answer.mentor.avatar_url ? (
                            <img
                              src={answer.mentor.avatar_url}
                              alt={answer.mentor.full_name}
                              className="w-12 h-12 rounded-full ring-2 ring-green-300"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-2 ring-green-300">
                              <span className="text-white text-lg font-bold">
                                {answer.mentor.full_name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900 mb-1">
                              Book a Consultation
                            </h4>
                            <p className="text-sm text-slate-700 mb-3">
                              Get personalized advice from {answer.mentor.full_name?.split(' ')[0]}
                            </p>
                            <button
                              onClick={() => handleCallClick(answer.mentor)}
                              className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-md"
                            >
                              <Phone className="w-4 h-4" />
                              <span>Book Call with {answer.mentor.full_name?.split(' ')[0]}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {answers.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">No answers yet</h3>
                  <p className="text-slate-600 mb-6">Be the first expert to share your knowledge!</p>
                  {profile?.role === 'mentor' && (
                    <button
                      onClick={handleAnswer}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition font-semibold shadow-md"
                    >
                      <Video className="w-5 h-5" />
                      <span>Answer This Question</span>
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {answers
                  .filter(answer => answer.mentor.is_available_for_consulting)
                  .map((answer) => (
                    <div
                      key={answer.id}
                      className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                        <div className="flex items-start space-x-4">
                          {answer.mentor.avatar_url ? (
                            <img
                              src={answer.mentor.avatar_url}
                              alt={answer.mentor.full_name}
                              className="w-16 h-16 rounded-full ring-4 ring-green-300"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-4 ring-green-300">
                              <span className="text-white text-xl font-bold">
                                {answer.mentor.full_name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                              Want Personalized Advice?
                            </h3>
                            <p className="text-slate-700 mb-4">
                              Book a one-on-one consultation with {answer.mentor.full_name}
                            </p>
                            <button
                              onClick={() => handleCallClick(answer.mentor)}
                              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-md"
                            >
                              <Phone className="w-5 h-5" />
                              <span>Consult {answer.mentor.full_name.split(' ')[0]}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Have a Question?</h3>
                  <p className="text-blue-50 text-sm mb-4">
                    Ask our community of experts and get professional video responses
                  </p>
                  <Link
                    to="/questions/ask"
                    className="block w-full text-center px-4 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                  >
                    Ask a Question
                  </Link>
                </div>
              </div>
            </div>
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
