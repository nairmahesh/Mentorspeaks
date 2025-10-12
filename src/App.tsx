import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { QuestionsPage } from './pages/QuestionsPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { AnswerQuestionPage } from './pages/AnswerQuestionPage';
import { MentorDashboardPage } from './pages/MentorDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SeekOpinionPage } from './pages/SeekOpinionPage';
import { IndustriesPage } from './pages/IndustriesPage';
import { IndustryDetailPage } from './pages/IndustryDetailPage';
import { MentorsPage } from './pages/MentorsPage';
import { BrowseMentorsPage } from './pages/BrowseMentorsPage';
import { MentorProfilePage } from './pages/MentorProfilePage';
import { PodcastsPage } from './pages/PodcastsPage';
import { CorporateFeaturesPage } from './pages/CorporateFeaturesPage';
import { CorporateSignupPage } from './pages/CorporateSignupPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <RegisterPage />}
      />
      <Route path="/" element={<HomePage />} />
      <Route path="/podcasts" element={<PodcastsPage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route path="/questions/:id" element={<QuestionDetailPage />} />
      <Route
        path="/questions/ask"
        element={
          <ProtectedRoute>
            <AskQuestionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/questions/:id/answer"
        element={
          <ProtectedRoute requiredRole="mentor">
            <AnswerQuestionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/questions/:id/seek-opinion"
        element={
          <ProtectedRoute>
            <SeekOpinionPage />
          </ProtectedRoute>
        }
      />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/industries/:slug" element={<IndustryDetailPage />} />
      <Route path="/mentors" element={<MentorsPage />} />
      <Route path="/browse-mentors" element={<BrowseMentorsPage />} />
      <Route path="/mentor/:id" element={<MentorProfilePage />} />
      <Route path="/corporate" element={<CorporateFeaturesPage />} />
      <Route path="/corporate/signup" element={<CorporateSignupPage />} />
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute requiredRole="mentor">
            <MentorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
