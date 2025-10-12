import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, CheckCircle, XCircle, UserCheck, Users, Flag, Eye, Ban, Trash2 } from 'lucide-react';

interface VerificationRequest {
  id: string;
  user_id: string;
  status: string;
  requested_at: string;
  user: {
    full_name: string;
    professional_title: string;
    bio: string;
    email: string;
  };
  chapter: {
    name: string;
  } | null;
}

interface ModeratorPermissions {
  can_verify_mentors: boolean;
  can_moderate_content: boolean;
  can_create_podcasts: boolean;
  can_assign_moderators: boolean;
}

interface CommunityModerator {
  id: string;
  role: string;
  permissions: ModeratorPermissions;
  is_active: boolean;
}

export function CommunityManagePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [moderatorInfo, setModeratorInfo] = useState<CommunityModerator | null>(null);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkModeratorStatus();
  }, [user]);

  const checkModeratorStatus = async () => {
    if (!user) return;

    try {
      const { data: modData, error: modError } = await supabase
        .from('community_moderators')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (modError) throw modError;

      setModeratorInfo(modData as any);

      if (modData.permissions.can_verify_mentors) {
        loadVerificationRequests();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationRequests = async () => {
    const { data, error: reqError } = await supabase
      .from('mentor_verification_requests')
      .select(`
        *,
        user:user_id(full_name, professional_title, bio),
        chapter:chapter_id(name)
      `)
      .order('requested_at', { ascending: false });

    if (data) {
      setVerificationRequests(data as any);
    }
  };

  const handleVerification = async (requestId: string, userId: string, approve: boolean) => {
    setProcessing(requestId);
    setError('');
    setSuccess('');

    try {
      const status = approve ? 'approved' : 'rejected';

      const { error: updateError } = await supabase
        .from('mentor_verification_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user!.id
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (approve) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            verification_status: 'verified',
            verified_at: new Date().toISOString(),
            verified_by: user!.id
          })
          .eq('id', userId);

        if (profileError) throw profileError;
      }

      const { error: actionError } = await supabase
        .from('moderation_actions')
        .insert({
          moderator_id: user!.id,
          action_type: approve ? 'approve_mentor' : 'reject_mentor',
          target_type: 'user',
          target_id: userId,
          reason: approve ? 'Mentor verified' : 'Verification rejected'
        });

      if (actionError) throw actionError;

      setSuccess(`Mentor ${approve ? 'approved' : 'rejected'} successfully!`);
      loadVerificationRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to process verification');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!moderatorInfo) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600">You need community moderator privileges to access this page.</p>
        </div>
      </Layout>
    );
  }

  const filteredRequests = verificationRequests.filter(r => r.status === activeTab);
  const stats = {
    pending: verificationRequests.filter(r => r.status === 'pending').length,
    approved: verificationRequests.filter(r => r.status === 'approved').length,
    rejected: verificationRequests.filter(r => r.status === 'rejected').length
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Management</h1>
          <p className="text-slate-600">Manage mentor verifications and community moderation</p>
        </div>

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

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Permissions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border-2 ${moderatorInfo.permissions.can_verify_mentors ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
              <UserCheck className={`w-6 h-6 mb-2 ${moderatorInfo.permissions.can_verify_mentors ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="text-sm font-medium">Verify Mentors</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${moderatorInfo.permissions.can_moderate_content ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
              <Flag className={`w-6 h-6 mb-2 ${moderatorInfo.permissions.can_moderate_content ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="text-sm font-medium">Moderate Content</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${moderatorInfo.permissions.can_create_podcasts ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
              <Eye className={`w-6 h-6 mb-2 ${moderatorInfo.permissions.can_create_podcasts ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="text-sm font-medium">Create Podcasts</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${moderatorInfo.permissions.can_assign_moderators ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
              <Users className={`w-6 h-6 mb-2 ${moderatorInfo.permissions.can_assign_moderators ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="text-sm font-medium">Assign Moderators</div>
            </div>
          </div>
        </div>

        {moderatorInfo.permissions.can_verify_mentors && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Mentor Verification Requests</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-yellow-800">Pending Review</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-green-800">Approved</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-red-800">Rejected</div>
              </div>
            </div>

            <div className="flex space-x-2 mb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'pending'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'approved'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'rejected'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>

            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{request.user.full_name}</h3>
                      {request.user.professional_title && (
                        <p className="text-blue-600 font-medium">{request.user.professional_title}</p>
                      )}
                      {request.chapter && (
                        <p className="text-sm text-slate-500 mt-1">Chapter: {request.chapter.name}</p>
                      )}
                      {request.user.bio && (
                        <p className="text-slate-700 mt-3">{request.user.bio}</p>
                      )}
                      <p className="text-sm text-slate-500 mt-3">
                        Requested: {new Date(request.requested_at).toLocaleString()}
                      </p>
                    </div>

                    {activeTab === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleVerification(request.id, request.user_id, true)}
                          disabled={processing === request.id}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleVerification(request.id, request.user_id, false)}
                          disabled={processing === request.id}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {activeTab !== 'pending' && (
                      <div className={`px-4 py-2 rounded-lg ${
                        request.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status === 'approved' ? 'Approved' : 'Rejected'}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredRequests.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-600">No {activeTab} verification requests</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
