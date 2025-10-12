import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Industry, Question, Answer, Profile } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import * as LucideIcons from 'lucide-react';
import {
  Mic,
  ArrowRight,
  Play,
  Star,
  CheckCircle,
  Eye,
  Clock,
  ArrowBigUp,
  Sparkles,
  MessageSquare,
  Users,
  TrendingUp,
  Radio,
  Headphones,
  Send,
  MapPin,
  Globe
} from 'lucide-react';

type AnswerWithDetails = Answer & {
  question: Question;
  mentor: Profile;
};

export function HomePage() {
  const [featuredAnswers, setFeaturedAnswers] = useState<AnswerWithDetails[]>([]);
  const [allMentors, setAllMentors] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalAnswers: 0,
    totalMentors: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        answersRes,
        mentorsRes,
        questionsCount,
        answersCount,
        mentorsCount
      ] = await Promise.all([
        supabase
          .from('answers')
          .select('*, question:questions!answers_question_id_fkey(*), mentor:profiles!answers_mentor_id_fkey(*)')
          .eq('status', 'published')
          .order('upvote_count', { ascending: false })
          .limit(9),
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mentor')
          .order('is_stalwart', { ascending: false })
          .order('stalwart_order', { ascending: true })
          .limit(12),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('answers').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor')
      ]);

      if (answersRes.data) setFeaturedAnswers(answersRes.data as AnswerWithDetails[]);
      if (mentorsRes.data) setAllMentors(mentorsRes.data);

      setStats({
        totalQuestions: questionsCount.count || 0,
        totalAnswers: answersCount.count || 0,
        totalMentors: mentorsCount.count || 0,
        totalViews: answersRes.data?.reduce((sum, a) => sum + a.view_count, 0) || 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <PublicLayout>
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Radio className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-sm font-medium">{stats.totalMentors}+ Expert Podcasters Live</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Conversations That Build</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-300 to-cyan-300">
                Future Leaders
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed px-4">
              Ask, listen, and learn from experts across industries and geographies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/podcasts"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl text-lg inline-flex items-center justify-center space-x-2"
              >
                <Headphones className="w-5 h-5" />
                <span>Listen to Podcasts</span>
              </Link>
              <Link
                to="/register"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:bg-opacity-10 transition border-2 border-white text-lg inline-flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Ask a Question</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl md:text-4xl font-bold">{stats.totalMentors}+</div>
                <div className="text-blue-200 text-sm mt-1">Expert Podcasters</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl md:text-4xl font-bold">{stats.totalAnswers}+</div>
                <div className="text-blue-200 text-sm mt-1">Responses</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl md:text-4xl font-bold">{Math.floor(stats.totalViews / 1000)}K+</div>
                <div className="text-blue-200 text-sm mt-1">Total Listens</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl md:text-4xl font-bold">{stats.totalQuestions}+</div>
                <div className="text-blue-200 text-sm mt-1">Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full mb-4">
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span className="text-sm font-bold text-red-900">FEATURED PODCASTS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Listen to Industry Experts
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Get expert views and insights through engaging podcast-style content. Ask them questions directly.
            </p>
          </div>

          {allMentors.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              {allMentors.map((mentor) => (
                <Link
                  key={mentor.id}
                  to={`/mentor/${mentor.id}`}
                  className="group bg-white rounded-2xl p-3 sm:p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 hover:border-cyan-400 relative"
                >
                  {mentor.is_stalwart && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                      <div className="bg-gradient-to-r from-amber-400 to-cyan-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center space-x-0.5 sm:space-x-1 shadow-lg">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
                        <span className="hidden sm:inline">TOP VOICE</span>
                      </div>
                    </div>
                  )}
                  <div className="relative mb-3 sm:mb-4">
                    {mentor.avatar_url ? (
                      <img
                        src={mentor.avatar_url}
                        alt={mentor.full_name}
                        className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full mx-auto ring-2 sm:ring-4 ${mentor.is_stalwart ? 'ring-amber-300 group-hover:ring-amber-400' : 'ring-blue-100 group-hover:ring-blue-300'} transition`}
                      />
                    ) : (
                      <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${mentor.is_stalwart ? 'from-amber-400 to-cyan-500' : 'from-cyan-400 to-blue-600'} flex items-center justify-center mx-auto ring-2 sm:ring-4 ${mentor.is_stalwart ? 'ring-amber-300 group-hover:ring-amber-400' : 'ring-cyan-200 group-hover:ring-cyan-300'} transition`}>
                        <span className="text-xl sm:text-3xl font-bold text-white">{mentor.full_name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center space-x-0.5 sm:space-x-1 shadow-lg">
                      <Mic className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>LIVE</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-center mb-1 group-hover:text-blue-600 transition text-sm sm:text-lg line-clamp-2">
                    {mentor.full_name}
                  </h3>
                  {mentor.stalwart_designation && (
                    <div className="text-center mb-2">
                      <span className="inline-block bg-gradient-to-r from-amber-100 to-blue-100 text-amber-900 px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-amber-300 line-clamp-1">
                        {mentor.stalwart_designation}
                      </span>
                    </div>
                  )}
                  {mentor.professional_title && (
                    <p className="text-xs sm:text-sm text-slate-600 text-center mb-2 sm:mb-3 line-clamp-1 font-medium hidden sm:block">{mentor.professional_title}</p>
                  )}
                  <div className={`bg-gradient-to-r ${mentor.is_stalwart ? 'from-amber-50 to-blue-50 border-l-4 border-amber-400' : 'from-blue-50 to-cyan-50 border-l-4 border-cyan-500'} rounded-xl p-2 sm:p-3 mb-2 sm:mb-4 hidden sm:block`}>
                    <p className="text-xs text-slate-700 italic leading-relaxed line-clamp-3">
                      "{mentor.bio || 'Sharing insights and expertise through engaging podcast discussions'}"
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-blue-600 group-hover:text-blue-700 font-bold text-xs sm:text-sm">
                    <Headphones className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Listen Now</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 mb-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No podcasters yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-slate-100 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-900">MOST UPVOTED</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Top Expert Responses
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Listen to the community's favorite answers. Real insights from professionals who've been there.
          </p>
        </div>

        {featuredAnswers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredAnswers.map((answer) => (
                <Link
                  key={answer.id}
                  to={`/questions/${answer.question_id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-cyan-400"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-cyan-500 via-red-600 to-pink-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 rounded-full bg-white bg-opacity-95 flex items-center justify-center group-hover:scale-110 transition shadow-2xl mx-auto mb-3">
                        <Play className="w-10 h-10 text-red-600 ml-1" />
                      </div>
                      <Mic className="w-8 h-8 text-white opacity-60 mx-auto" />
                    </div>
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center space-x-1 shadow-lg">
                        <ArrowBigUp className="w-3.5 h-3.5" />
                        <span>{answer.upvote_count || 0}</span>
                      </div>
                      <div className="bg-black bg-opacity-80 px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{answer.view_count}</span>
                      </div>
                    </div>
                    {answer.duration_seconds && (
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs font-medium">
                        {Math.floor(answer.duration_seconds / 60)}:{String(answer.duration_seconds % 60).padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      {answer.mentor?.avatar_url ? (
                        <img
                          src={answer.mentor.avatar_url}
                          alt={answer.mentor.full_name}
                          className="w-12 h-12 rounded-full ring-2 ring-blue-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-2 ring-blue-200">
                          <span className="text-white text-lg font-bold">
                            {answer.mentor?.full_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900">{answer.mentor?.full_name}</p>
                        {answer.mentor?.professional_title && (
                          <p className="text-sm text-slate-600 truncate">{answer.mentor.professional_title}</p>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg group-hover:text-blue-600 transition leading-snug">
                      {answer.question?.title}
                    </h3>

                    {answer.summary && (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {answer.summary}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/podcasts"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-800 transition shadow-xl text-lg"
              >
                <Headphones className="w-6 h-6" />
                <span>Explore All Expert Responses</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl">
            <Mic className="w-20 h-20 text-slate-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No responses yet</h3>
            <p className="text-slate-600 mb-6">Be the first expert to share your knowledge!</p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              <span>Become a Mentor</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-bold text-white">HOW IT WORKS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ask, Listen, Learn
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Get expert insights from industry professionals through podcast-style responses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">1. Ask Your Question</h3>
              <p className="text-blue-100 leading-relaxed">
                Post your question to the community. Industry experts and mentors will see it and choose to respond.
              </p>
            </div>

            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-700 flex items-center justify-center mb-6">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">2. Experts Respond</h3>
              <p className="text-blue-100 leading-relaxed">
                Multiple experts can answer your question with podcast-style responses sharing their unique perspectives and experience.
              </p>
            </div>

            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">3. Learn & Connect</h3>
              <p className="text-blue-100 leading-relaxed">
                Listen to responses, upvote the best answers, and book paid consulting calls with experts who helped you most.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              <span>Join Your Regional Community</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Regional Chapters</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Connect with mentors and professionals in your region. Join chapter-exclusive events, discussions, and networking opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group">
              <div className="h-32 bg-gradient-to-br from-cyan-400 to-blue-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-white opacity-50" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">India MentorSpeak</h3>
                <p className="text-slate-600 mb-4">Connect with mentors across India, Bangladesh, Sri Lanka, and South Asia</p>
                <Link
                  to="/chapters/india-mentorspeak"
                  className="inline-flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  <span>Explore Chapter</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group">
              <div className="h-32 bg-gradient-to-br from-cyan-500 to-blue-700 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-white opacity-50" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Middle East MentorSpeak</h3>
                <p className="text-slate-600 mb-4">Network with professionals across UAE, Saudi Arabia, and the Middle East</p>
                <Link
                  to="/chapters/middle-east-mentorspeak"
                  className="inline-flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  <span>Explore Chapter</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group">
              <div className="h-32 bg-gradient-to-br from-purple-500 to-pink-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-white opacity-50" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Women in Leadership - SEA</h3>
                <p className="text-slate-600 mb-4">Empowering women leaders across Singapore, Malaysia, and Southeast Asia</p>
                <Link
                  to="/chapters/women-leadership-sea"
                  className="inline-flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  <span>Explore Chapter</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/chapters"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <span>View All Chapters</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 via-red-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Learn from Experts?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of professionals getting answers from industry experts through podcast-style responses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/podcasts"
              className="bg-white text-blue-600 px-10 py-5 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl text-lg inline-flex items-center justify-center space-x-2"
            >
              <Headphones className="w-6 h-6" />
              <span>Browse Podcasts</span>
            </Link>
            <Link
              to="/register"
              className="bg-transparent text-white px-10 py-5 rounded-xl font-bold hover:bg-white hover:bg-opacity-10 transition border-2 border-white text-lg inline-flex items-center justify-center space-x-2"
            >
              <Send className="w-6 h-6" />
              <span>Ask a Question</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
