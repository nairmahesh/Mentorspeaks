import { Link, useLocation } from 'react-router-dom';
import { Layout } from './Layout';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Calendar,
  Settings,
  PenTool,
  TrendingUp,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

interface BrandLayoutProps {
  children: React.ReactNode;
}

export function BrandLayout({ children }: BrandLayoutProps) {
  const location = useLocation();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        {
          label: 'Dashboard',
          path: '/mentor/brand',
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: 'Social Media',
      items: [
        {
          label: 'Create Post',
          path: '/mentor/social-media/new-post',
          icon: PenTool
        },
        {
          label: 'All Posts',
          path: '/mentor/social-media/manage',
          icon: FileText
        },
        {
          label: 'Scheduled',
          path: '/mentor/social-media/scheduled',
          icon: Clock
        },
        {
          label: 'Published',
          path: '/mentor/social-media/published',
          icon: CheckCircle
        },
        {
          label: 'Calendar',
          path: '/mentor/social-media/calendar',
          icon: Calendar
        }
      ]
    },
    {
      title: 'Analytics',
      items: [
        {
          label: 'Overview',
          path: '/mentor/analytics/overview',
          icon: BarChart3
        },
        {
          label: 'Engagement',
          path: '/mentor/analytics/engagement',
          icon: TrendingUp
        },
        {
          label: 'Audience',
          path: '/mentor/analytics/audience',
          icon: Users
        },
        {
          label: 'Profile Views',
          path: '/mentor/analytics/profile-views',
          icon: Eye
        }
      ]
    },
    {
      title: 'Mentee CRM',
      items: [
        {
          label: 'All Mentees',
          path: '/mentor/crm/all',
          icon: Users
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          label: 'Preferences',
          path: '/mentor/brand/settings',
          icon: Settings
        }
      ]
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-slate-50">
        <aside className="w-64 bg-white border-r border-slate-200 fixed h-full overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Brand Hub</h2>
            <p className="text-sm text-slate-600 mt-1">Manage your brand</p>
          </div>

          <nav className="p-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 ml-64">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </Layout>
  );
}
