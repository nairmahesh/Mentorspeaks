import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  MoreVertical,
  ThumbsUp,
  MessageSquare,
  Share2
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: string;
  scheduled_for?: string;
  published_at?: string;
  created_at: string;
  campaign_tag?: string;
}

export function SocialMediaManagerPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedTab, selectedPlatform]);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('social_media_posts')
      .select('*')
      .eq('mentor_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const filterPosts = () => {
    let filtered = [...posts];

    if (selectedTab !== 'all') {
      filtered = filtered.filter(p => p.status === selectedTab);
    }

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(p => p.platform === selectedPlatform);
    }

    setFilteredPosts(filtered);
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
      .from('social_media_posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      loadPosts();
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <Edit className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 mr-1" />
            Scheduled
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Posts', count: posts.length },
    { id: 'draft', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
    { id: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
    { id: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length }
  ];

  const platforms = [
    { id: 'all', label: 'All Platforms', icon: FileText },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', label: 'Twitter', icon: Twitter },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'facebook', label: 'Facebook', icon: Facebook }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading posts...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Social Media Manager</h1>
            <p className="text-slate-600">Create, schedule, and track your social media content</p>
          </div>
          <Link
            to="/mentor/social-media/new-post"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Post
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex space-x-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-slate-100">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.label}
                    </option>
                  ))}
                </select>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${
                      viewMode === 'list'
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <Link
                    to="/mentor/social-media/calendar"
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Calendar className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <div
                    key={post.id}
                    className="p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {getPlatformIcon(post.platform)}
                        </div>
                        <div>
                          {post.title && (
                            <h3 className="font-semibold text-slate-900 mb-1">{post.title}</h3>
                          )}
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <span className="capitalize">{post.platform}</span>
                            <span>•</span>
                            {post.status === 'scheduled' && post.scheduled_for && (
                              <span>
                                Scheduled for {new Date(post.scheduled_for).toLocaleString()}
                              </span>
                            )}
                            {post.status === 'published' && post.published_at && (
                              <span>
                                Published {new Date(post.published_at).toLocaleString()}
                              </span>
                            )}
                            {post.status === 'draft' && (
                              <span>
                                Created {new Date(post.created_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(post.status)}
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/mentor/social-media/edit/${post.id}`}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-700 mb-4 line-clamp-3">{post.content}</p>

                    {post.campaign_tag && (
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {post.campaign_tag}
                        </span>
                      </div>
                    )}

                    {post.status === 'published' && (
                      <div className="flex items-center space-x-6 text-sm text-slate-500 pt-4 border-t border-slate-200">
                        <button className="flex items-center space-x-2 hover:text-slate-700">
                          <Eye className="w-4 h-4" />
                          <span>View Analytics</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No posts found</h3>
                <p className="text-slate-600 mb-6">
                  {selectedTab === 'all'
                    ? 'Create your first post to get started'
                    : `No ${selectedTab} posts yet`}
                </p>
                <Link
                  to="/mentor/social-media/new-post"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Post
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
