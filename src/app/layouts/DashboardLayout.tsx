import ProtectedRoute from '../components/ProtectedRoute';
import Root from '../Root';

/**
 * DashboardLayout - Protected layout wrapper for dashboard routes
 */
export default function DashboardLayout() {
  return (
    <ProtectedRoute>
      <Root />
    </ProtectedRoute>
  );
}
