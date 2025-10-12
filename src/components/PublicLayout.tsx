import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquareText, LogIn, UserPlus } from 'lucide-react';

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition"></div>
                <MessageSquareText className="relative w-8 h-8 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent leading-tight">effyMentor</span>
                <span className="text-xs text-slate-500 font-medium italic">Where Experience Speaks</span>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
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

              {user ? (
                <Link
                  to="/profile"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Dashboard
                </Link>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-slate-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div>
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-xl font-bold mb-1">
                  <MessageSquareText className="w-6 h-6 text-blue-400" />
                  <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">effyMentor</span>
                </div>
                <p className="text-xs text-slate-500 italic">Where Experience Speaks</p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ask questions, get expert video answers, and learn from authentic conversations with industry professionals worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Seekers</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/questions" className="hover:text-white transition">Browse Questions</Link></li>
                <li><Link to="/questions/ask" className="hover:text-white transition">Ask a Question</Link></li>
                <li><Link to="/podcasts" className="hover:text-white transition">Listen to Podcasts</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/industries" className="hover:text-white transition">Industry Corners</Link></li>
                <li><Link to="/chapters" className="hover:text-white transition">Regional Chapters</Link></li>
                <li><Link to="/browse-mentors" className="hover:text-white transition">Browse Mentors</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Mentors</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/mentors" className="hover:text-white transition">Why Be a Mentor</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Sign Up as Mentor</Link></li>
                <li><Link to="/questions" className="hover:text-white transition">Answer Questions</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Corporates</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/corporate" className="hover:text-white transition">Enterprise Solutions</Link></li>
                <li><Link to="/corporate/signup" className="hover:text-white transition">Get Started</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-slate-400">&copy; 2025 effyMentor. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition">Privacy Policy</Link>
                <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition">Terms of Service</Link>
                <Link to="/cookies" className="text-sm text-slate-400 hover:text-white transition">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
