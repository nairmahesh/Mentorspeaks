import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquareText, LogOut, User, Home, MessageCircle, BarChart3, Radio, Settings, MapPin, Shield, Sparkles } from 'lucide-react';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { user, profile, isModerator, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition"></div>
                <MessageSquareText className="relative w-8 h-8 text-orange-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent leading-tight">effyMentor</span>
                <span className="text-xs text-slate-500 font-medium italic">Where Experience Speaks</span>
              </div>
            </Link>

            {user && (
              <div className="hidden lg:flex items-center space-x-6">
                <Link to="/feed" className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 transition">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">My Feed</span>
                </Link>

                <Link to="/podcasts" className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 transition">
                  <Radio className="w-5 h-5" />
                  <span className="font-medium">Podcasts</span>
                </Link>

                <Link to="/questions" className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">Questions</span>
                </Link>

                <Link to="/home" className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition">
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Explore</span>
                </Link>

                {profile?.role === 'mentor' && (
                  <Link to="/mentor/dashboard" className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                )}

                {isModerator && (
                  <>
                    <Link to="/podcasts/manage" className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 transition">
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Podcasts</span>
                    </Link>
                    <Link to="/community/manage" className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Community</span>
                    </Link>
                  </>
                )}

                <Link to="/profile" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition">
                  <User className="w-5 h-5" />
                  <span className="font-medium hidden xl:inline">{profile?.full_name}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-slate-600 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium hidden xl:inline">Sign Out</span>
                </button>
              </div>
            )}

            {user && (
              <div className="lg:hidden flex items-center space-x-4">
                <Link to="/feed" className="text-orange-600 hover:text-orange-700 transition">
                  <Sparkles className="w-6 h-6" />
                </Link>
                <Link to="/questions" className="text-slate-600 hover:text-slate-900 transition">
                  <MessageCircle className="w-6 h-6" />
                </Link>
                <Link to="/profile" className="text-slate-600 hover:text-slate-900 transition">
                  <User className="w-6 h-6" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center space-x-2 text-xl font-bold mb-4">
                <MessageSquareText className="w-6 h-6 text-orange-600" />
                <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">effyMentor</span>
              </div>
              <p className="text-slate-600 text-sm">
                Empowering professionals to share authentic insights through impactful conversations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">For Seekers</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/podcasts" className="hover:text-slate-900">Listen to Podcasts</Link></li>
                <li><Link to="/questions" className="hover:text-slate-900">Browse Questions</Link></li>
                <li><Link to="/mentors" className="hover:text-slate-900">Find Mentors</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">For Mentors</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/mentor/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
                <li><Link to="/mentor/earnings" className="hover:text-slate-900">Earnings</Link></li>
                <li><Link to="/mentor/subscription" className="hover:text-slate-900">Subscription</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Explore</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/industries" className="hover:text-slate-900">Industry Corners</Link></li>
                <li><Link to="/chapters" className="hover:text-slate-900">Regional Chapters</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/about" className="hover:text-slate-900">About Us</Link></li>
                <li><a href="#" className="hover:text-slate-900">Contact</a></li>
                <li><a href="#" className="hover:text-slate-900">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2025 effyMentor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
