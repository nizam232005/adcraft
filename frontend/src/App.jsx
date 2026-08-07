import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrandDashboard from './pages/BrandDashboard';
import BrowseCreators from './pages/BrowseCreators';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import MyProjects from './pages/MyProjects';
import ProjectDetails from './pages/ProjectDetails';

import CreatorDashboard from './pages/CreatorDashboard';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';
import SubmitWork from './pages/SubmitWork';
import CreatorProfile from './pages/CreatorProfile';
import EditProfile from './pages/EditProfile';
import PublicProfile from './pages/PublicProfile';
import ProjectChat from './pages/ProjectChat';

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'brand_owner' ? '/brand/dashboard' : '/creator/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Brand Owner Routes */}
          <Route
            path="/brand/dashboard"
            element={
              <ProtectedRoute role="brand_owner">
                <BrandDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/creators"
            element={
              <ProtectedRoute role="brand_owner">
                <BrowseCreators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/projects/create"
            element={
              <ProtectedRoute role="brand_owner">
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/projects/edit/:id"
            element={
              <ProtectedRoute role="brand_owner">
                <EditProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/projects"
            element={
              <ProtectedRoute role="brand_owner">
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/projects/:id"
            element={
              <ProtectedRoute role="brand_owner">
                <ProjectDetails />
              </ProtectedRoute>
            }
          />

          {/* Creator Routes */}
          <Route
            path="/creator/dashboard"
            element={
              <ProtectedRoute role="creator">
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/jobs"
            element={
              <ProtectedRoute role="creator">
                <BrowseJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/jobs/:id"
            element={
              <ProtectedRoute role="creator">
                <JobDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/applications"
            element={
              <ProtectedRoute role="creator">
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/submissions/:appId"
            element={
              <ProtectedRoute role="creator">
                <SubmitWork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/profile"
            element={
              <ProtectedRoute role="creator">
                <CreatorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/profile/edit"
            element={
              <ProtectedRoute role="creator">
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <PublicProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/chat"
            element={
              <ProtectedRoute>
                <ProjectChat />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
