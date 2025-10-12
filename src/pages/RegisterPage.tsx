import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Industry } from '../lib/supabase';
import * as LucideIcons from 'lucide-react';
import { Video, ChevronRight, ChevronLeft, Briefcase, DollarSign, Heart, Folder, UserCircle, GraduationCap, ArrowLeft, Linkedin } from 'lucide-react';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'seeker' | 'mentor'>('seeker');
  const [step, setStep] = useState(1);

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  // New mentor fields
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [willingToMentor, setWillingToMentor] = useState<string[]>([]);
  const [mentoringRateType, setMentoringRateType] = useState<'free' | 'paid' | 'both'>('paid');
  const [freeHoursPerWeek, setFreeHoursPerWeek] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Legacy consulting fields (will be removed)
  const [offersConsulting, setOffersConsulting] = useState(false);
  const [consultingType, setConsultingType] = useState<'free' | 'paid' | 'hybrid'>('paid');
  const [consultingRate, setConsultingRate] = useState('');
  const [freeHours, setFreeHours] = useState('');
  const [consultingDescription, setConsultingDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    const { data } = await supabase
      .from('industries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) setIndustries(data);
  };

  const toggleIndustry = (industryId: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    );
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

    if (role === 'mentor' && step === 1) {
      if (!linkedinUrl) {
        setError('LinkedIn URL is required for mentors');
        return;
      }
      if (!yearsOfExperience) {
        setError('Years of experience is required');
        return;
      }
      setStep(2);
      return;
    }

    if (role === 'mentor' && step === 2) {
      if (selectedIndustries.length === 0) {
        setError('Please select at least one industry');
        return;
      }
      if (willingToMentor.length === 0) {
        setError('Please select at least one mentee level');
        return;
      }
      if ((mentoringRateType === 'free' || mentoringRateType === 'both') && !freeHoursPerWeek) {
        setError('Please specify free hours per week');
        return;
      }
      if ((mentoringRateType === 'paid' || mentoringRateType === 'both') && !hourlyRate) {
        setError('Please specify hourly rate');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      if (data.user) {
        const profileData: any = {
          id: data.user.id,
          full_name: fullName,
          role: role,
        };

        if (role === 'mentor') {
          profileData.linkedin_url = linkedinUrl;
          profileData.years_of_experience = parseInt(yearsOfExperience);
          profileData.willing_to_mentor = willingToMentor;
          profileData.mentoring_rate_type = mentoringRateType;

          if (mentoringRateType === 'free' || mentoringRateType === 'both') {
            profileData.free_hours_per_week = parseInt(freeHoursPerWeek);
          }

          if (mentoringRateType === 'paid' || mentoringRateType === 'both') {
            profileData.hourly_rate = parseFloat(hourlyRate);
          }

          // Legacy fields for backward compatibility
          profileData.offers_consulting = offersConsulting;
          if (offersConsulting) {
            profileData.consulting_type = consultingType;
            profileData.consulting_rate_inr = consultingType !== 'free' ? parseFloat(consultingRate) : 0;
            profileData.free_hours_per_month = consultingType !== 'paid' ? parseInt(freeHours) : 0;
            profileData.consulting_description = consultingDescription;
          }
        }

        const { error: profileError } = await supabase.from('profiles').insert(profileData);
        if (profileError) throw profileError;

        if (role === 'mentor' && selectedIndustries.length > 0) {
          const { error: industriesError } = await supabase
            .from('mentor_industries')
            .insert(
              selectedIndustries.map(industryId => ({
                mentor_id: data.user!.id,
                industry_id: industryId,
              }))
            );
          if (industriesError) throw industriesError;
        }
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-orange-600 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 text-3xl font-bold text-slate-900 mb-2 hover:text-orange-600 transition">
            <Video className="w-10 h-10 text-orange-600" />
            <div className="flex flex-col">
              <span>effyMentor</span>
              <span className="text-xs text-slate-500 font-medium italic -mt-1">Where Experience Speaks</span>
            </div>
          </Link>
          <p className="text-slate-600 mt-3">Join the global professional expert platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {role === 'mentor' && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  1
                </div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-orange-600' : 'bg-slate-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                <span>Account Details</span>
                <span>Expertise & Consulting</span>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {step === 1 ? 'Create Account' : 'Complete Your Profile'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    I want to join as
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('seeker')}
                      className={`px-4 py-4 rounded-xl border-2 transition ${
                        role === 'seeker'
                          ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-md'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <UserCircle className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                      <div className="font-semibold">Seeker</div>
                      <div className="text-xs mt-1">Ask questions</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('mentor')}
                      className={`px-4 py-4 rounded-xl border-2 transition ${
                        role === 'mentor'
                          ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-md'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <GraduationCap className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                      <div className="font-semibold">Mentor</div>
                      <div className="text-xs mt-1">Share insights</div>
                    </button>
                  </div>
                </div>

                {role === 'mentor' && (
                  <>
                    <div>
                      <label htmlFor="linkedinUrl" className="block text-sm font-medium text-slate-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn Profile URL *</span>
                        </div>
                      </label>
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-slate-700 mb-2">
                        Years of Professional Experience *
                      </label>
                      <input
                        id="yearsOfExperience"
                        type="number"
                        min="0"
                        max="70"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        placeholder="10"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {step === 2 && role === 'mentor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Select Your Industries</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2">
                    {industries.map((industry) => {
                      const IconComponent = (LucideIcons as any)[industry.icon || 'Folder'] || Folder;
                      return (
                        <button
                          key={industry.id}
                          type="button"
                          onClick={() => toggleIndustry(industry.id)}
                          className={`px-3 py-3 rounded-xl border-2 transition text-left text-sm hover:shadow-md ${
                            selectedIndustries.includes(industry.id)
                              ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-md'
                              : 'border-slate-300 bg-white text-slate-700 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedIndustries.includes(industry.id)
                                ? 'bg-orange-600'
                                : 'bg-slate-100'
                            }`}>
                              <IconComponent className={`w-4 h-4 ${
                                selectedIndustries.includes(industry.id) ? 'text-white' : 'text-slate-600'
                              }`} />
                            </div>
                            <span className="font-medium text-xs">{industry.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Willing to Mentor *
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
                            ? 'border-orange-600 bg-orange-50 text-orange-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Mentoring Rate *
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
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
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
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
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
                          Free Hours Per Week *
                        </label>
                        <input
                          id="freeHoursPerWeek"
                          type="number"
                          min="1"
                          max="168"
                          value={freeHoursPerWeek}
                          onChange={(e) => setFreeHoursPerWeek(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                          placeholder="5"
                        />
                      </div>
                    )}

                    {(mentoringRateType === 'paid' || mentoringRateType === 'both') && (
                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium text-slate-700 mb-2">
                          Hourly Rate (USD) *
                        </label>
                        <input
                          id="hourlyRate"
                          type="number"
                          min="1"
                          step="0.01"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                          placeholder="100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5" style={{ display: 'none' }}>
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      id="offersConsulting"
                      type="checkbox"
                      checked={offersConsulting}
                      onChange={(e) => setOffersConsulting(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="offersConsulting" className="text-sm font-medium text-slate-700">
                      I want to offer one-on-one consulting services
                    </label>
                  </div>

                  {offersConsulting && (
                    <div className="space-y-4 pl-7 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                          Consulting Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setConsultingType('free')}
                            className={`px-4 py-3 rounded-lg border-2 transition text-center ${
                              consultingType === 'free'
                                ? 'border-green-600 bg-green-50 text-green-700'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            <Heart className="w-5 h-5 mx-auto mb-1" />
                            <div className="font-medium text-xs">Free</div>
                            <div className="text-xs mt-1 opacity-75">Service to society</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConsultingType('paid')}
                            className={`px-4 py-3 rounded-lg border-2 transition text-center ${
                              consultingType === 'paid'
                                ? 'border-orange-600 bg-orange-50 text-orange-700'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            <DollarSign className="w-5 h-5 mx-auto mb-1" />
                            <div className="font-medium text-xs">Paid</div>
                            <div className="text-xs mt-1 opacity-75">Professional rate</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConsultingType('hybrid')}
                            className={`px-4 py-3 rounded-lg border-2 transition text-center ${
                              consultingType === 'hybrid'
                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-center mb-1">
                              <Heart className="w-4 h-4" />
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div className="font-medium text-xs">Hybrid</div>
                            <div className="text-xs mt-1 opacity-75">Mix of both</div>
                          </button>
                        </div>
                      </div>

                      {consultingType !== 'free' && (
                        <div>
                          <label htmlFor="consultingRate" className="block text-sm font-medium text-slate-700 mb-2">
                            Hourly Rate (INR)
                          </label>
                          <input
                            id="consultingRate"
                            type="number"
                            value={consultingRate}
                            onChange={(e) => setConsultingRate(e.target.value)}
                            required
                            min="0"
                            step="100"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., 2000"
                          />
                        </div>
                      )}

                      {consultingType !== 'paid' && (
                        <div>
                          <label htmlFor="freeHours" className="block text-sm font-medium text-slate-700 mb-2">
                            Free Hours per Month
                          </label>
                          <input
                            id="freeHours"
                            type="number"
                            value={freeHours}
                            onChange={(e) => setFreeHours(e.target.value)}
                            required
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="e.g., 5"
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="consultingDescription" className="block text-sm font-medium text-slate-700 mb-2">
                          Consulting Description
                        </label>
                        <textarea
                          id="consultingDescription"
                          value={consultingDescription}
                          onChange={(e) => setConsultingDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Describe what you can help with in consulting sessions..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex space-x-4 pt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-2 px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Creating account...' : step === 2 || role === 'seeker' ? 'Create Account' : 'Continue'}</span>
                {step === 1 && role === 'mentor' && !loading && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
