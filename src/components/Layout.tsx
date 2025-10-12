import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquareText, LogOut, LogIn, User, UserPlus, Home, MessageCircle, BarChart3, Radio, Settings, Shield } from 'lucide-react';

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
                <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition"></div>
                <MessageSquareText className="relative w-8 h-8 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">effyMentor</span>
                <span className="text-xs text-slate-500 font-medium italic">Where Experience Speaks</span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center space-x-2 md:space-x-3 lg:space-x-6">
              {user ? (
                <>
                  <Link to="/feed" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition text-sm">
                    <Home className="w-4 h-4" />
                    <span className="hidden md:inline">Feed</span>
                  </Link>
                  <Link to="/podcasts" className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium transition text-sm">
                    <Radio className="w-4 h-4" />
                    <span className="hidden md:inline">Podcasts</span>
                  </Link>
                  <Link to="/questions" className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium transition text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden md:inline">Questions</span>
                  </Link>
                  {profile?.role === 'mentor' && (
                    <Link to="/mentor/dashboard" className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium transition text-sm">
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden md:inline">Dashboard</span>
                    </Link>
                  )}
                  {isModerator && (
                    <>
                      <Link to="/podcasts/manage" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition text-sm">
                        <Settings className="w-4 h-4" />
                        <span className="hidden md:inline">Manage Podcasts</span>
                      </Link>
                      <Link to="/community/manage" className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium transition text-sm">
                        <Shield className="w-4 h-4" />
                        <span className="hidden md:inline">Community</span>
                      </Link>
                    </>
                  )}
                  <Link to="/profile" className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium transition text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-slate-700 hover:text-red-600 font-medium transition text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/podcasts" className="text-slate-700 hover:text-slate-900 font-medium transition">
                    Podcasts
                  </Link>
                  <Link to="/about" className="text-slate-700 hover:text-slate-900 font-medium transition">
                    About
                  </Link>
                  <Link to="/mentors" className="text-slate-700 hover:text-slate-900 font-medium transition">
                    Become a Mentor
                  </Link>
                  <Link to="/corporate" className="text-slate-700 hover:text-slate-900 font-medium transition">
                    For Corporates
                  </Link>
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center space-x-1 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Get Started</span>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {user && (
              <div className="sm:hidden flex items-center space-x-4">
                <Link to="/feed" className="text-blue-600 hover:text-blue-700 transition">
                  <Home className="w-5 h-5" />
                </Link>
                <Link to="/podcasts" className="text-slate-700 hover:text-slate-900 transition">
                  <Radio className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="text-slate-700 hover:text-slate-900 transition">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-slate-700 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {!user && (
              <div className="sm:hidden flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-slate-900 font-medium transition text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                >
                  Get Started
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
                <MessageSquareText className="w-6 h-6 text-blue-600" />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">effyMentor</span>
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
