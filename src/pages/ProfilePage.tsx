import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Industry } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { User, Briefcase, Save } from 'lucide-react';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [professionalTitle, setProfessionalTitle] = useState(profile?.professional_title || '');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIndustries();
    if (profile?.role === 'mentor') {
      loadMentorIndustries();
    }
  }, [profile]);

  const loadIndustries = async () => {
    const { data } = await supabase
      .from('industries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) setIndustries(data);
  };

  const loadMentorIndustries = async () => {
    const { data } = await supabase
      .from('mentor_industries')
      .select('industry_id')
      .eq('mentor_id', user!.id);

    if (data) {
      setSelectedIndustries(data.map(mi => mi.industry_id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio || null,
          professional_title: professionalTitle || null,
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      if (profile?.role === 'mentor' && selectedIndustries.length > 0) {
        await supabase
          .from('mentor_industries')
          .delete()
          .eq('mentor_id', user!.id);

        const { error: industriesError } = await supabase
          .from('mentor_industries')
          .insert(
            selectedIndustries.map(industryId => ({
              mentor_id: user!.id,
              industry_id: industryId,
            }))
          );

        if (industriesError) throw industriesError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleIndustry = (industryId: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Profile Settings</h1>
          </div>
          <p className="text-slate-600">Manage your account information</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email (cannot be changed)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role (cannot be changed)
            </label>
            <input
              type="text"
              value={profile?.role || ''}
              disabled
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 capitalize"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {profile?.role === 'mentor' && (
            <div>
              <label htmlFor="professionalTitle" className="block text-sm font-medium text-slate-700 mb-2">
                Professional Title
              </label>
              <input
                id="professionalTitle"
                type="text"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Senior Software Engineer at Google"
              />
            </div>
          )}

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          {profile?.role === 'mentor' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Industries & Expertise</span>
                </div>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => toggleIndustry(industry.id)}
                    className={`px-4 py-3 rounded-lg border-2 transition text-left ${
                      selectedIndustries.includes(industry.id)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{industry.icon || '📁'}</span>
                      <span className="text-sm font-medium">{industry.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
