import { PublicLayout } from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import {
  Building2, Users, MessageSquare, Globe, BarChart3, Sparkles,
  TrendingUp, Shield, Zap, Target, CheckCircle2, Video, Award, Briefcase, GraduationCap, Lightbulb, HeartHandshake, Star, Trophy
} from 'lucide-react';

export function CorporateFeaturesPage() {
  const features = [
    {
      icon: Users,
      title: 'Expert Mentor Pool',
      description: 'Access industry veterans across domains on-demand',
      benefits: [
        'Vetted professionals with 10+ years of experience',
        'Diverse expertise across industries and functions',
        'Real-world insights from successful leaders',
        'Quick turnaround on critical business questions'
      ],
      color: 'blue'
    },
    {
      icon: GraduationCap,
      title: 'Employee Development',
      description: 'Accelerate learning and skill development at scale',
      benefits: [
        'On-demand mentorship for leadership programs',
        'Career guidance from industry experts',
        'Video-based learning for distributed teams',
        'Custom mentorship programs for high-potentials'
      ],
      color: 'green'
    },
    {
      icon: Lightbulb,
      title: 'Strategic Guidance',
      description: 'Get expert opinions on critical business decisions',
      benefits: [
        'Market entry strategies from experienced leaders',
        'Product and technology roadmap validation',
        'Go-to-market strategy reviews',
        'Crisis management and change leadership advice'
      ],
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: 'Measurable Impact',
      description: 'Track engagement and ROI of mentorship programs',
      benefits: [
        'Employee satisfaction and retention metrics',
        'Skill development progress tracking',
        'Leadership pipeline analytics',
        'Cost savings vs traditional consulting'
      ],
      color: 'cyan'
    }
  ];

  const useCases = [
    {
      icon: Briefcase,
      title: 'Leadership Development',
      description: 'Build your next generation of leaders with guidance from industry veterans'
    },
    {
      icon: Target,
      title: 'Strategic Consulting',
      description: 'Get expert validation on business decisions without long-term commitments'
    },
    {
      icon: HeartHandshake,
      title: 'Employee Retention',
      description: 'Provide meaningful career development opportunities to retain top talent'
    },
    {
      icon: TrendingUp,
      title: 'Innovation & Growth',
      description: 'Access diverse perspectives to drive innovation and market expansion'
    }
  ];

  const stats = [
    { label: 'Expert Mentors', value: '500+' },
    { label: 'Industries Covered', value: '25+' },
    { label: 'Response Time', value: '<48hrs' },
    { label: 'Corporate Clients', value: '100+' }
  ];

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Building2 className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">ENTERPRISE SOLUTIONS</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Empower Your Workforce with <span className="text-yellow-300">Expert Guidance</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              On-demand access to industry mentors for leadership development, strategic decisions, and employee growth
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/corporate/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition flex items-center justify-center space-x-2 shadow-xl"
              >
                <span>Get Started</span>
                <Sparkles className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="bg-white bg-opacity-10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-20 transition border-2 border-white border-opacity-30"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="relative mb-20">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
              <div className="relative">
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full p-1 shadow-2xl animate-pulse">
                  <div className="bg-white rounded-full px-8 py-4 flex items-center space-x-3">
                    <Trophy className="w-8 h-8 text-orange-500" />
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">Make Your Organization</div>
                      <div className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        A Great Place to Learn
                      </div>
                    </div>
                    <Trophy className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                <div className="absolute -top-2 -left-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-current animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-current animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Star className="w-5 h-5 text-orange-400 fill-current animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-12 pt-20 shadow-2xl border-4 border-yellow-400">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
                  Enterprise Mentorship Solutions
                </h2>
                <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-medium">
                  Everything you need to build a world-class learning and development program
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const colorClasses = {
                    blue: 'from-blue-500 to-cyan-500',
                    green: 'from-green-500 to-emerald-500',
                    orange: 'from-orange-500 to-red-500',
                    cyan: 'from-cyan-500 to-blue-500'
                  };

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
                    >
                      <div className={`bg-gradient-to-r ${colorClasses[feature.color as keyof typeof colorClasses]} p-6`}>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-lg mb-4">
                          <Icon className="w-8 h-8 text-slate-900" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-blue-50 text-lg">
                          {feature.description}
                        </p>
                      </div>
                      <div className="p-6">
                        <ul className="space-y-3">
                          {feature.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-700 font-medium">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 text-center">
                <Link
                  to="/corporate/signup"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-10 py-5 rounded-xl font-black text-xl hover:from-yellow-300 hover:to-orange-400 transition shadow-2xl transform hover:scale-105"
                >
                  <Award className="w-7 h-7" />
                  <span>Transform Your Organization Today</span>
                  <Sparkles className="w-7 h-7" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 rounded-2xl p-12 text-white mb-20 shadow-xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">How Corporates Benefit</h2>
              <p className="text-xl text-blue-100">
                Transform your organization with expert mentorship across all functions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <div
                    key={index}
                    className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition border-2 border-white border-opacity-20"
                  >
                    <Icon className="w-12 h-12 text-yellow-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                    <p className="text-sm text-blue-100">{useCase.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">
                  Why Leading Enterprises Choose effyMentor
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-xl p-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Vetted Experts</h3>
                      <p className="text-slate-600">Pre-screened mentors with proven track records</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-xl p-3">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Flexible Engagement</h3>
                      <p className="text-slate-600">Pay-per-use or subscription-based models</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-xl p-3">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Video-First Platform</h3>
                      <p className="text-slate-600">Authentic mentorship through personalized videos</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 rounded-xl p-3">
                      <BarChart3 className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Data-Driven Insights</h3>
                      <p className="text-slate-600">Track ROI and employee development progress</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border-2 border-blue-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Ready to Empower Your Team?</h3>
                <p className="text-slate-600 mb-8">
                  Join leading enterprises using effyMentor to accelerate employee development,
                  retain top talent, and drive organizational growth through expert mentorship.
                </p>
                <Link
                  to="/corporate/signup"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Get Started</span>
                  <CheckCircle2 className="w-5 h-5" />
                </Link>
                <p className="text-sm text-slate-500 text-center mt-4">
                  Custom plans available • Dedicated account support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
