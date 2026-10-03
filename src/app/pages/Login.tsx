import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Leaf, ChevronLeft, ChevronRight, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Login — Apple-style sign-in for KijaniSense.
 * Real accounts sign in through Supabase Auth; the three demo accounts still work for pitching.
 */

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const C = {
  label: '#1D1D1F',
  secondary: '#6E6E73',
  tertiary: '#8E8E93',
  separator: '#E5E5EA',
  tint: '#1E8A5A',
  green: '#248A3D',
  red: '#E0352B',
};

// Demo accounts for pitching (these never touch real data)
const demoCredentials = [
  { email: 'admin@kijanihub.org', password: 'admin123', role: 'admin' as const, name: 'Admin User', title: 'Admin', desc: 'Full access, including the conversion engine' },
  { email: 'manager@kijanihub.org', password: 'manager123', role: 'regional_manager' as const, name: 'Regional Manager', title: 'Regional manager', desc: 'View-only municipal dashboard and comparisons' },
  { email: 'volunteer@kijanihub.org', password: 'volunteer123', role: 'volunteer' as const, name: 'Volunteer User', title: 'Volunteer', desc: 'News feed and field reporting' },
];

/** Turn Supabase errors into plain language */
function friendlyError(message: string, email: string) {
  const m = message.toLowerCase();
  if (m.includes('not confirmed')) return `Confirm your email first. We sent a link to ${email} when you signed up.`;
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'That email and password don’t match an account. Check them and try again.';
  if (m.includes('fetch') || m.includes('network')) return 'We couldn’t reach the server. Check your connection and try again.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Wait a few minutes, then try again.';
  if (m.includes('sending') && m.includes('email')) return 'We couldn’t send the email just now. Please try again in a few minutes, or contact us.';
  return message;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, refreshSession, startDemoSession } = useApp();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Arriving from the confirmation email
  const justConfirmed = new URLSearchParams(location.search).get('confirmed') === '1';

  // If the confirmation link already signed them in, go straight to the dashboard
  useEffect(() => {
    if (isAuthenticated && justConfirmed) navigate('/dashboard/map', { replace: true });
  }, [isAuthenticated, justConfirmed, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    const email = formData.email.trim();

    // 1. Demo accounts
    const demo = demoCredentials.find((c) => c.email === email.toLowerCase());
    if (demo) {
      await new Promise((r) => setTimeout(r, 400));
      if (demo.password === formData.password) {
        startDemoSession(demo.role, demo.name);
        navigate('/dashboard');
      } else {
        setError('That email and password don’t match an account. Check them and try again.');
        setIsLoading(false);
      }
      return;
    }

    // 2. Real accounts (Supabase Auth)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password: formData.password });
      if (authError) {
        setError(friendlyError(authError.message, email));
        setIsLoading(false);
        return;
      }
      await refreshSession();
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(String((err as Error)?.message ?? err), email));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    const email = formData.email.trim();
    if (!email) {
      setError('Enter your email above, then tap “Forgot password?” again.');
      return;
    }
    if (demoCredentials.some((c) => c.email === email.toLowerCase())) {
      setInfo('Demo accounts use the passwords shown below.');
      return;
    }
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(friendlyError(resetError.message, email));
        return;
      }
      setInfo(`If an account exists for ${email}, we’ve sent a link to reset your password.`);
    } catch (err) {
      setError(friendlyError(String((err as Error)?.message ?? err), email));
    }
  };

  const handleDemoLogin = (role: 'admin' | 'regional_manager' | 'volunteer') => {
    const user = demoCredentials.find((cred) => cred.role === role);
    if (user) {
      setFormData({ email: user.email, password: user.password });
      setSelectedDemo(role);
      setError('');
      setInfo('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] antialiased" style={{ fontFamily: SYSTEM_FONT, color: C.label }}>
      {/* Top bar */}
      <div className="max-w-[1080px] mx-auto h-12 px-4 flex items-center">
        <Link to="/" className="inline-flex items-center gap-0.5 text-[17px]" style={{ color: C.tint }}>
          <ChevronLeft size={22} strokeWidth={2} /> Kijani Hub
        </Link>
      </div>

      <main className="max-w-[400px] mx-auto px-5 pt-8 pb-16">
        <div className="text-center">
          <span className="inline-flex w-16 h-16 rounded-[16px] items-center justify-center" style={{ background: C.tint }}>
            <Leaf size={34} className="text-white" strokeWidth={2} />
          </span>
          <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-[-0.02em]">Sign in to KijaniSense</h1>
          <p className="mt-2 text-[15px] text-balance" style={{ color: C.secondary }}>Use the email and password for your Kijani Hub account.</p>
        </div>

        {justConfirmed && !isAuthenticated && (
          <p role="status" className="mt-6 flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-[15px]" style={{ color: C.green }}>
            <CheckCircle2 size={18} className="mt-[1px] flex-shrink-0" />
            Your email is confirmed. Sign in to continue.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="pl-4 divide-y divide-[#E5E5EA]">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setSelectedDemo(null); }}
                  placeholder="Email"
                  className="w-full h-12 pr-4 bg-transparent text-[17px] outline-none placeholder:text-[#A1A1A6]"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setSelectedDemo(null); }}
                  placeholder="Password"
                  className="w-full h-12 pr-4 bg-transparent text-[17px] outline-none placeholder:text-[#A1A1A6]"
                />
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-3 px-1 flex items-start gap-1.5 text-[13px]" style={{ color: C.red }}>
              <AlertCircle size={15} className="mt-[1px] flex-shrink-0" /> {error}
            </p>
          )}
          {info && (
            <p role="status" className="mt-3 px-1 flex items-start gap-1.5 text-[13px]" style={{ color: C.green }}>
              <CheckCircle2 size={15} className="mt-[1px] flex-shrink-0" /> {info}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 w-full h-12 rounded-xl text-[17px] font-semibold text-white transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1E8A5A]/25"
            style={{ background: C.tint }}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center">
          <button type="button" onClick={handleForgotPassword} className="text-[15px]" style={{ color: C.tint }}>
            Forgot password?
          </button>
        </p>

        <div className="my-8 h-px" style={{ background: '#D2D2D7' }} />

        <p className="text-center text-[15px]" style={{ color: C.secondary }}>
          New to KijaniSense?{' '}
          <Link to="/signup" className="inline-flex items-center" style={{ color: C.tint }}>
            Create an account <ChevronRight size={16} />
          </Link>
        </p>

        {/* Demo accounts */}
        <section className="mt-10" aria-labelledby="demo-title">
          <h2 id="demo-title" className="px-4 mb-1.5 text-[13px]" style={{ color: C.secondary }}>Try a demo account</h2>
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="pl-4 divide-y divide-[#E5E5EA]">
              {demoCredentials.map((d) => {
                const selected = selectedDemo === d.role;
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleDemoLogin(d.role)}
                    aria-pressed={selected}
                    className="w-full flex items-center gap-3 pr-4 py-2.5 text-left hover:bg-black/[0.02] active:bg-black/[0.05]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px]">{d.title}</p>
                      <p className="text-[13px]" style={{ color: C.secondary }}>{d.desc}</p>
                    </div>
                    {selected
                      ? <Check size={20} style={{ color: C.tint }} />
                      : <ChevronRight size={18} style={{ color: '#C4C4C7' }} />}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="px-4 mt-1.5 text-[13px]" style={{ color: C.tertiary }}>
            Demo accounts are for exploring. Their changes stay on this device and never touch real data.
          </p>
        </section>

        <p className="mt-10 text-center text-[13px]" style={{ color: C.tertiary }}>
          Need help? <a href="mailto:kijanihubtz@gmail.com" style={{ color: C.tint }}>Contact us</a>
        </p>
      </main>
    </div>
  );
}
