/**
 * ProtectedRoute — Guards routes by authentication and optional role.
 * Redirects to /login if unauthenticated.
 * Shows 403 if role doesn't match.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--gray-50)',
      }}>
        <div className="skeleton" style={{ width: 200, height: 40 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect to their own dashboard
    const redirect = user.role === 'brand_owner' ? '/brand/dashboard' : '/creator/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
