import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Industry, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { MessageCircle, Users, X, Mic, FileText } from 'lucide-react';

export function AskQuestionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [industryId, setIndustryId] = useState('');
  const [tags, setTags] = useState('');
  const [responseFormat, setResponseFormat] = useState<'qa' | 'podcast'>('qa');
  const [targetAllMentors, setTargetAllMentors] = useState(true);
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIndustries();
    loadMentors();
  }, []);

  const loadIndustries = async () => {
    const { data } = await supabase
      .from('industries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) setIndustries(data);
  };

  const loadMentors = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, professional_title, avatar_url')
      .eq('role', 'mentor')
      .order('full_name');
    if (data) setMentors(data);
  };

  const toggleMentorSelection = (mentorId: string) => {
    setSelectedMentorIds((prev) =>
      prev.includes(mentorId)
        ? prev.filter((id) => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!targetAllMentors && selectedMentorIds.length === 0) {
      setError('Please select at least one mentor or choose "All Mentors"');
      return;
    }

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
          response_format: responseFormat,
          targeted_mentor_ids: targetAllMentors ? null : selectedMentorIds,
          is_paid: false,
          amount: 0,
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
            <h1 className="text-4xl font-bold text-slate-900">Ask a Mentor</h1>
          </div>
          <p className="text-slate-600 mb-2">
            Get expert insights from industry professionals as a text Q&A or podcast episode - completely free!
          </p>
          <p className="text-sm text-blue-600 font-medium">
            All questions are free. For paid 1-on-1 consultancy, use the "Book a Call" feature on mentor profiles.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              How would you like your answer? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setResponseFormat('qa')}
                className={`relative p-4 rounded-lg border-2 transition ${
                  responseFormat === 'qa'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${responseFormat === 'qa' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <FileText className={`w-5 h-5 ${responseFormat === 'qa' ? 'text-blue-600' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-900 mb-1">Text Q&A</div>
                    <div className="text-sm text-slate-600">Get a written answer you can read and reference</div>
                  </div>
                </div>
                {responseFormat === 'qa' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setResponseFormat('podcast')}
                className={`relative p-4 rounded-lg border-2 transition ${
                  responseFormat === 'podcast'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${responseFormat === 'podcast' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    <Mic className={`w-5 h-5 ${responseFormat === 'podcast' ? 'text-blue-600' : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-900 mb-1">Podcast Episode</div>
                    <div className="text-sm text-slate-600">Get an audio discussion you can listen to</div>
                  </div>
                </div>
                {responseFormat === 'podcast' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Separate tags with commas (e.g., javascript, react, frontend)"
            />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <Users className="w-4 h-4 inline mr-2" />
                Target Audience
              </label>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={targetAllMentors}
                    onChange={() => {
                      setTargetAllMentors(true);
                      setSelectedMentorIds([]);
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-cyan-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">All Mentors</div>
                    <div className="text-xs text-slate-500">Question visible to all mentors on the platform</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!targetAllMentors}
                    onChange={() => setTargetAllMentors(false)}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-cyan-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">Specific Mentor(s)</div>
                    <div className="text-xs text-slate-500">Direct your question to selected mentors</div>
                  </div>
                </label>
              </div>
            </div>

            {!targetAllMentors && (
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Select Mentors
                </label>

                {selectedMentorIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                    {selectedMentorIds.map((mentorId) => {
                      const mentor = mentors.find((m) => m.id === mentorId);
                      return (
                        <div
                          key={mentorId}
                          className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-blue-200"
                        >
                          <span className="text-sm font-medium text-slate-900">{mentor?.full_name}</span>
                          <button
                            type="button"
                            onClick={() => toggleMentorSelection(mentorId)}
                            className="text-slate-400 hover:text-red-600 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                  {mentors.map((mentor) => (
                    <button
                      key={mentor.id}
                      type="button"
                      onClick={() => toggleMentorSelection(mentor.id)}
                      className={`w-full flex items-center space-x-3 p-3 hover:bg-slate-50 transition border-b border-slate-100 last:border-b-0 ${
                        selectedMentorIds.includes(mentor.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMentorIds.includes(mentor.id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-cyan-500"
                      />
                      {mentor.avatar_url ? (
                        <img
                          src={mentor.avatar_url}
                          alt={mentor.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{mentor.full_name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-slate-900">{mentor.full_name}</div>
                        {mentor.professional_title && (
                          <div className="text-xs text-slate-500">{mentor.professional_title}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
