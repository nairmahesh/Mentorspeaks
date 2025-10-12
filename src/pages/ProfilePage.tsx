import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Industry } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { User, Briefcase, Save, Linkedin, Heart, DollarSign, Sparkles, Target } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [professionalTitle, setProfessionalTitle] = useState(profile?.professional_title || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [userInterestIndustries, setUserInterestIndustries] = useState<string[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);

  // New mentor fields
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(profile?.years_of_experience?.toString() || '');
  const [willingToMentor, setWillingToMentor] = useState<string[]>(profile?.willing_to_mentor || []);
  const [mentoringRateType, setMentoringRateType] = useState<'free' | 'paid' | 'both'>(profile?.mentoring_rate_type || 'paid');
  const [freeHoursPerWeek, setFreeHoursPerWeek] = useState(profile?.free_hours_per_week?.toString() || '');
  const [hourlyRate, setHourlyRate] = useState(profile?.hourly_rate?.toString() || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIndustries();
    if (profile?.role === 'mentor') {
      loadMentorIndustries();
    }
    loadUserInterests();
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

  const loadUserInterests = async () => {
    const { data } = await supabase
      .from('user_interests')
      .select('industry_id')
      .eq('user_id', user!.id)
      .eq('interest_type', 'industry')
      .not('industry_id', 'is', null);

    if (data) {
      setUserInterestIndustries(data.map((i: any) => i.industry_id));
    }
  };

  const toggleMenteeType = (type: string) => {
    setWillingToMentor(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const updateData: any = {
        full_name: fullName,
        bio: bio || null,
        professional_title: professionalTitle || null,
        country: country || null,
      };

      // Add mentor-specific fields
      if (profile?.role === 'mentor') {
        updateData.linkedin_url = linkedinUrl || null;
        updateData.years_of_experience = yearsOfExperience ? parseInt(yearsOfExperience) : null;
        updateData.willing_to_mentor = willingToMentor;
        updateData.mentoring_rate_type = mentoringRateType;

        if (mentoringRateType === 'free' || mentoringRateType === 'both') {
          updateData.free_hours_per_week = freeHoursPerWeek ? parseInt(freeHoursPerWeek) : null;
        }

        if (mentoringRateType === 'paid' || mentoringRateType === 'both') {
          updateData.hourly_rate = hourlyRate ? parseFloat(hourlyRate) : null;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
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

      // Save user interests for all users
      if (userInterestIndustries.length > 0) {
        await supabase
          .from('user_interests')
          .delete()
          .eq('user_id', user!.id)
          .eq('interest_type', 'industry');

        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(
            userInterestIndustries.map(industryId => ({
              user_id: user!.id,
              industry_id: industryId,
              interest_type: 'industry'
            }))
          );

        if (interestsError) throw interestsError;

        // Mark onboarding as completed
        await supabase
          .from('user_feed_preferences')
          .upsert({
            user_id: user!.id,
            onboarding_completed: true
          });
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

  const toggleUserInterest = (industryId: string) => {
    setUserInterestIndustries(prev =>
      prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    );
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <User className="w-8 h-8 text-blue-600" />
                <h1 className="text-4xl font-bold text-slate-900">Profile Settings</h1>
              </div>
              <p className="text-slate-600">Manage your account information</p>
            </div>
            {linkedinUrl && (
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <Linkedin className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">LinkedIn Connected</span>
              </div>
            )}
          </div>
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
              Country *
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select your country</option>
              <option value="India">India</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Nepal">Nepal</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Bhutan">Bhutan</option>
              <option value="Maldives">Maldives</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="Qatar">Qatar</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Oman">Oman</option>
              <option value="Jordan">Jordan</option>
              <option value="Lebanon">Lebanon</option>
              <option value="Egypt">Egypt</option>
              <option value="Turkey">Turkey</option>
              <option value="Israel">Israel</option>
              <option value="Singapore">Singapore</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Thailand">Thailand</option>
              <option value="Philippines">Philippines</option>
              <option value="Vietnam">Vietnam</option>
              <option value="Myanmar">Myanmar</option>
              <option value="Cambodia">Cambodia</option>
              <option value="Laos">Laos</option>
              <option value="Brunei">Brunei</option>
              <option value="Timor-Leste">Timor-Leste</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Required to join regional chapters</p>
          </div>

          {profile?.role === 'mentor' && (
            <>
              <div>
                <label htmlFor="professionalTitle" className="block text-sm font-medium text-slate-700 mb-2">
                  Professional Title
                </label>
                <input
                  id="professionalTitle"
                  type="text"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer at Google"
                />
              </div>

              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Linkedin className={`w-4 h-4 ${linkedinUrl ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>LinkedIn Profile URL</span>
                    {linkedinUrl && (
                      <span className="text-xs text-blue-600 font-medium">✓ Added</span>
                    )}
                  </div>
                </label>
                <input
                  id="linkedinUrl"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                    linkedinUrl ? 'border-blue-300 bg-blue-50' : 'border-slate-300'
                  }`}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 mb-2">
                  Years of Professional Experience
                </label>
                <input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="70"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
            </>
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>Your Interests</span>
              </div>
            </label>
            <p className="text-sm text-slate-600 mb-4">
              Select industries you're interested in to get personalized content recommendations
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {industries.map((industry) => {
                const IconComponent = industry.icon && (LucideIcons as any)[industry.icon];
                return (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => toggleUserInterest(industry.id)}
                    className={`px-4 py-3 rounded-lg border-2 transition text-left ${
                      userInterestIndustries.includes(industry.id)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {IconComponent ? (
                        <IconComponent className="w-5 h-5" />
                      ) : (
                        <Briefcase className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">{industry.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
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
                {industries.map((industry) => {
                  const IconComponent = industry.icon && (LucideIcons as any)[industry.icon];
                  return (
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
                        {IconComponent ? (
                          <IconComponent className="w-5 h-5" />
                        ) : (
                          <Briefcase className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">{industry.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Willing to Mentor
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'students', label: 'Students' },
                    { value: 'entry_level', label: 'Entry Level' },
                    { value: 'mid_level', label: 'Mid Level' },
                    { value: 'senior_level', label: 'Senior Level' },
                    { value: 'anyone', label: 'Anyone' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleMenteeType(type.value)}
                      className={`px-3 py-2 rounded-lg border-2 transition text-sm ${
                        willingToMentor.includes(type.value)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Mentoring Rate
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setMentoringRateType('free')}
                    className={`px-4 py-3 rounded-lg border-2 transition text-center ${
                      mentoringRateType === 'free'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <Heart className="w-5 h-5 mx-auto mb-1" />
                    <div className="font-medium text-sm">Free</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMentoringRateType('paid')}
                    className={`px-4 py-3 rounded-lg border-2 transition text-center ${
                      mentoringRateType === 'paid'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 mx-auto mb-1" />
                    <div className="font-medium text-sm">Paid</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMentoringRateType('both')}
                    className={`px-4 py-3 rounded-lg border-2 transition text-center ${
                      mentoringRateType === 'both'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="w-4 h-4" />
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="font-medium text-sm">Both</div>
                  </button>
                </div>

                <div className="space-y-4">
                  {(mentoringRateType === 'free' || mentoringRateType === 'both') && (
                    <div>
                      <label htmlFor="freeHoursPerWeek" className="block text-sm font-medium text-slate-700 mb-2">
                        Free Hours Per Week
                      </label>
                      <input
                        id="freeHoursPerWeek"
                        type="number"
                        min="1"
                        max="168"
                        value={freeHoursPerWeek}
                        onChange={(e) => setFreeHoursPerWeek(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                  )}

                  {(mentoringRateType === 'paid' || mentoringRateType === 'both') && (
                    <div>
                      <label htmlFor="hourlyRate" className="block text-sm font-medium text-slate-700 mb-2">
                        Hourly Rate (USD)
                      </label>
                      <input
                        id="hourlyRate"
                        type="number"
                        min="1"
                        step="0.01"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="100"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
