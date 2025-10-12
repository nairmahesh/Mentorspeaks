import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, Question, Industry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PublicLayout } from '../components/PublicLayout';
import { Search, Filter, Plus } from 'lucide-react';

export function QuestionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndustries();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedIndustry]);

  const loadIndustries = async () => {
    const { data } = await supabase
      .from('industries')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) setIndustries(data);
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedIndustry) {
        query = query.eq('industry_id', selectedIndustry);
      }

      const { data } = await query;
      if (data) setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAskQuestion = () => {
    if (user) {
      navigate('/questions/ask');
    } else {
      navigate('/login');
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Questions</h1>
            <p className="text-slate-600 mt-2">Browse and discover expert insights</p>
          </div>
          <button
            onClick={handleAskQuestion}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ask Question</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Link
                key={question.id}
                to={`/questions/${question.id}`}
                className="block bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {question.title}
                    </h3>
                    {question.description && (
                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {question.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        question.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : question.status === 'answered'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {question.status}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      {question.view_count} views
                    </div>
                    {question.is_paid && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        ₹{question.amount}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-600">No questions found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
