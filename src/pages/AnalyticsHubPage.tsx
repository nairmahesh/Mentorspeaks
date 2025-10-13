import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MessageCircle,
  ThumbsUp,
  Share2,
  Calendar,
  Target,
  PieChart,
  Activity,
  Award,
  ArrowRight
} from 'lucide-react';

export function AnalyticsHubPage() {
  const menuItems = [
    {
      title: 'Performance Overview',
      description: 'View overall performance metrics and trends',
      icon: BarChart3,
      link: '/mentor/analytics/overview',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Engagement Analytics',
      description: 'Track likes, comments, shares, and interactions',
      icon: ThumbsUp,
      link: '/mentor/analytics/engagement',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500'
    },
    {
      title: 'Audience Insights',
      description: 'Understand your audience demographics and behavior',
      icon: Users,
      link: '/mentor/analytics/audience',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500'
    },
    {
      title: 'Content Performance',
      description: 'Analyze which posts perform best',
      icon: TrendingUp,
      link: '/mentor/analytics/content',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-500'
    },
    {
      title: 'Profile Views',
      description: 'Monitor profile visits and discovery trends',
      icon: Eye,
      link: '/mentor/analytics/profile-views',
      color: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-500'
    },
    {
      title: 'Growth Metrics',
      description: 'Track follower growth and reach expansion',
      icon: Activity,
      link: '/mentor/analytics/growth',
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500'
    },
    {
      title: 'Platform Comparison',
      description: 'Compare performance across different platforms',
      icon: PieChart,
      link: '/mentor/analytics/platforms',
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-500'
    },
    {
      title: 'Time Analysis',
      description: 'Find optimal posting times and patterns',
      icon: Calendar,
      link: '/mentor/analytics/timing',
      color: 'from-teal-500 to-teal-600',
      iconBg: 'bg-teal-500'
    },
    {
      title: 'Question Analytics',
      description: 'Track views and engagement on your Q&A answers',
      icon: MessageCircle,
      link: '/mentor/analytics/questions',
      color: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-500'
    },
    {
      title: 'Consulting Metrics',
      description: 'Monitor consulting inquiries and conversions',
      icon: Target,
      link: '/mentor/analytics/consulting',
      color: 'from-rose-500 to-rose-600',
      iconBg: 'bg-rose-500'
    },
    {
      title: 'Impact Score',
      description: 'View your overall mentorship impact rating',
      icon: Award,
      link: '/mentor/analytics/impact',
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500'
    },
    {
      title: 'Export Reports',
      description: 'Download detailed analytics reports',
      icon: Share2,
      link: '/mentor/analytics/export',
      color: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-500'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Link
            to="/mentor/brand"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center"
          >
            ← Back to Brand Hub
          </Link>
          <div className="flex items-center space-x-3 mt-4 mb-2">
            <BarChart3 className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">Analytics Dashboard</h1>
          </div>
          <p className="text-lg text-slate-600">Deep insights into your performance, engagement, and growth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group bg-white rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
              <div className="p-6">
                <div className={`${item.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition">
                  {item.title}
                </h3>
                <p className="text-slate-600 mb-4">{item.description}</p>
                <div className="flex items-center text-purple-600 font-medium">
                  View <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analytics Best Practices</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Review your analytics weekly to spot trends early
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Focus on engagement rate over vanity metrics
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Use timing analysis to optimize your posting schedule
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Compare period-over-period to measure growth accurately
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
