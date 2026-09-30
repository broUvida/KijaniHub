import { Link } from 'react-router';
import { Home } from 'lucide-react';

/**
 * NotFound - 404 error page
 */
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Home size={20} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
