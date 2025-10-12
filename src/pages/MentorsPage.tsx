import { Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { ArrowRight, Users, Award, DollarSign, Sparkles, Globe, CheckCircle, Heart, Users2, Star, Video } from 'lucide-react';

export function MentorsPage() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Join Our Community</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Be a Mentor
              </h1>
              <p className="text-2xl font-semibold text-yellow-300 mb-4">
                Share Your Expertise, Shape Careers
              </p>
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

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
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

      <div className="py-20 bg-gradient-to-br from-amber-50 via-blue-50 to-rose-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-blue-100">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-cyan-500 rounded-full mb-6">
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

      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join our community of mentors and start shaping the next generation of professionals
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-blue-50 transition shadow-2xl"
            >
              <span>Become a Mentor Today</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              to="/browse-mentors"
              className="inline-flex items-center space-x-2 bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-blue-800 transition border-2 border-cyan-400"
            >
              <Users className="w-6 h-6" />
              <span>Browse Mentors</span>
            </Link>
          </div>
        </div>
      </div>

    </PublicLayout>
  );
}
