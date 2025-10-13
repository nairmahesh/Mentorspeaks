import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Answer, Question } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { BarChart3, Video, TrendingUp, DollarSign, Eye, MessageCircle, Radio, Sparkles, FileText, Users } from 'lucide-react';

type AnswerWithQuestion = Answer & {
  question: Question;
};

export function MentorDashboardPage() {
  const { user, isModerator } = useAuth();
  const [answers, setAnswers] = useState<AnswerWithQuestion[]>([]);
  const [stats, setStats] = useState({
    totalAnswers: 0,
    totalViews: 0,
    totalEarnings: 0,
    pendingQuestions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [answersRes, questionsRes] = await Promise.all([
        supabase
          .from('answers')
          .select('*, question:questions!answers_question_id_fkey(*)')
          .eq('mentor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open')
      ]);

      if (answersRes.data) {
        setAnswers(answersRes.data as AnswerWithQuestion[]);

        const totalViews = answersRes.data.reduce((sum, a) => sum + a.view_count, 0);
        setStats(prev => ({
          ...prev,
          totalAnswers: answersRes.data.length,
          totalViews,
        }));
      }

      if (questionsRes.count !== null) {
        setStats(prev => ({
          ...prev,
          pendingQuestions: questionsRes.count || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Mentor Dashboard</h1>
          </div>
          <p className="text-slate-600">Track your impact and engagement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Total Answers</span>
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalAnswers}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Total Views</span>
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.totalViews}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">₹{stats.totalEarnings}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Open Questions</span>
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.pendingQuestions}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Answers</h2>
              <Link to="/mentor/answers" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {answers.map((answer) => (
                <Link
                  key={answer.id}
                  to={`/questions/${answer.question_id}`}
                  className="block border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition"
                >
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                    {answer.question.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{answer.view_count}</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          answer.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {answer.status}
                      </span>
                    </div>
                    <span className="text-slate-500">
                      {new Date(answer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}

              {answers.length === 0 && (
                <div className="text-center py-8 text-slate-600">
                  <p>No answers yet. Start answering questions!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
              <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <Link
                to="/mentor/brand"
                className="block bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4 hover:from-blue-100 hover:to-purple-100 transition"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Brand Hub</h3>
                </div>
                <p className="text-sm text-blue-700">Manage your personal brand and social media presence</p>
              </Link>

              <Link
                to="/mentor/social-media"
                className="block bg-cyan-50 border border-cyan-200 rounded-lg p-4 hover:bg-cyan-100 transition"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-semibold text-cyan-900">Social Media Manager</h3>
                </div>
                <p className="text-sm text-cyan-700">Create and schedule posts across platforms</p>
              </Link>

              <Link
                to="/mentor/crm"
                className="block bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Mentee CRM</h3>
                </div>
                <p className="text-sm text-orange-700">Track relationships and follow-ups with mentees</p>
              </Link>

              <Link
                to="/questions"
                className="block bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition"
              >
                <h3 className="font-semibold text-blue-900 mb-1">Browse Questions</h3>
                <p className="text-sm text-blue-700">Find questions to answer in your expertise areas</p>
              </Link>

              {isModerator && (
                <Link
                  to="/podcasts/manage"
                  className="block bg-gradient-to-r from-blue-50 to-slate-50 border-2 border-blue-300 rounded-lg p-4 hover:from-blue-100 hover:to-slate-100 transition"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Radio className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Manage Podcasts</h3>
                  </div>
                  <p className="text-sm text-blue-700">Create and manage podcast episodes as a moderator</p>
                </Link>
              )}

              <Link
                to="/mentor/analytics"
                className="block bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition"
              >
                <h3 className="font-semibold text-purple-900 mb-1">View Analytics</h3>
                <p className="text-sm text-purple-700">Track your performance and engagement metrics</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
