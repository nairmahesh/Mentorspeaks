import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import { ArrowRight, Star, Users, Video, MessageCircle, TrendingUp, Award, DollarSign, Sparkles, Globe, CheckCircle, Heart, Users2 } from 'lucide-react';

type SortOption = 'rating' | 'answers' | 'videos' | 'recent';

export function MentorsPage() {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  useEffect(() => {
    loadMentors();
  }, [sortBy]);

  const loadMentors = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor');

      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'answers':
          query = query.order('total_answers', { ascending: false });
          break;
        case 'videos':
          query = query.order('total_videos', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data } = await query;
      if (data) setMentors(data);
    } catch (error) {
      console.error('Error loading mentors:', error);
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
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Become a Mentor</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Share Your Expertise, Shape Careers
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join our community of industry leaders and help professionals navigate their career journey through personalized video answers
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-xl"
                >
                  <span>Start Mentoring</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#benefits"
                  className="inline-flex items-center justify-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-20 transition border border-white border-opacity-20"
                >
                  <span>Learn More</span>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                <Award className="w-10 h-10 text-yellow-300 mb-3" />
                <div className="text-3xl font-bold mb-1">Build Authority</div>
                <p className="text-blue-100 text-sm">Establish yourself as an industry expert</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 mt-8">
                <DollarSign className="w-10 h-10 text-green-300 mb-3" />
                <div className="text-3xl font-bold mb-1">Earn Income</div>
                <p className="text-blue-100 text-sm">Monetize your knowledge and time</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                <Globe className="w-10 h-10 text-blue-300 mb-3" />
                <div className="text-3xl font-bold mb-1">Global Reach</div>
                <p className="text-blue-100 text-sm">Impact professionals worldwide</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 mt-8">
                <Sparkles className="w-10 h-10 text-purple-300 mb-3" />
                <div className="text-3xl font-bold mb-1">Flexible</div>
                <p className="text-blue-100 text-sm">Answer questions on your schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Become a Mentor?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join a platform where your experience creates real impact while building your personal brand
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Build Your Brand</h3>
              <p className="text-slate-700 leading-relaxed">
                Showcase your expertise through video answers. Build a portfolio that demonstrates your knowledge and establishes you as a thought leader in your field.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Monetize Your Expertise</h3>
              <p className="text-slate-700 leading-relaxed">
                Set your own consulting rates and offer paid video answers. Turn your knowledge into a revenue stream while helping others succeed.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Global Impact</h3>
              <p className="text-slate-700 leading-relaxed">
                Reach professionals across industries and geographies. Your insights can guide career decisions for thousands of aspiring leaders.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Video-First Platform</h3>
              <p className="text-slate-700 leading-relaxed">
                Share personalized video responses that create authentic connections. More impactful than text, more scalable than live calls.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 border border-cyan-200">
              <div className="w-14 h-14 bg-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Work on Your Terms</h3>
              <p className="text-slate-700 leading-relaxed">
                Choose which questions to answer and when. No commitments, no schedules. Mentor at your own pace and convenience.
              </p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-8 border border-rose-200">
              <div className="w-14 h-14 bg-rose-600 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Give Back & Create Legacy</h3>
              <p className="text-slate-700 leading-relaxed">
                Pay it forward by guiding others through challenges you once faced. Your wisdom can change lives and create a lasting impact on future generations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-orange-100">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full mb-6">
                <Heart className="w-10 h-10 text-white" fill="white" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Make a Difference That Matters</h2>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Behind every question is someone seeking guidance at a crossroads in their career. Your experience can be the light that shows them the way forward.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
                <Users2 className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">Empower the Next Generation</h3>
                <p className="text-slate-700 leading-relaxed">
                  Remember when you needed guidance and someone took the time to help? Now it's your turn. Share the lessons learned from your journey and help others avoid the pitfalls you faced.
                </p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
                <Heart className="w-12 h-12 text-rose-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">Create Lasting Impact</h3>
                <p className="text-slate-700 leading-relaxed">
                  Your advice today could shape someone's entire career trajectory. Imagine the ripple effect of your wisdom - lives changed, families supported, dreams realized.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
              <blockquote className="text-center">
                <p className="text-lg text-slate-700 italic mb-4 leading-relaxed">
                  "The greatest legacy we can leave behind is not what we've accomplished, but who we've helped along the way. Mentoring isn't just about sharing knowledge—it's about transforming lives and giving hope to those who need it most."
                </p>
                <footer className="text-sm font-semibold text-slate-900">
                  — The Heart of Mentorship
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600">Simple steps to start making an impact</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-6 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Create Your Profile</h3>
                <p className="text-slate-600 leading-relaxed">
                  Sign up and showcase your expertise, experience, and the areas where you can provide guidance. Set your consulting preferences and rates.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Browse Questions</h3>
                <p className="text-slate-600 leading-relaxed">
                  Explore questions from professionals seeking advice. Choose the ones that match your expertise and interest.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Record Video Answers</h3>
                <p className="text-slate-600 leading-relaxed">
                  Share personalized video responses with your insights and advice. Authentic, impactful guidance that makes a difference.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Grow Your Impact</h3>
                <p className="text-slate-600 leading-relaxed">
                  Build your reputation through ratings and reviews. Offer optional consulting calls to deepen relationships and increase earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Who Should Become a Mentor?</h2>
            <p className="text-xl text-slate-300">Perfect for experienced professionals who want to give back</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Industry Veterans</h4>
                <p className="text-slate-300">10+ years experience in your field</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Business Leaders</h4>
                <p className="text-slate-300">CEOs, founders, and senior executives</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Subject Matter Experts</h4>
                <p className="text-slate-300">Specialized knowledge in niche areas</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Career Coaches</h4>
                <p className="text-slate-300">Professional development specialists</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Consultants</h4>
                <p className="text-slate-300">Independent advisors and consultants</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-1">Thought Leaders</h4>
                <p className="text-slate-300">Authors, speakers, and influencers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of mentors and start shaping the next generation of professionals
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-blue-50 transition shadow-2xl"
          >
            <span>Become a Mentor Today</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{mentors.length}</span> mentors
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 font-medium"
            >
              <option value="rating">Highest Rated</option>
              <option value="answers">Most Answers</option>
              <option value="videos">Most Videos</option>
              <option value="recent">Recently Joined</option>
            </select>
          </div>
        </div>

        {mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start space-x-4 mb-4">
                  {mentor.avatar_url ? (
                    <img
                      src={mentor.avatar_url}
                      alt={mentor.full_name}
                      className="w-16 h-16 rounded-full ring-4 ring-slate-100 group-hover:ring-blue-200 transition flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-4 ring-slate-100 group-hover:ring-blue-200 transition flex-shrink-0">
                      <span className="text-2xl font-bold text-white">{mentor.full_name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition truncate">
                      {mentor.full_name}
                    </h3>
                    {mentor.professional_title && (
                      <p className="text-sm text-slate-600 truncate">{mentor.professional_title}</p>
                    )}
                    {(mentor.rating || 0) > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-slate-900">
                          {(mentor.rating || 0).toFixed(1)}
                        </span>
                        {(mentor.total_reviews || 0) > 0 && (
                          <span className="text-xs text-slate-500">
                            ({mentor.total_reviews} reviews)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {mentor.bio && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{mentor.bio}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-bold text-blue-900">{mentor.total_answers || 0}</span>
                    </div>
                    <div className="text-xs text-blue-700 font-medium">Answers</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Video className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-900">{mentor.total_videos || 0}</span>
                    </div>
                    <div className="text-xs text-green-700 font-medium">Videos</div>
                  </div>
                </div>

                {mentor.offers_consulting && (
                  <div className="mb-4 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 text-orange-900 text-xs font-semibold rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Offers Consulting</span>
                    </div>
                    {mentor.consulting_type === 'free' && (
                      <div className="text-green-700 font-bold mt-1">Free</div>
                    )}
                    {mentor.consulting_type === 'paid' && mentor.consulting_rate_inr && (
                      <div className="text-slate-700 mt-1">₹{mentor.consulting_rate_inr}/hr</div>
                    )}
                    {mentor.consulting_type === 'hybrid' && (
                      <div className="text-blue-700 mt-1">Mixed Pricing</div>
                    )}
                  </div>
                )}

                <Link
                  to="/questions"
                  className="block w-full text-center bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View Answers
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No mentors yet</h3>
            <p className="text-slate-600 mb-6">Be the first to join as a mentor and share your expertise!</p>
            <Link
              to="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Become a Mentor
            </Link>
          </div>
        )}
      </div>

      <div className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Want to Become a Mentor?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Share your expertise, help others grow, and build your personal brand
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            <span>Join as a Mentor</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
