import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Leaf, Lock, Mail, AlertCircle, User } from 'lucide-react';

/**
 * Login - Authentication page for accessing personalized dashboards
 */
export default function Login() {
  const navigate = useNavigate();
  const { setUserRole, setIsAuthenticated } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials for different user roles
  const demoCredentials = [
    { email: 'admin@kijanihub.org', password: 'admin123', role: 'admin' as const, name: 'Admin User' },
    { email: 'manager@kijanihub.org', password: 'manager123', role: 'regional_manager' as const, name: 'Regional Manager' },
    { email: 'volunteer@kijanihub.org', password: 'volunteer123', role: 'volunteer' as const, name: 'Volunteer User' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check credentials
    const user = demoCredentials.find(
      cred => cred.email === formData.email && cred.password === formData.password
    );

    if (user) {
      // Successful login
      setUserRole(user.role);
      setIsAuthenticated(true);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', user.name);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Failed login
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'regional_manager' | 'volunteer') => {
    const user = demoCredentials.find(cred => cred.role === role);
    if (user) {
      setFormData({ email: user.email, password: user.password });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg">
              <Leaf className="text-white" size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to KijaniSense</h1>
          <p className="text-gray-600">Sign in to access your personalized dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="your.email@kijanihub.org"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700">
              Forgot your password?
            </a>
          </div>

          {/* Sign-up prompt */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              New here?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-emerald-600 font-medium hover:text-emerald-700 underline underline-offset-2"
              >
                Sign up
              </button>
              {' '}as a Council, Volunteer or CSO/NGO
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Demo Accounts</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Click on a role to auto-fill credentials for testing:
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
            >
              <div className="font-medium text-purple-900">Admin</div>
              <div className="text-xs text-purple-600">Full system access & analytics</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('regional_manager')}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <div className="font-medium text-blue-900">Regional Manager</div>
              <div className="text-xs text-blue-600">Regional oversight & reporting</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('volunteer')}
              className="w-full text-left p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <div className="font-medium text-emerald-900">Volunteer</div>
              <div className="text-xs text-emerald-600">News feed & field reporting</div>
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
