import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import { Star, Users, Video, MessageCircle, TrendingUp, Search, Filter, Linkedin, Award, Sparkles } from 'lucide-react';

type SortOption = 'rating' | 'answers' | 'videos' | 'recent';

export function BrowseMentorsPage() {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMentors();
  }, [sortBy]);

  const loadMentors = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor');

      query = query.order('is_stalwart', { ascending: false });

      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false, nullsLast: true });
          break;
        case 'answers':
          query = query.order('total_answers', { ascending: false, nullsLast: true });
          break;
        case 'videos':
          query = query.order('total_videos', { ascending: false, nullsLast: true });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data } = await query;
      if (data) setMentors(data);
    } catch (error) {
      console.error('Error loading mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      mentor.full_name.toLowerCase().includes(query) ||
      mentor.professional_title?.toLowerCase().includes(query) ||
      mentor.bio?.toLowerCase().includes(query) ||
      mentor.expertise_areas?.some((area: string) => area.toLowerCase().includes(query))
    );
  });

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
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">Browse Expert Mentors</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Connect with industry professionals who can guide your career journey
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, title, expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-slate-900 text-lg focus:ring-4 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredMentors.length}</span> mentor{filteredMentors.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-slate-500" />
            <span className="text-sm text-slate-600 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 font-medium"
            >
              <option value="rating">Highest Rated</option>
              <option value="answers">Most Answers</option>
              <option value="videos">Most Videos</option>
              <option value="recent">Recently Joined</option>
            </select>
          </div>
        </div>

        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${mentor.is_stalwart ? 'border-amber-300 hover:border-amber-400' : 'border-slate-200 hover:border-blue-400'} hover:shadow-xl transition-all group relative`}
              >
                {mentor.is_stalwart && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-lg">
                      <Award className="w-3 h-3" />
                      <span>TOP VOICE</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-4 mb-4">
                  {mentor.avatar_url ? (
                    <img
                      src={mentor.avatar_url}
                      alt={mentor.full_name}
                      className="w-16 h-16 rounded-full ring-4 ring-slate-100 group-hover:ring-blue-200 transition flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-4 ring-slate-100 group-hover:ring-blue-200 transition flex-shrink-0">
                      <span className="text-2xl font-bold text-white">{mentor.full_name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold text-slate-900 mb-1 transition truncate ${mentor.is_stalwart ? 'group-hover:text-amber-600' : 'group-hover:text-blue-600'}`}>
                      {mentor.full_name}
                    </h3>
                    {mentor.stalwart_designation && (
                      <div className="mb-1">
                        <span className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-300">
                          {mentor.stalwart_designation}
                        </span>
                      </div>
                    )}
                    {mentor.professional_title && (
                      <p className="text-sm text-slate-600 truncate">{mentor.professional_title}</p>
                    )}
                    {mentor.linkedin_url && (
                      <a
                        href={mentor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        <Linkedin className="w-3 h-3" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>

                {(mentor.rating || 0) > 0 && (
                  <div className="flex items-center space-x-1 mb-4">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-slate-900">
                      {(mentor.rating || 0).toFixed(1)}
                    </span>
                    {(mentor.total_reviews || 0) > 0 && (
                      <span className="text-xs text-slate-500">
                        ({mentor.total_reviews} reviews)
                      </span>
                    )}
                  </div>
                )}

                {mentor.bio && (
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">{mentor.bio}</p>
                )}

                {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise_areas.slice(0, 3).map((area: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium"
                        >
                          {area}
                        </span>
                      ))}
                      {mentor.expertise_areas.length > 3 && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                          +{mentor.expertise_areas.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-bold text-blue-900">{mentor.total_answers || 0}</span>
                    </div>
                    <div className="text-xs text-blue-700 font-medium">Answers</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Video className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-900">{mentor.total_videos || 0}</span>
                    </div>
                    <div className="text-xs text-green-700 font-medium">Videos</div>
                  </div>
                </div>

                {mentor.offers_consulting && (
                  <div className="mb-4 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 text-orange-900 text-xs font-semibold rounded-lg text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Offers Consulting</span>
                    </div>
                    {mentor.consulting_type === 'free' && (
                      <div className="text-green-700 font-bold mt-1">Free</div>
                    )}
                    {mentor.consulting_type === 'paid' && mentor.consulting_rate_inr && (
                      <div className="text-slate-700 mt-1">₹{mentor.consulting_rate_inr}/hr</div>
                    )}
                    {mentor.consulting_type === 'hybrid' && (
                      <div className="text-blue-700 mt-1">Free & Paid Options</div>
                    )}
                  </div>
                )}

                <Link
                  to={`/profile/${mentor.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? 'No mentors found' : 'No mentors yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Be the first to join as a mentor and share your expertise!'}
            </p>
            {!searchQuery && (
              <Link
                to="/register"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Become a Mentor
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Become a Mentor?</h2>
          <p className="text-lg text-slate-300 mb-8">
            Share your expertise, help others grow, and build your personal brand
          </p>
          <Link
            to="/mentors"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            <span>Learn More</span>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
