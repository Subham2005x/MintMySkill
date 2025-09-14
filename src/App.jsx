import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import FeaturesPage from './pages/FeaturesPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import DashboardCoursesPage from './pages/DashboardCoursesPage';
import WalletPage from './pages/WalletPage';
import RedeemPage from './pages/RedeemPage';
import ProfilePage from './pages/ProfilePage';
import CreateCoursePage from './pages/CreateCoursePage';
import CreateQuizPage from './pages/CreateQuizPage';
import QuizTakePage from './pages/QuizTakePage';
import MediaUploadPage from './pages/MediaUploadPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="courses" element={<DashboardCoursesPage />} />
                <Route path="upload" element={<MediaUploadPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="redeem" element={<RedeemPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              
              {/* Protected Instructor Routes */}
              <Route path="/instructor" element={
                <ProtectedRoute requiredRole="instructor">
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route path="create-course" element={<CreateCoursePage />} />
                <Route path="create-quiz" element={<CreateQuizPage />} />
              </Route>
              
              {/* Quiz Taking Route (Protected) */}
              <Route path="/quiz/:id" element={
                <ProtectedRoute>
                  <QuizTakePage />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
