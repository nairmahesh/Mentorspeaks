import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { supabase } from '../lib/supabase';
import { Building2, Mail, Phone, User, Briefcase, Users, Globe, CreditCard, CheckCircle2 } from 'lucide-react';

export function CorporateSignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyWebsite: '',
    industry: '',
    employeeCount: '',
    contactPersonName: '',
    contactPersonTitle: '',
    phoneNumber: '',
    subscriptionTier: 'starter',
    billingCycle: 'monthly'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('corporate_accounts')
        .insert([{
          company_name: formData.companyName,
          company_email: formData.companyEmail,
          company_website: formData.companyWebsite,
          industry: formData.industry,
          employee_count: formData.employeeCount,
          contact_person_name: formData.contactPersonName,
          contact_person_title: formData.contactPersonTitle,
          phone_number: formData.phoneNumber,
          subscription_tier: formData.subscriptionTier,
          billing_cycle: formData.billingCycle,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      navigate('/corporate/thank-you', {
        state: { email: formData.companyEmail, company: formData.companyName }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit corporate signup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-900">FOR ENTERPRISES</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Enterprise Knowledge Sharing Platform
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Connect your employees with industry experts, build internal knowledge hubs, and empower your teams with on-demand mentorship
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Acme Corporation"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="contact@acme.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="https://acme.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Industry
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Technology, Healthcare, Finance..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select size</option>
                      <option value="1-50">1-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1,000 employees</option>
                      <option value="1001-5000">1,001-5,000 employees</option>
                      <option value="5000+">5,000+ employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Person Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Person Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="contactPersonTitle"
                      value={formData.contactPersonTitle}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Head of Communications"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Choose Your Plan</span>
                </h3>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.subscriptionTier === 'starter'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="subscriptionTier"
                      value="starter"
                      checked={formData.subscriptionTier === 'starter'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 mb-1">Starter</span>
                    <span className="text-sm text-slate-600">Perfect for small teams</span>
                    {formData.subscriptionTier === 'starter' && (
                      <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                    )}
                  </label>

                  <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.subscriptionTier === 'professional'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="subscriptionTier"
                      value="professional"
                      checked={formData.subscriptionTier === 'professional'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 mb-1">Professional</span>
                    <span className="text-sm text-slate-600">For growing organizations</span>
                    {formData.subscriptionTier === 'professional' && (
                      <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                    )}
                  </label>

                  <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.subscriptionTier === 'enterprise'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="subscriptionTier"
                      value="enterprise"
                      checked={formData.subscriptionTier === 'enterprise'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-bold text-slate-900 mb-1">Enterprise</span>
                    <span className="text-sm text-slate-600">Custom solutions</span>
                    {formData.subscriptionTier === 'enterprise' && (
                      <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                    )}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Billing Cycle
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billingCycle"
                        value="monthly"
                        checked={formData.billingCycle === 'monthly'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-slate-700">Monthly</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="billingCycle"
                        value="yearly"
                        checked={formData.billingCycle === 'yearly'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-slate-700">Yearly</span>
                      <span className="text-sm text-green-600 font-medium">(Save 20%)</span>
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Get Started</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-sm text-slate-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy.
                Our team will contact you within 24 hours to activate your account.
              </p>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
