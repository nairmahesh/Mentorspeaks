import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
  FileText,
  Calendar,
  BarChart3,
  Settings,
  PenTool,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export function SocialMediaHubPage() {
  const menuItems = [
    {
      title: 'Create New Post',
      description: 'Draft a new social media post for any platform',
      icon: PenTool,
      link: '/mentor/social-media/new-post',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Manage Posts',
      description: 'View, edit, and manage all your posts',
      icon: FileText,
      link: '/mentor/social-media/manage',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500'
    },
    {
      title: 'Content Calendar',
      description: 'View scheduled posts in calendar format',
      icon: Calendar,
      link: '/mentor/social-media/calendar',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500'
    },
    {
      title: 'Scheduled Posts',
      description: 'Review and manage scheduled content',
      icon: Clock,
      link: '/mentor/social-media/scheduled',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-500'
    },
    {
      title: 'Published Posts',
      description: 'View your published content and performance',
      icon: CheckCircle,
      link: '/mentor/social-media/published',
      color: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-500'
    },
    {
      title: 'Post Analytics',
      description: 'Track engagement and performance metrics',
      icon: BarChart3,
      link: '/mentor/social-media/analytics',
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500'
    },
    {
      title: 'Platform Settings',
      description: 'Configure platform connections and preferences',
      icon: Settings,
      link: '/mentor/social-media/settings',
      color: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-500'
    },
    {
      title: 'Content Ideas',
      description: 'Browse trending topics and content suggestions',
      icon: TrendingUp,
      link: '/mentor/social-media/ideas',
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-500'
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
            <FileText className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Social Media Manager</h1>
          </div>
          <p className="text-lg text-slate-600">Create, schedule, and manage your social media content across all platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
              <div className="p-6">
                <div className={`${item.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">
                  {item.title}
                </h3>
                <p className="text-slate-600 mb-4">{item.description}</p>
                <div className="flex items-center text-blue-600 font-medium">
                  Open <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Quick Tips</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Schedule posts during peak engagement times for better reach
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Use the calendar view to plan your content strategy in advance
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Track analytics regularly to understand what content resonates
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Maintain a consistent posting schedule across platforms
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
