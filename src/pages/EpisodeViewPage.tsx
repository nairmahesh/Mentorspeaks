import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import { CallBookingModal } from '../components/CallBookingModal';
import { Share2, Linkedin, Facebook, Copy, CheckCircle, Code, Heart, Calendar, Play, Phone, MessageCircle, Send, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

interface MentorAnswer {
  id: string;
  answer_text: string;
  upvotes: number;
  created_at: string;
  mentor: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    professional_title: string;
    is_available_for_consulting: boolean;
  };
  user_has_upvoted?: boolean;
}

interface CommunityQuestion {
  id: string;
  question_text: string;
  answer_text: string | null;
  answered_at: string | null;
  upvotes: number;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
  user_has_upvoted?: boolean;
  mentor_answers?: MentorAnswer[];
}

export function EpisodeViewPage() {
  const { episodeId } = useParams();
  const { user } = useAuth();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [consultingMentor, setConsultingMentor] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadEpisode();
    if (user) {
      loadUserProfile();
    }
  }, [episodeId, user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    setUserProfile(data);
  };

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

      await loadQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to load episode');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!episodeId) return;

    try {
      const { data: questionsData, error: qError } = await supabase
        .from('episode_questions')
        .select(`
          *,
          user:profiles!episode_questions_user_id_fkey(full_name, avatar_url)
        `)
        .eq('episode_id', episodeId)
        .order('upvotes', { ascending: false });

      if (qError) throw qError;

      // Load mentor answers for each question
      const questionsWithAnswers = await Promise.all(
        (questionsData || []).map(async (q) => {
          const { data: answers } = await supabase
            .from('episode_question_answers')
            .select(`
              *,
              mentor:profiles!episode_question_answers_mentor_id_fkey(id, full_name, avatar_url, professional_title, is_available_for_consulting)
            `)
            .eq('question_id', q.id)
            .order('upvotes', { ascending: false });

          return { ...q, mentor_answers: answers || [] };
        })
      );

      // Check if user has upvoted each question and answer
      if (user) {
        const { data: questionUpvotes } = await supabase
          .from('episode_question_upvotes')
          .select('question_id')
          .eq('user_id', user.id);

        const { data: answerUpvotes } = await supabase
          .from('episode_answer_upvotes')
          .select('answer_id')
          .eq('user_id', user.id);

        const upvotedQuestionIds = new Set(questionUpvotes?.map(u => u.question_id));
        const upvotedAnswerIds = new Set(answerUpvotes?.map(u => u.answer_id));

        const questionsWithUpvotes = questionsWithAnswers.map(q => ({
          ...q,
          user_has_upvoted: upvotedQuestionIds.has(q.id),
          mentor_answers: q.mentor_answers.map((a: any) => ({
            ...a,
            user_has_upvoted: upvotedAnswerIds.has(a.id)
          }))
        }));

        setQuestions(questionsWithUpvotes as any);
      } else {
        setQuestions(questionsWithAnswers as any);
      }
    } catch (err: any) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleAskQuestion = async () => {
    if (!user || !newQuestion.trim() || !episodeId) return;

    setSubmittingQuestion(true);
    try {
      const { error } = await supabase
        .from('episode_questions')
        .insert({
          episode_id: episodeId,
          user_id: user.id,
          question_text: newQuestion.trim()
        });

      if (error) throw error;

      setNewQuestion('');
      await loadQuestions();
    } catch (err: any) {
      alert('Failed to post question: ' + err.message);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleUpvote = async (questionId: string, currentlyUpvoted: boolean) => {
    if (!user) {
      alert('Please sign in to upvote questions');
      return;
    }

    try {
      if (currentlyUpvoted) {
        await supabase
          .from('episode_question_upvotes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('episode_question_upvotes')
          .insert({
            question_id: questionId,
            user_id: user.id
          });
      }

      await loadQuestions();
    } catch (err: any) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleAnswerQuestion = async (questionId: string) => {
    if (!user || !answerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      const { error } = await supabase
        .from('episode_question_answers')
        .insert({
          question_id: questionId,
          mentor_id: user.id,
          answer_text: answerText.trim()
        });

      if (error) throw error;

      setAnswerText('');
      setAnsweringQuestionId(null);
      await loadQuestions();
    } catch (err: any) {
      alert('Failed to post answer: ' + err.message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleUpvoteAnswer = async (answerId: string, currentlyUpvoted: boolean) => {
    if (!user) {
      alert('Please sign in to upvote answers');
      return;
    }

    try {
      if (currentlyUpvoted) {
        await supabase
          .from('episode_answer_upvotes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('episode_answer_upvotes')
          .insert({
            answer_id: answerId,
            user_id: user.id
          });
      }

      await loadQuestions();
    } catch (err: any) {
      console.error('Failed to upvote answer:', err);
    }
  };

  const isMentor = userProfile?.role === 'mentor' || userProfile?.role === 'ambassador' || userProfile?.role === 'admin';

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
                    {episode.guest.is_available_for_consulting && (
                      <button
                        onClick={() => setIsCallModalOpen(true)}
                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-semibold"
                      >
                        <Calendar className="w-5 h-5" />
                        <span>Consult {episode.guest.full_name.split(' ')[0]}</span>
                      </button>
                    )}

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

                {user && (
                  <div className="mb-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <h3 className="font-semibold text-slate-900 mb-3">Ask {episode.guest.full_name.split(' ')[0]} a Question</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                        placeholder="Type your question here..."
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submittingQuestion}
                      />
                      <button
                        onClick={handleAskQuestion}
                        disabled={submittingQuestion || !newQuestion.trim()}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        <span>Ask</span>
                      </button>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                    <p className="text-slate-600">
                      <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link> to ask questions
                    </p>
                  </div>
                )}

                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleUpvote(question.id, question.user_has_upvoted || false)}
                              className={`p-2 rounded-lg transition ${
                                question.user_has_upvoted
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-600 hover:bg-blue-50'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-slate-700">{question.upvotes}</span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {question.user.avatar_url ? (
                                <img
                                  src={question.user.avatar_url}
                                  alt={question.user.full_name}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                  {question.user.full_name.charAt(0)}
                                </div>
                              )}
                              <span className="text-sm font-semibold text-slate-900">{question.user.full_name}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(question.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-900 font-medium mb-3">{question.question_text}</p>

                            {/* Guest's primary answer */}
                            {question.answer_text && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  {episode.guest.avatar_url ? (
                                    <img
                                      src={episode.guest.avatar_url}
                                      alt={episode.guest.full_name}
                                      className="w-6 h-6 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                                      {episode.guest.full_name.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-sm font-semibold text-green-700">{episode.guest.full_name}</span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(question.answered_at!).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{question.answer_text}</p>
                              </div>
                            )}

                            {/* Mentor answers */}
                            {question.mentor_answers && question.mentor_answers.length > 0 && (
                              <div className="space-y-3 mb-3">
                                {question.mentor_answers.map((answer) => (
                                  <div key={answer.id} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                                    <div className="flex items-start gap-3">
                                      <div className="flex flex-col items-center gap-1">
                                        <button
                                          onClick={() => handleUpvoteAnswer(answer.id, answer.user_has_upvoted || false)}
                                          className={`p-1.5 rounded-lg transition ${
                                            answer.user_has_upvoted
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                                          }`}
                                        >
                                          <ThumbsUp className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold text-slate-700">{answer.upvotes}</span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          {answer.mentor.avatar_url ? (
                                            <img
                                              src={answer.mentor.avatar_url}
                                              alt={answer.mentor.full_name}
                                              className="w-6 h-6 rounded-full"
                                            />
                                          ) : (
                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                              {answer.mentor.full_name.charAt(0)}
                                            </div>
                                          )}
                                          <div>
                                            <span className="text-sm font-semibold text-blue-700">{answer.mentor.full_name}</span>
                                            <span className="text-xs text-slate-500 block">{answer.mentor.professional_title}</span>
                                          </div>
                                          <span className="text-xs text-slate-500 ml-auto">
                                            {new Date(answer.created_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed mb-3">{answer.answer_text}</p>

                                        {answer.mentor.is_available_for_consulting && (
                                          <button
                                            onClick={() => setConsultingMentor({ id: answer.mentor.id, name: answer.mentor.full_name })}
                                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                                          >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>Book Consultation with {answer.mentor.full_name.split(' ')[0]}</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply button for mentors */}
                            {isMentor && (
                              <div className="mt-3">
                                {answeringQuestionId === question.id ? (
                                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <textarea
                                      value={answerText}
                                      onChange={(e) => setAnswerText(e.target.value)}
                                      placeholder="Share your insights..."
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 min-h-[80px]"
                                      disabled={submittingAnswer}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleAnswerQuestion(question.id)}
                                        disabled={submittingAnswer || !answerText.trim()}
                                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Send className="w-4 h-4" />
                                        <span>Post Answer</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setAnsweringQuestionId(null);
                                          setAnswerText('');
                                        }}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAnsweringQuestionId(question.id)}
                                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Add Your Insight</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {!question.answer_text && (!question.mentor_answers || question.mentor_answers.length === 0) && (
                              <p className="text-slate-400 italic text-sm">Waiting for mentor responses...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No questions yet</p>
                    <p className="text-slate-400 text-sm mt-1">Be the first to ask {episode.guest.full_name.split(' ')[0]} a question!</p>
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

      <CallBookingModal
        mentor={episode.guest}
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
      />

      {consultingMentor && (
        <CallBookingModal
          mentor={{ id: consultingMentor.id, full_name: consultingMentor.name } as any}
          isOpen={true}
          onClose={() => setConsultingMentor(null)}
        />
      )}
    </PublicLayout>
  );
}
