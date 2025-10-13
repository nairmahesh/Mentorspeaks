import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import {
  Users,
  UserPlus,
  Calendar,
  Bell,
  MessageSquare,
  FileText,
  Tags,
  Clock,
  TrendingUp,
  Filter,
  Star,
  Archive,
  ArrowRight
} from 'lucide-react';

export function CRMHubPage() {
  const menuItems = [
    {
      title: 'All Mentees',
      description: 'View and manage all your mentee relationships',
      icon: Users,
      link: '/mentor/crm/all',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Add New Mentee',
      description: 'Create a new mentee relationship record',
      icon: UserPlus,
      link: '/mentor/crm/add',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500'
    },
    {
      title: 'Follow-up Calendar',
      description: 'Schedule and track follow-ups with mentees',
      icon: Calendar,
      link: '/mentor/crm/calendar',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500'
    },
    {
      title: 'Upcoming Follow-ups',
      description: 'View mentees needing attention this week',
      icon: Bell,
      link: '/mentor/crm/upcoming',
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-500'
    },
    {
      title: 'Conversation History',
      description: 'Review past interactions and notes',
      icon: MessageSquare,
      link: '/mentor/crm/conversations',
      color: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-500'
    },
    {
      title: 'Notes & Documentation',
      description: 'Access detailed notes for each mentee',
      icon: FileText,
      link: '/mentor/crm/notes',
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500'
    },
    {
      title: 'Tags & Categories',
      description: 'Organize mentees with custom tags',
      icon: Tags,
      link: '/mentor/crm/tags',
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-500'
    },
    {
      title: 'Overdue Follow-ups',
      description: 'Find relationships that need attention',
      icon: Clock,
      link: '/mentor/crm/overdue',
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-500'
    },
    {
      title: 'Active Relationships',
      description: 'Track actively engaged mentees',
      icon: TrendingUp,
      link: '/mentor/crm/active',
      color: 'from-teal-500 to-teal-600',
      iconBg: 'bg-teal-500'
    },
    {
      title: 'Filter & Search',
      description: 'Advanced filtering and search options',
      icon: Filter,
      link: '/mentor/crm/search',
      color: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-500'
    },
    {
      title: 'VIP Mentees',
      description: 'Manage high-priority relationships',
      icon: Star,
      link: '/mentor/crm/vip',
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-500'
    },
    {
      title: 'Archive',
      description: 'View completed or inactive relationships',
      icon: Archive,
      link: '/mentor/crm/archive',
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
            <Users className="w-10 h-10 text-orange-600" />
            <h1 className="text-4xl font-bold text-slate-900">Mentee CRM</h1>
          </div>
          <p className="text-lg text-slate-600">Build and nurture meaningful relationships with your mentees</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              className="group bg-white rounded-xl border-2 border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
              <div className="p-6">
                <div className={`${item.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition">
                  {item.title}
                </h3>
                <p className="text-slate-600 mb-4">{item.description}</p>
                <div className="flex items-center text-orange-600 font-medium">
                  Open <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Relationship Management Tips</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Set follow-up reminders immediately after each interaction
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Document key points from conversations for future reference
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Use tags to categorize mentees by goals or industry
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  Review your upcoming follow-ups at the start of each week
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
