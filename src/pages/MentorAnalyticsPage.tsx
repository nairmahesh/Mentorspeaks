import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
  Target,
  Calendar,
  Award
} from 'lucide-react';

interface AnalyticsData {
  profileViews: number;
  profileViewsChange: number;
  followerCount: number;
  followerChange: number;
  totalEngagements: number;
  engagementChange: number;
  avgEngagementRate: number;
  rateChange: number;
  topPosts: Array<{
    id: string;
    title: string;
    content: string;
    platform: string;
    published_at: string;
    engagement: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
  }>;
  weeklyData: Array<{
    date: string;
    views: number;
    engagements: number;
  }>;
}

export function MentorAnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    profileViews: 0,
    profileViewsChange: 0,
    followerCount: 0,
    followerChange: 0,
    totalEngagements: 0,
    engagementChange: 0,
    avgEngagementRate: 0,
    rateChange: 0,
    topPosts: [],
    weeklyData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: analyticsData } = await supabase
      .from('mentor_analytics')
      .select('*')
      .eq('mentor_id', user!.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (analyticsData && analyticsData.length > 0) {
      const latest = analyticsData[0];
      const previous = analyticsData[Math.min(7, analyticsData.length - 1)];

      const calculateChange = (current: number, prev: number) => {
        if (!prev) return 0;
        return ((current - prev) / prev) * 100;
      };

      setAnalytics({
        profileViews: latest.profile_views || 0,
        profileViewsChange: calculateChange(latest.profile_views, previous.profile_views),
        followerCount: latest.follower_count || 0,
        followerChange: calculateChange(latest.follower_count, previous.follower_count),
        totalEngagements: latest.total_engagements || 0,
        engagementChange: calculateChange(latest.total_engagements, previous.total_engagements),
        avgEngagementRate: latest.avg_engagement_rate || 0,
        rateChange: calculateChange(latest.avg_engagement_rate, previous.avg_engagement_rate),
        topPosts: [],
        weeklyData: analyticsData.reverse().map(d => ({
          date: d.date,
          views: d.profile_views,
          engagements: d.total_engagements
        }))
      });
    }

    setLoading(false);
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-slate-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Analytics</h1>
            <p className="text-slate-600">Track your profile performance and engagement metrics</p>
          </div>
          <div className="flex space-x-2">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Profile Views"
            value={analytics.profileViews.toLocaleString()}
            change={analytics.profileViewsChange}
            icon={Eye}
            color="bg-blue-500"
          />
          <StatCard
            title="Followers"
            value={analytics.followerCount.toLocaleString()}
            change={analytics.followerChange}
            icon={Users}
            color="bg-green-500"
          />
          <StatCard
            title="Total Engagements"
            value={analytics.totalEngagements.toLocaleString()}
            change={analytics.engagementChange}
            icon={ThumbsUp}
            color="bg-purple-500"
          />
          <StatCard
            title="Engagement Rate"
            value={`${analytics.avgEngagementRate.toFixed(1)}%`}
            change={analytics.rateChange}
            icon={Target}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Views Trend</h2>
            <div className="space-y-4">
              {analytics.weeklyData.slice(-7).map((day, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-semibold text-slate-900">{day.views} views</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((day.views / Math.max(...analytics.weeklyData.map(d => d.views))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Engagement Trend</h2>
            <div className="space-y-4">
              {analytics.weeklyData.slice(-7).map((day, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-semibold text-slate-900">{day.engagements} interactions</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((day.engagements / Math.max(...analytics.weeklyData.map(d => d.engagements))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Insights & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Best Time to Post</h3>
              </div>
              <p className="text-sm text-slate-600">Tuesday & Thursday, 9-11 AM get 40% more engagement</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-slate-900">Content Performance</h3>
              </div>
              <p className="text-sm text-slate-600">How-to posts get 2x more engagement than updates</p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Award className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-slate-900">Growth Opportunity</h3>
              </div>
              <p className="text-sm text-slate-600">Increase posting frequency to 3x/week for better reach</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
