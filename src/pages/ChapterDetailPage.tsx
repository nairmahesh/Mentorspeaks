import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, Users, Crown, Shield, UserCheck, Clock, CheckCircle, XCircle, Linkedin } from 'lucide-react';

interface Chapter {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  cover_image_url: string;
  allowed_countries: string[];
  member_count?: number;
  is_member?: boolean;
  pending_request?: boolean;
}

interface Leader {
  id: string;
  role: string;
  title: string;
  bio: string;
  display_order: number;
  user: {
    full_name: string;
    professional_title: string;
    linkedin_url: string;
    avatar_url: string;
  };
}

interface Member {
  id: string;
  joined_at: string;
  user: {
    full_name: string;
    professional_title: string;
  };
}

const roleIcons = {
  chapter_lead: <Crown className="w-5 h-5 text-yellow-600" />,
  co_lead: <Shield className="w-5 h-5 text-blue-600" />,
  community_manager: <UserCheck className="w-5 h-5 text-green-600" />,
  advisor: <Users className="w-5 h-5 text-purple-600" />
};

export function ChapterDetailPage() {
  const { slug } = useParams();
  const { user, profile } = useAuth();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'leadership' | 'members'>('overview');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadChapterDetails();
  }, [slug, user]);

  const loadChapterDetails = async () => {
    if (!slug) return;

    try {
      const { data: chapterData, error: chapterError } = await supabase
        .from('regional_chapters')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (chapterError) throw chapterError;

      const { count } = await supabase
        .from('chapter_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('chapter_id', chapterData.id)
        .eq('status', 'active');

      let is_member = false;
      let pending_request = false;

      if (user) {
        const { data: membershipData } = await supabase
          .from('chapter_memberships')
          .select('id')
          .eq('chapter_id', chapterData.id)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        is_member = !!membershipData;

        if (!is_member) {
          const { data: requestData } = await supabase
            .from('chapter_join_requests')
            .select('id')
            .eq('chapter_id', chapterData.id)
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

          pending_request = !!requestData;
        }
      }

      setChapter({
        ...chapterData,
        member_count: count || 0,
        is_member,
        pending_request
      });

      const { data: leadersData } = await supabase
        .from('chapter_leadership')
        .select(`
          *,
          user:user_id(full_name, professional_title, linkedin_url, avatar_url)
        `)
        .eq('chapter_id', chapterData.id)
        .eq('is_active', true)
        .order('display_order');

      if (leadersData) setLeaders(leadersData as any);

      const { data: membersData } = await supabase
        .from('chapter_memberships')
        .select(`
          id,
          joined_at,
          user:user_id(full_name, professional_title)
        `)
        .eq('chapter_id', chapterData.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false })
        .limit(50);

      if (membersData) setMembers(membersData as any);
    } catch (err: any) {
      setError(err.message || 'Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const requestToJoin = async () => {
    if (!user || !chapter) return;

    setRequesting(true);
    setError('');
    setSuccess('');

    try {
      if (!profile?.country) {
        throw new Error('Please update your profile with your country before requesting to join');
      }

      if (!chapter.allowed_countries.includes(profile.country)) {
        throw new Error(`This chapter is only available for: ${chapter.allowed_countries.join(', ')}`);
      }

      const { error: requestError } = await supabase
        .from('chapter_join_requests')
        .insert({
          user_id: user.id,
          chapter_id: chapter.id,
          status: 'pending'
        });

      if (requestError) throw requestError;

      setSuccess('Join request submitted! Chapter leadership will review your request.');
      loadChapterDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to submit join request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading chapter...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!chapter) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Chapter Not Found</h1>
          <p className="text-slate-600">The chapter you are looking for does not exist.</p>
        </div>
      </PublicLayout>
    );
  }

  const canRequestJoin = user && profile?.role === 'mentor' && !chapter.is_member && !chapter.pending_request;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-700 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <h1 className="text-4xl font-bold mb-2">{chapter.name}</h1>
                <p className="text-xl text-blue-100">{chapter.region}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{chapter.member_count} members</span>
                </div>
                {chapter.is_member && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">You're a member</span>
                  </div>
                )}
                {chapter.pending_request && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Request pending</span>
                  </div>
                )}
              </div>

              {canRequestJoin && (
                <button
                  onClick={requestToJoin}
                  disabled={requesting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {requesting ? 'Requesting...' : 'Request to Join'}
                </button>
              )}
            </div>

            <div className="flex space-x-2 mb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('leadership')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'leadership'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Leadership Team
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'members'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Members ({chapter.member_count})
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Chapter</h2>
                  <p className="text-slate-700 text-lg leading-relaxed">{chapter.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Eligible Countries</h3>
                  <div className="flex flex-wrap gap-2">
                    {chapter.allowed_countries.map((country) => (
                      <span
                        key={country}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                {leaders.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Leadership Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leaders.slice(0, 4).map((leader) => (
                        <div key={leader.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                          <div className="p-2 bg-white rounded-lg">
                            {roleIcons[leader.role as keyof typeof roleIcons]}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{leader.user.full_name}</h4>
                            <p className="text-sm text-blue-600 font-medium">{leader.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leadership' && (
              <div className="space-y-6">
                {leaders.map((leader) => (
                  <div key={leader.id} className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-white rounded-lg">
                        {roleIcons[leader.role as keyof typeof roleIcons]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{leader.user.full_name}</h3>
                        <p className="text-blue-600 font-medium mb-1">{leader.title}</p>
                        {leader.user.professional_title && (
                          <p className="text-slate-600 text-sm mb-3">{leader.user.professional_title}</p>
                        )}
                        {leader.bio && (
                          <p className="text-slate-700 mb-3">{leader.bio}</p>
                        )}
                        {leader.user.linkedin_url && (
                          <a
                            href={leader.user.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                          >
                            <Linkedin className="w-4 h-4" />
                            <span className="text-sm font-medium">Connect on LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {leaders.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-600">Leadership team will be announced soon</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-slate-900">{member.user.full_name}</h4>
                      {member.user.professional_title && (
                        <p className="text-sm text-slate-600">{member.user.professional_title}</p>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {members.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-600">No members yet. Be the first to join!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
