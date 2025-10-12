import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';
import { PublicLayout } from '../components/PublicLayout';
import { ArrowRight, Star, Users, Video, MessageCircle, TrendingUp } from 'lucide-react';

type SortOption = 'rating' | 'answers' | 'videos' | 'recent';

export function MentorsPage() {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  useEffect(() => {
    loadMentors();
  }, [sortBy]);

  const loadMentors = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor');

      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'answers':
          query = query.order('total_answers', { ascending: false });
          break;
        case 'videos':
          query = query.order('total_videos', { ascending: false });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Expert Network</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Meet Our Mentors</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Connect with experienced professionals sharing their knowledge through video answers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{mentors.length}</span> mentors
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Sort by:</span>
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

        {mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all group"
              >
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
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition truncate">
                      {mentor.full_name}
                    </h3>
                    {mentor.professional_title && (
                      <p className="text-sm text-slate-600 truncate">{mentor.professional_title}</p>
                    )}
                    {(mentor.rating || 0) > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
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
                  </div>
                </div>

                {mentor.bio && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{mentor.bio}</p>
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
                      <div className="text-blue-700 mt-1">Mixed Pricing</div>
                    )}
                  </div>
                )}

                <Link
                  to="/questions"
                  className="block w-full text-center bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View Answers
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No mentors yet</h3>
            <p className="text-slate-600 mb-6">Be the first to join as a mentor and share your expertise!</p>
            <Link
              to="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Become a Mentor
            </Link>
          </div>
        )}
      </div>

      <div className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Want to Become a Mentor?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Share your expertise, help others grow, and build your personal brand
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
          >
            <span>Join as a Mentor</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
