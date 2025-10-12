import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Layout } from '../components/Layout';
import {
  TrendingUp,
  Sparkles,
  MessageSquare,
  Users,
  Clock,
  ArrowRight,
  Star,
  Eye,
  ThumbsUp,
  Mic,
  MapPin,
  BookOpen,
  Settings,
  Play,
  Headphones
} from 'lucide-react';

interface Activity {
  id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata?: any;
}

interface RecommendedMentor {
  id: string;
  full_name: string;
  professional_title?: string;
  avatar_url?: string;
  is_stalwart: boolean;
  total_answers: number;
}

interface TrendingQuestion {
  id: string;
  title: string;
  view_count: number;
  answer_count: number;
  created_at: string;
  industry?: { name: string; icon_name: string };
}

interface RecentAnswer {
  id: string;
  summary: string;
  upvote_count: number;
  view_count: number;
  question: { id: string; title: string };
  mentor: { id: string; full_name: string; avatar_url?: string };
}

export function PersonalizedFeedPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [recommendedMentors, setRecommendedMentors] = useState<RecommendedMentor[]>([]);
  const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([]);
  const [recentAnswers, setRecentAnswers] = useState<RecentAnswer[]>([]);
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalizedFeed();
    }
  }, [user]);

  const loadPersonalizedFeed = async () => {
    if (!user) return;

    try {
      const [
        activityRes,
        preferencesRes,
        interestsRes,
        mentorsRes,
        questionsRes,
        answersRes
      ] = await Promise.all([
        supabase
          .from('user_activity_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('user_feed_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_interests')
          .select('*, industry:industries(*)')
          .eq('user_id', user.id),
        supabase.rpc('get_recommended_mentors', { p_user_id: user.id, p_limit: 6 }),
        supabase
          .from('questions')
          .select('*, industry:industries(name, icon_name)')
          .eq('status', 'published')
          .order('view_count', { ascending: false })
          .limit(6),
        supabase
          .from('answers')
          .select('*, question:questions(id, title), mentor:profiles(id, full_name, avatar_url)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6)
      ]);

      if (activityRes.data) setRecentActivity(activityRes.data);
      if (interestsRes.data) setUserInterests(interestsRes.data);

      if (preferencesRes.data) {
        setHasCompletedOnboarding(preferencesRes.data.onboarding_completed);
      } else {
        setHasCompletedOnboarding(false);
      }

      if (mentorsRes.data && mentorsRes.data.length > 0) {
        const mentorIds = mentorsRes.data.map((m: any) => m.mentor_id);
        const { data: mentorProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', mentorIds);

        if (mentorProfiles) {
          const sortedMentors = mentorIds
            .map((id: string) => mentorProfiles.find((m: any) => m.id === id))
            .filter(Boolean);
          setRecommendedMentors(sortedMentors as RecommendedMentor[]);
        }
      }

      if (questionsRes.data) setTrendingQuestions(questionsRes.data as any);
      if (answersRes.data) setRecentAnswers(answersRes.data as any);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType: string, entityType?: string, entityId?: string) => {
    if (!user) return;

    await supabase.from('user_activity_log').insert({
      user_id: user.id,
      activity_type: activityType,
      entity_type: entityType,
      entity_id: entityId
    });
  };

  const getActivityMessage = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'view_question':
        return 'You viewed a question';
      case 'ask_question':
        return 'You asked a question';
      case 'upvote':
        return 'You upvoted an answer';
      case 'mentor_view':
        return 'You viewed a mentor profile';
      case 'chapter_join':
        return 'You joined a chapter';
      default:
        return activity.activity_type;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading your personalized feed...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                  {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Here's what's happening based on your interests
                </p>
              </div>
              <Link
                to="/profile"
                className="flex items-center space-x-2 bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg transition text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {!hasCompletedOnboarding && (
            <div className="bg-gradient-to-r from-cyan-500 to-indigo-700 text-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Complete Your Profile</h3>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Tell us about your interests to get personalized recommendations
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition text-sm sm:text-base whitespace-nowrap"
                >
                  Set Interests
                </Link>
              </div>
            </div>
          )}

          {recentActivity.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-cyan-500 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Continue where you left off</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {getActivityMessage(recentActivity[0])} • {new Date(recentActivity[0].created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <span>Trending Questions</span>
                  </h2>
                  <Link to="/questions" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">
                    View all
                  </Link>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {trendingQuestions.slice(0, 5).map((question) => (
                    <Link
                      key={question.id}
                      to={`/questions/${question.id}`}
                      onClick={() => logActivity('view_question', 'question', question.id)}
                      className="block bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition border border-slate-200"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm sm:text-base flex-1">
                          {question.title}
                        </h3>
                        {question.industry && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                            {question.industry.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs sm:text-sm text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{question.view_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{question.answer_count} answers</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                    <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <span>Recent Podcast Answers</span>
                  </h2>
                  <Link to="/podcasts" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {recentAnswers.slice(0, 4).map((answer) => (
                    <Link
                      key={answer.id}
                      to={`/questions/${answer.question.id}`}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-slate-200"
                    >
                      <div className="relative aspect-video bg-gradient-to-br from-cyan-500 to-indigo-700 flex items-center justify-center">
                        <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-75 group-hover:opacity-100 transition" />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-white text-xs flex items-center space-x-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{answer.upvote_count}</span>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 mb-2">
                          {answer.question.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-1">by {answer.mentor.full_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span>Recommended Mentors</span>
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {recommendedMentors.slice(0, 5).map((mentor) => (
                    <Link
                      key={mentor.id}
                      to={`/mentor/${mentor.id}`}
                      onClick={() => logActivity('mentor_view', 'mentor', mentor.id)}
                      className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg hover:bg-slate-50 transition"
                    >
                      {mentor.avatar_url ? (
                        <img
                          src={mentor.avatar_url}
                          alt={mentor.full_name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-blue-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-700 flex items-center justify-center ring-2 ring-blue-200 flex-shrink-0">
                          <span className="text-white text-sm sm:text-base font-bold">
                            {mentor.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                            {mentor.full_name}
                          </p>
                          {mentor.is_stalwart && (
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        {mentor.professional_title && (
                          <p className="text-xs sm:text-sm text-slate-600 truncate">
                            {mentor.professional_title}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                <Link
                  to="/mentors"
                  className="mt-4 w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition text-sm sm:text-base"
                >
                  <span>Browse All Mentors</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="text-base sm:text-lg font-bold">Quick Actions</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Link
                    to="/questions/ask"
                    className="block w-full bg-white bg-opacity-10 hover:bg-opacity-20 py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
                  >
                    Ask a Question
                  </Link>
                  <Link
                    to="/chapters"
                    className="block w-full bg-white bg-opacity-10 hover:bg-opacity-20 py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
                  >
                    Join a Chapter
                  </Link>
                  <Link
                    to="/industries"
                    className="block w-full bg-white bg-opacity-10 hover:bg-opacity-20 py-2 sm:py-3 px-4 rounded-lg transition text-sm sm:text-base"
                  >
                    Explore Industries
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
