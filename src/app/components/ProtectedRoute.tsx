import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext';

/**
 * ProtectedRoute - Wrapper component to protect routes that require authentication
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
