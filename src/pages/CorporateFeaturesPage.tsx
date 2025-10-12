import { PublicLayout } from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import {
  Building2, Users, MessageSquare, Globe, BarChart3, Sparkles,
  TrendingUp, Shield, Zap, Target, CheckCircle2, Video, Award, Briefcase, GraduationCap, Lightbulb, HeartHandshake
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
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <Sparkles className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="bg-white bg-opacity-10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-20 transition border border-white border-opacity-20"
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
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Enterprise Mentorship Solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to build a world-class learning and development program
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                cyan: 'bg-cyan-100 text-cyan-600'
              };

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-orange-900 rounded-2xl p-12 text-white mb-20">
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
                    className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 hover:bg-opacity-20 transition"
                  >
                    <Icon className="w-10 h-10 text-yellow-300 mb-4" />
                    <h3 className="text-lg font-bold mb-2">{useCase.title}</h3>
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
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Vetted Experts</h3>
                      <p className="text-slate-600">Pre-screened mentors with proven track records</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-lg p-3">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Flexible Engagement</h3>
                      <p className="text-slate-600">Pay-per-use or subscription-based models</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Video-First Platform</h3>
                      <p className="text-slate-600">Authentic mentorship through personalized videos</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 rounded-lg p-3">
                      <BarChart3 className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Data-Driven Insights</h3>
                      <p className="text-slate-600">Track ROI and employee development progress</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Ready to Empower Your Team?</h3>
                <p className="text-slate-600 mb-8">
                  Join leading enterprises using effyMentor to accelerate employee development,
                  retain top talent, and drive organizational growth through expert mentorship.
                </p>
                <Link
                  to="/corporate/signup"
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
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
