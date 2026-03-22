import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SectionsPage from './pages/SectionsPage';
import StudentsPage from './pages/StudentsPage';
import AdminProfessorsPage from './pages/AdminProfessorsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAchievements from './pages/student/StudentAchievements';
import StudentAssessments from './pages/student/StudentAssessments';
import StudentSettings from './pages/student/StudentSettings';
import LeaderboardPage from './pages/LeaderboardPage';
import ChaptersPage from './pages/ChaptersPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0e27',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  // Auto-redirect to appropriate dashboard if logged in
  const getDefaultRoute = () => {
    if (!user) return '/login';
    
    switch (user.roleId) {
      case 1: return '/student';
      case 2: return '/professor';
      case 3: return '/admin';
      default: return '/login';
    }
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} 
      />
      
      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/achievements"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <StudentAchievements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assessments"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <StudentAssessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <StudentSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leaderboards"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />

      {/* Professor Routes */}
      <Route
        path="/professor"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <ProfessorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professor/sections"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <SectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professor/students"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professor/leaderboards"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/professor/chapters"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <ChaptersPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/professors"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminProfessorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sections"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <SectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leaderboards"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/chapters"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <ChaptersPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
