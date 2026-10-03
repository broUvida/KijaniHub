import { Navigate } from 'react-router';
import { useApp } from '../context/AppContext';

/**
 * ProtectedRoute - Wrapper for routes that require sign-in.
 * While a saved Supabase session is being restored, it waits instead of
 * sending the person to the sign-in page.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useApp();

  if (!isAuthenticated) {
    if (authLoading) return <div className="min-h-screen bg-[#F2F2F7]" aria-busy="true" />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
