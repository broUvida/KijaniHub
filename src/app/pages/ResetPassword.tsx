import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { KeyRound, ChevronLeft, AlertCircle } from 'lucide-react';

/**
 * ResetPassword — where the "reset your password" email link lands.
 * Supabase signs the person in from the link; here they choose a new password.
 */

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const C = { label: '#1D1D1F', secondary: '#6E6E73', tint: '#1E8A5A', red: '#E0352B' };

export default function ResetPassword() {
  const navigate = useNavigate();
  const { refreshSession } = useApp();
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let settled = false;
    const markReady = () => { settled = true; setStatus('ready'); };

    supabase.auth.getSession().then(({ data }) => { if (data.session) markReady(); }).catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) markReady();
    });
    // If the link didn't sign them in, it has expired or was already used
    const timer = setTimeout(() => { if (!settled) setStatus('invalid'); }, 4000);
    return () => { clearTimeout(timer); sub.subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Use at least 6 characters.'); return; }
    if (password !== confirm) { setError('The two passwords don’t match.'); return; }
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message); setSaving(false); return; }
      await refreshSession();
      navigate('/dashboard');
    } catch {
      setError('We couldn’t reach the server. Check your connection and try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] antialiased" style={{ fontFamily: SYSTEM_FONT, color: C.label }}>
      <div className="max-w-[1080px] mx-auto h-12 px-4 flex items-center">
        <Link to="/login" className="inline-flex items-center gap-0.5 text-[17px]" style={{ color: C.tint }}>
          <ChevronLeft size={22} strokeWidth={2} /> Sign in
        </Link>
      </div>

      <main className="max-w-[400px] mx-auto px-5 pt-8 pb-16">
        <div className="text-center">
          <span className="inline-flex w-16 h-16 rounded-full items-center justify-center" style={{ background: 'rgba(30,138,90,0.12)' }}>
            <KeyRound size={30} style={{ color: C.tint }} />
          </span>
          <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-[-0.02em]">Choose a new password</h1>
        </div>

        {status === 'checking' && (
          <p className="mt-6 text-center text-[15px]" style={{ color: C.secondary }}>Checking your reset link…</p>
        )}

        {status === 'invalid' && (
          <div className="mt-6 text-center">
            <p className="text-[15px] text-balance" style={{ color: C.secondary }}>
              This link has expired or was already used. Request a new one from the sign-in page.
            </p>
            <Link to="/login" className="mt-6 w-full h-12 rounded-xl text-[17px] font-semibold text-white flex items-center justify-center" style={{ background: C.tint }}>
              Back to sign in
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="pl-4 divide-y divide-[#E5E5EA]">
                <div>
                  <label htmlFor="new-password" className="sr-only">New password</label>
                  <input id="new-password" type="password" autoComplete="new-password" required minLength={6}
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password"
                    className="w-full h-12 pr-4 bg-transparent text-[17px] outline-none placeholder:text-[#A1A1A6]" />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">Confirm new password</label>
                  <input id="confirm-password" type="password" autoComplete="new-password" required minLength={6}
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password"
                    className="w-full h-12 pr-4 bg-transparent text-[17px] outline-none placeholder:text-[#A1A1A6]" />
                </div>
              </div>
            </div>
            {error && (
              <p role="alert" className="mt-3 px-1 flex items-start gap-1.5 text-[13px]" style={{ color: C.red }}>
                <AlertCircle size={15} className="mt-[1px] flex-shrink-0" /> {error}
              </p>
            )}
            <button type="submit" disabled={saving}
              className="mt-5 w-full h-12 rounded-xl text-[17px] font-semibold text-white disabled:opacity-60"
              style={{ background: C.tint }}>
              {saving ? 'Saving…' : 'Save new password'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
