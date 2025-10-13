import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  Eye,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  ThumbsUp,
  Share2,
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  draftPosts: number;
  totalEngagements: number;
  profileViews: number;
  followerGrowth: number;
  avgEngagementRate: number;
  totalMentees: number;
  upcomingFollowups: number;
}

interface RecentPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  published_at: string;
  engagement?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export function MentorBrandDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    scheduledPosts: 0,
    draftPosts: 0,
    totalEngagements: 0,
    profileViews: 0,
    followerGrowth: 0,
    avgEngagementRate: 0,
    totalMentees: 0,
    upcomingFollowups: 0
  });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);

    const [postsResult, analyticsResult, menteesResult] = await Promise.all([
      supabase
        .from('social_media_posts')
        .select('id, status, published_at')
        .eq('mentor_id', user!.id),

      supabase
        .from('mentor_analytics')
        .select('*')
        .eq('mentor_id', user!.id)
        .order('date', { ascending: false })
        .limit(30),

      supabase
        .from('mentee_relationships')
        .select('id, next_followup_date')
        .eq('mentor_id', user!.id)
    ]);

    if (postsResult.data) {
      const total = postsResult.data.length;
      const scheduled = postsResult.data.filter(p => p.status === 'scheduled').length;
      const drafts = postsResult.data.filter(p => p.status === 'draft').length;

      setStats(prev => ({
        ...prev,
        totalPosts: total,
        scheduledPosts: scheduled,
        draftPosts: drafts
      }));
    }

    if (analyticsResult.data && analyticsResult.data.length > 0) {
      const latest = analyticsResult.data[0];
      const weekAgo = analyticsResult.data[7] || analyticsResult.data[analyticsResult.data.length - 1];

      const profileViews = latest.profile_views || 0;
      const followerGrowth = weekAgo ? ((latest.follower_count - weekAgo.follower_count) / (weekAgo.follower_count || 1)) * 100 : 0;
      const totalEngagements = latest.total_engagements || 0;
      const avgEngagement = latest.avg_engagement_rate || 0;

      setStats(prev => ({
        ...prev,
        profileViews,
        followerGrowth: Math.round(followerGrowth * 10) / 10,
        totalEngagements,
        avgEngagementRate: Math.round(avgEngagement * 10) / 10
      }));
    }

    if (menteesResult.data) {
      const total = menteesResult.data.length;
      const upcoming = menteesResult.data.filter(m => {
        if (!m.next_followup_date) return false;
        const followupDate = new Date(m.next_followup_date);
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return followupDate <= weekFromNow;
      }).length;

      setStats(prev => ({
        ...prev,
        totalMentees: total,
        upcomingFollowups: upcoming
      }));
    }

    const { data: recentPostsData } = await supabase
      .from('social_media_posts')
      .select('id, title, content, platform, published_at')
      .eq('mentor_id', user!.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);

    if (recentPostsData) {
      setRecentPosts(recentPostsData);
    }

    setLoading(false);
  };

  const statCards = [
    {
      title: 'Profile Views',
      value: stats.profileViews,
      change: '+12%',
      icon: Eye,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      subtitle: `${stats.scheduledPosts} scheduled`,
      icon: FileText,
      color: 'bg-green-500',
      link: '/mentor/social-media'
    },
    {
      title: 'Engagement Rate',
      value: `${stats.avgEngagementRate}%`,
      change: `${stats.followerGrowth >= 0 ? '+' : ''}${stats.followerGrowth}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: stats.followerGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: 'Mentee Relationships',
      value: stats.totalMentees,
      subtitle: `${stats.upcomingFollowups} follow-ups due`,
      icon: Users,
      color: 'bg-orange-500',
      link: '/mentor/crm'
    }
  ];

  const quickActions = [
    {
      title: 'Create Post',
      description: 'Draft a new social media post',
      icon: FileText,
      color: 'bg-blue-500',
      link: '/mentor/social-media/new-post'
    },
    {
      title: 'View Calendar',
      description: 'See your content schedule',
      icon: Calendar,
      color: 'bg-green-500',
      link: '/mentor/social-media/calendar'
    },
    {
      title: 'Analytics',
      description: 'Check performance metrics',
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/mentor/analytics'
    },
    {
      title: 'Manage Mentees',
      description: 'Update relationship notes',
      icon: Users,
      color: 'bg-orange-500',
      link: '/mentor/crm'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Brand Dashboard</h1>
          </div>
          <p className="text-slate-600">Manage your personal brand, content, and network in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                {card.trend && (
                  <span className={`text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                )}
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-slate-900 mb-1">{card.value}</p>
              {card.subtitle && (
                <p className="text-sm text-slate-500">{card.subtitle}</p>
              )}
              {card.link && (
                <Link
                  to={card.link}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mt-2"
                >
                  View details <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md transition group"
                >
                  <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recent Posts</h2>
              <Link
                to="/mentor/social-media"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
            {recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map(post => (
                  <div
                    key={post.id}
                    className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                        {post.platform}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    {post.title && (
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.content}</p>
                    {post.engagement && (
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.engagement.views}
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {post.engagement.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {post.engagement.comments}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="w-3 h-3 mr-1" />
                          {post.engagement.shares}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No posts yet</p>
                <Link
                  to="/mentor/social-media/new-post"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Your First Post
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Boost Your Personal Brand</h2>
              <p className="text-blue-100 mb-4">
                Schedule posts, track engagement, and grow your network with powerful tools
              </p>
              <Link
                to="/mentor/social-media"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <Target className="w-24 h-24 text-blue-200 opacity-50 hidden lg:block" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
