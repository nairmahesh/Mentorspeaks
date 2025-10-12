import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Industry, Question } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import * as LucideIcons from 'lucide-react';
import { Folder, Eye, ArrowLeft, MessageCircle } from 'lucide-react';

export function IndustryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const { data: industryData } = await supabase
        .from('industries')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (industryData) {
        setIndustry(industryData);

        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .contains('tags', [industryData.name])
          .order('created_at', { ascending: false })
          .limit(20);

        if (questionsData) setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!industry) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Industry not found</h1>
          <Link to="/industries" className="text-blue-600 hover:text-blue-700">
            Back to Industries
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const IconComponent = (LucideIcons as any)[industry.icon || 'Folder'] || Folder;

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/industries"
            className="inline-flex items-center space-x-2 text-blue-200 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Industries</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{industry.name}</h1>
              {industry.description && (
                <p className="text-blue-100 text-lg">{industry.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Questions in {industry.name}</h2>
          <p className="text-slate-600">Browse questions and expert answers from this industry</p>
        </div>

        {questions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((question) => (
              <Link
                key={question.id}
                to={`/questions/${question.id}`}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <Eye className="w-3 h-3" />
                    <span>{question.view_count}</span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                  {question.title}
                </h3>
                {question.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{question.description}</p>
                )}
                <div className="flex gap-2">
                  {question.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No questions yet</h3>
            <p className="text-slate-600 mb-6">Be the first to ask a question in this industry!</p>
            <Link
              to="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Ask a Question
            </Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
