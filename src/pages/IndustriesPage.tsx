import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Industry } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Folder } from 'lucide-react';

export function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    try {
      const { data } = await supabase
        .from('industries')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (data) setIndustries(data);
    } catch (error) {
      console.error('Error loading industries:', error);
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

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Industry Corners</h1>
          <p className="text-xl text-slate-600">Explore expert insights across diverse professional domains</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const IconComponent = (LucideIcons as any)[industry.icon || 'Folder'] || Folder;
            return (
              <Link
                key={industry.id}
                to={`/industries/${industry.slug}`}
                className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {industry.name}
                    </h3>
                  </div>
                </div>
                {industry.description && (
                  <p className="text-slate-600 text-sm mb-4">{industry.description}</p>
                )}
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
