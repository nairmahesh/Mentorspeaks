import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, UserPlus, Trash2, Crown, User as UserIcon } from 'lucide-react';

interface Moderator {
  id: string;
  user_id: string;
  is_admin: boolean;
  bio: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    professional_title: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  professional_title: string;
  role: string;
}

export function ModeratorManagePage() {
  const { user, isModerator } = useAuth();
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('podcast_moderators')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (data?.is_admin) {
      setIsAdmin(true);
      loadData();
    } else {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);

    const [moderatorsResult, mentorsResult] = await Promise.all([
      supabase
        .from('podcast_moderators')
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            professional_title
          )
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, full_name, professional_title, role')
        .eq('role', 'mentor')
        .order('full_name')
    ]);

    if (moderatorsResult.data) {
      // Get emails from auth.users for each moderator
      const moderatorsWithEmail = await Promise.all(
        moderatorsResult.data.map(async (mod: any) => {
          const { data: authData } = await supabase.auth.admin.getUserById(mod.user_id);
          return {
            ...mod,
            user: {
              ...mod.user,
              email: authData?.user?.email || 'N/A'
            }
          };
        })
      );
      setModerators(moderatorsWithEmail as any);
    }

    if (mentorsResult.data) {
      setMentors(mentorsResult.data);
    }

    setLoading(false);
  };

  const addModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMentor) {
      setError('Please select a mentor');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('podcast_moderators')
        .insert({
          user_id: selectedMentor,
          is_admin: makeAdmin,
          bio: 'Podcast Moderator'
        });

      if (insertError) throw insertError;

      setSuccess('Moderator added successfully!');
      setShowAddForm(false);
      setSelectedMentor('');
      setMakeAdmin(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add moderator');
    }
  };

  const removeModerator = async (moderatorId: string) => {
    if (!confirm('Are you sure you want to remove this moderator?')) return;

    setError('');
    setSuccess('');

    try {
      const { error: deleteError } = await supabase
        .from('podcast_moderators')
        .delete()
        .eq('id', moderatorId);

      if (deleteError) throw deleteError;

      setSuccess('Moderator removed successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove moderator');
    }
  };

  const toggleAdminStatus = async (moderatorId: string, currentStatus: boolean) => {
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('podcast_moderators')
        .update({ is_admin: !currentStatus })
        .eq('id', moderatorId);

      if (updateError) throw updateError;

      setSuccess(`Admin status ${!currentStatus ? 'granted' : 'revoked'} successfully!`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update admin status');
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

  if (!isModerator || !isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Admin Access Required</h1>
          <p className="text-slate-600">You need admin moderator privileges to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Moderator Management</h1>
            <p className="text-slate-600 mt-1">Manage podcast moderators and their permissions</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Moderator</span>
          </button>
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

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Moderator</h2>
            <form onSubmit={addModerator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Mentor *
                </label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a mentor...</option>
                  {mentors
                    .filter(m => !moderators.find(mod => mod.user_id === m.id))
                    .map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.full_name} {mentor.professional_title && `- ${mentor.professional_title}`}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="makeAdmin"
                  type="checkbox"
                  checked={makeAdmin}
                  onChange={(e) => setMakeAdmin(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="makeAdmin" className="text-sm font-medium text-slate-700">
                  Grant admin privileges (can manage other moderators)
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Moderator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedMentor('');
                    setMakeAdmin(false);
                  }}
                  className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Current Moderators ({moderators.length})</h2>
          </div>

          <div className="divide-y divide-slate-200">
            {moderators.map((mod) => (
              <div key={mod.id} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      mod.is_admin ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-blue-100'
                    }`}>
                      {mod.is_admin ? (
                        <Crown className="w-6 h-6 text-white" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900">{mod.user?.full_name}</h3>
                        {mod.is_admin && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{mod.user?.email}</p>
                      {mod.user?.professional_title && (
                        <p className="text-sm text-slate-500 mt-1">{mod.user.professional_title}</p>
                      )}
                      {mod.bio && (
                        <p className="text-sm text-slate-600 mt-2">{mod.bio}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2">
                        Added {new Date(mod.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAdminStatus(mod.id, mod.is_admin)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        mod.is_admin
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {mod.is_admin ? 'Revoke Admin' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => removeModerator(mod.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Remove moderator"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {moderators.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p>No moderators yet. Add your first moderator above!</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Moderator Hierarchy</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start space-x-2">
              <Crown className="w-4 h-4 mt-0.5 text-orange-500" />
              <span><strong>Admin Moderators:</strong> Can create podcasts, manage episodes, and add/remove other moderators</span>
            </li>
            <li className="flex items-start space-x-2">
              <Shield className="w-4 h-4 mt-0.5 text-blue-500" />
              <span><strong>Regular Moderators:</strong> Can create and manage podcasts but cannot manage other moderators</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
