import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Industry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { MessageCircle } from 'lucide-react';

export function AskQuestionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [industryId, setIndustryId] = useState('');
  const [tags, setTags] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [amount, setAmount] = useState('');
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const { data, error } = await supabase
        .from('questions')
        .insert({
          seeker_id: user!.id,
          title,
          description: description || null,
          industry_id: industryId || null,
          tags: tagArray,
          is_paid: isPaid,
          amount: isPaid ? parseFloat(amount) : 0,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/questions/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Ask a Question</h1>
          </div>
          <p className="text-slate-600">
            Get expert insights from industry professionals
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Question Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What would you like to know?"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide more details about your question..."
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
              Industry
            </label>
            <select
              id="industry"
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an industry</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Separate tags with commas (e.g., javascript, react, frontend)"
            />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                id="isPaid"
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPaid" className="text-sm font-medium text-slate-700">
                Make this a paid question
              </label>
            </div>

            {isPaid && (
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                  Amount (INR)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required={isPaid}
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount in INR"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
