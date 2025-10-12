import { PublicLayout } from '../components/PublicLayout';
import { Link } from 'react-router-dom';
import {
  Building2, Users, MessageSquare, Mic, Globe, BarChart3, Sparkles,
  TrendingUp, Shield, Zap, Target, CheckCircle2, Radio, Video, Award
} from 'lucide-react';

export function CorporateFeaturesPage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Internal Engagement',
      description: 'Transform leadership communication with AI-powered voice cloning',
      benefits: [
        'CXO messages on vision, values, and culture in their own AI voice',
        'Leadership cascades after town halls and strategy meetings',
        'Training bytecasts from department heads',
        'Process and safety updates in personalized voices'
      ],
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'External Thought Leadership',
      description: 'Amplify your leadership voice across all channels',
      benefits: [
        'LinkedIn-ready content auto-generated and branded',
        'Investor and media updates in personalized clips',
        'Brand storytelling with trusted CXO voices',
        'Weekly leadership messages at scale'
      ],
      color: 'green'
    },
    {
      icon: Globe,
      title: 'Multilingual Reach',
      description: 'Break language barriers with AI dubbing technology',
      benefits: [
        'Voice cloning speaks Hindi, Tamil, and other Indian languages',
        'Localized videos for regional workforces',
        'Expand thought leadership reach across demographics',
        'Native language communication for plant heads'
      ],
      color: 'orange'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Distribution',
      description: 'Track engagement and measure impact',
      benefits: [
        'Identify which messages resonate with employees',
        'Track distributor and partner engagement',
        'Social channel performance metrics',
        'Influence maps showing CXO message impact'
      ],
      color: 'purple'
    }
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Employee Communication',
      description: 'Share vision, values, and culture updates in authentic leadership voices'
    },
    {
      icon: Mic,
      title: 'Training & Development',
      description: 'Create department-specific training content with leader voice clones'
    },
    {
      icon: Award,
      title: 'Brand Storytelling',
      description: 'Explain purpose-driven initiatives in human, trusted voices'
    },
    {
      icon: Target,
      title: 'Investor Relations',
      description: 'Personalized leadership updates for stakeholders in multiple languages'
    }
  ];

  const stats = [
    { label: 'Languages Supported', value: '12+' },
    { label: 'Engagement Increase', value: '300%' },
    { label: 'Time Saved', value: '80%' },
    { label: 'Enterprise Clients', value: '50+' }
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
              Transform Corporate <span className="text-yellow-300">Communication</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              AI-powered voice cloning, multilingual content, and advanced analytics for modern enterprises
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
              Comprehensive Platform Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to amplify leadership communication and drive engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-orange-100 text-orange-600',
                purple: 'bg-purple-100 text-purple-600'
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

          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-12 text-white mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Platform Use Cases</h2>
              <p className="text-xl text-blue-100">
                Beyond CXO communication - versatile solutions for every department
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
                      <h3 className="font-bold text-slate-900 mb-1">Enterprise Security</h3>
                      <p className="text-slate-600">Bank-grade encryption and compliance standards</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-lg p-3">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Rapid Deployment</h3>
                      <p className="text-slate-600">Go live in days, not months</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 rounded-lg p-3">
                      <Radio className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">AI Voice Cloning</h3>
                      <p className="text-slate-600">Authentic leadership voices at scale</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Video className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Multi-Format Content</h3>
                      <p className="text-slate-600">Video, audio, text - all in one platform</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Ready to Transform?</h3>
                <p className="text-slate-600 mb-8">
                  Join leading enterprises using effyMentor to amplify leadership communication
                  and drive engagement across their organizations.
                </p>
                <Link
                  to="/corporate/signup"
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <span>Start Your Journey</span>
                  <CheckCircle2 className="w-5 h-5" />
                </Link>
                <p className="text-sm text-slate-500 text-center mt-4">
                  No credit card required • Setup in 48 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
