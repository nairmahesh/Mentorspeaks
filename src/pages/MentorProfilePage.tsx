import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Profile, Answer, Question } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import {
  Star,
  MapPin,
  Briefcase,
  Award,
  Video,
  MessageCircle,
  Calendar,
  ArrowLeft,
  Phone,
  Mail,
  Linkedin,
  ExternalLink,
  Play,
  Eye,
  ArrowBigUp,
  Sparkles
} from 'lucide-react';

type AnswerWithQuestion = Answer & {
  question: Question;
};

export function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Profile | null>(null);
  const [answers, setAnswers] = useState<AnswerWithQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMentorProfile();
    }
  }, [id]);

  const loadMentorProfile = async () => {
    try {
      const [mentorRes, answersRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('answers')
          .select('*, question:questions!answers_question_id_fkey(*)')
          .eq('mentor_id', id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (mentorRes.data) setMentor(mentorRes.data);
      if (answersRes.data) setAnswers(answersRes.data as AnswerWithQuestion[]);
    } catch (error) {
      console.error('Error loading mentor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!mentor) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Mentor Not Found</h2>
          <p className="text-slate-600 mb-6">The mentor profile you're looking for doesn't exist.</p>
          <Link
            to="/browse-mentors"
            className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Browse All Mentors</span>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 to-orange-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/browse-mentors"
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-orange-600 mb-6 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mentors</span>
          </Link>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`${mentor.is_stalwart ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500' : 'bg-gradient-to-r from-orange-600 to-orange-800'} p-8 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

              {mentor.is_stalwart && (
                <div className="absolute top-6 right-6">
                  <div className="bg-white text-amber-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-xl">
                    <Award className="w-5 h-5" />
                    <span>TOP VOICE</span>
                  </div>
                </div>
              )}

              <div className="relative flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                {mentor.avatar_url ? (
                  <img
                    src={mentor.avatar_url}
                    alt={mentor.full_name}
                    className="w-32 h-32 rounded-full ring-8 ring-white shadow-2xl"
                  />
                ) : (
                  <div className={`w-32 h-32 rounded-full ${mentor.is_stalwart ? 'bg-gradient-to-br from-amber-300 to-orange-400' : 'bg-gradient-to-br from-orange-400 to-orange-600'} flex items-center justify-center ring-8 ring-white shadow-2xl`}>
                    <span className="text-5xl font-bold text-white">{mentor.full_name.charAt(0)}</span>
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{mentor.full_name}</h1>

                  {mentor.stalwart_designation && (
                    <div className="mb-3">
                      <span className="inline-flex items-center space-x-1 bg-white bg-opacity-20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm border border-white border-opacity-30">
                        <Sparkles className="w-4 h-4" />
                        <span>{mentor.stalwart_designation}</span>
                      </span>
                    </div>
                  )}

                  {mentor.professional_title && (
                    <p className="text-xl text-white text-opacity-90 mb-4 flex items-center space-x-2">
                      <Briefcase className="w-5 h-5" />
                      <span>{mentor.professional_title}</span>
                    </p>
                  )}

                  {mentor.rating && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-xl backdrop-blur-sm">
                        <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                        <span className="text-xl font-bold">{mentor.rating.toFixed(1)}</span>
                        {mentor.total_reviews && (
                          <span className="text-sm opacity-90">({mentor.total_reviews} reviews)</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-orange-50 rounded-2xl p-6 text-center border-2 border-orange-100">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                    <span className="text-3xl font-bold text-blue-900">{mentor.total_answers || 0}</span>
                  </div>
                  <div className="text-sm text-orange-700 font-semibold">Total Answers</div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 text-center border-2 border-green-100">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Video className="w-6 h-6 text-green-600" />
                    <span className="text-3xl font-bold text-green-900">{mentor.total_videos || 0}</span>
                  </div>
                  <div className="text-sm text-green-700 font-semibold">Video Responses</div>
                </div>

                <div className="bg-purple-50 rounded-2xl p-6 text-center border-2 border-purple-100">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <span className="text-lg font-bold text-purple-900">
                      {new Date(mentor.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-sm text-purple-700 font-semibold">Joined</div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {mentor.bio || 'This mentor hasn\'t added a bio yet.'}
                </p>
              </div>

              {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise_areas.map((area: string, index: number) => (
                      <span
                        key={index}
                        className={`${mentor.is_stalwart ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border-amber-300' : 'bg-orange-50 text-orange-700 border-orange-200'} px-4 py-2 rounded-full font-semibold text-sm border-2`}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mentor.offers_consulting && (
                <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Consulting Available</h3>
                      <p className="text-slate-700 mb-3">
                        {mentor.consulting_description || 'Book a consulting session for personalized guidance.'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        {mentor.consulting_type === 'free' && (
                          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
                            Free Consulting
                          </span>
                        )}
                        {mentor.consulting_type === 'paid' && mentor.consulting_rate_inr && (
                          <span className="bg-orange-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
                            ₹{mentor.consulting_rate_inr}/hour
                          </span>
                        )}
                        {mentor.consulting_type === 'hybrid' && (
                          <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-bold">
                            Free & Paid Options
                          </span>
                        )}
                        {mentor.free_hours_per_month && (
                          <span className="text-slate-600">
                            {mentor.free_hours_per_month} free hours/month
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mentor.linkedin_url && (
                <div className="mb-8">
                  <a
                    href={mentor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold transition"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>Connect on LinkedIn</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {answers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Answers</h2>
                  <div className="space-y-4">
                    {answers.map((answer) => (
                      <Link
                        key={answer.id}
                        to={`/question/${answer.question_id}`}
                        className="block bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition border-2 border-slate-200 hover:border-orange-300"
                      >
                        <h3 className="text-lg font-bold text-slate-900 mb-2 hover:text-orange-600 transition">
                          {answer.question.title}
                        </h3>
                        {answer.summary && (
                          <p className="text-slate-600 mb-4 line-clamp-2">{answer.summary}</p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{answer.view_count} views</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ArrowBigUp className="w-4 h-4" />
                              <span>{answer.upvote_count || 0} upvotes</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Play className="w-4 h-4" />
                              <span>{Math.floor(answer.duration_seconds / 60)}m</span>
                            </span>
                          </div>
                          <span className="text-slate-400">
                            {new Date(answer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
