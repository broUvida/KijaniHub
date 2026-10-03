import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bell, Leaf, LogOut, Check } from 'lucide-react';
import { useApp, UserRole } from '../context/AppContext';

/**
 * Header — frosted, Apple-style top bar.
 * Shows the current section, live status, notifications and the account menu.
 */

const TINT = '#1E8A5A';

const titles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/waste': 'Waste collection',
  '/dashboard/map': 'Map',
  '/dashboard/photo-check': 'Photo check',
  '/dashboard/bsf': 'BSF production',
  '/dashboard/compost': 'Compost',
  '/dashboard/biogas': 'Biogas & energy',
  '/dashboard/wash': 'WASH stations',
  '/dashboard/community': 'Community',
  '/dashboard/marketplace': 'Marketplace',
  '/dashboard/admin': 'Conversion engine',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  regional_manager: 'Regional manager',
  volunteer: 'Volunteer',
};

const menuClass =
  'absolute right-0 top-11 z-50 rounded-2xl border bg-white/90 backdrop-blur-xl overflow-hidden';
const menuStyle = { borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 12px 40px rgba(0,0,0,0.16)' };

export default function Header() {
  const { userRole, setUserRole, notifications, isOnline, pendingSync, userName, logout, authMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<'none' | 'notifications' | 'account'>('none');
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Like iOS: the small title and hairline appear only after scrolling past the large page title
  useEffect(() => {
    const scroller = headerRef.current?.parentElement;
    if (!scroller) return;
    const onScroll = () => setScrolled(scroller.scrollTop > 56);
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const unread = notifications.filter((n) => !n.read).length;
  const title = titles[location.pathname.replace(/\/$/, '')] ?? 'KijaniSense';
  const initials = (userName || roleLabels[userRole])
    .split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

  const handleLogout = async () => {
    setOpen('none');
    await logout();
    navigate('/login');
  };

  const toggle = (menu: 'notifications' | 'account') => setOpen(open === menu ? 'none' : menu);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b bg-[#F2F2F7]/80 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-200"
      style={{ borderColor: scrolled ? 'rgba(0,0,0,0.08)' : 'transparent' }}
    >
      {/* Click-away layer for open menus */}
      {open !== 'none' && <div className="fixed inset-0 z-40" onClick={() => setOpen('none')} />}

      <div className="h-[52px] px-4 md:px-8 flex items-center gap-3">
        {/* Left: brand on phones, section title on desktop */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="w-7 h-7 rounded-[8px] flex items-center justify-center" style={{ background: TINT }}>
            <Leaf size={16} className="text-white" strokeWidth={2.25} />
          </span>
          <span className="text-[17px] font-semibold text-[#1D1D1F]">KijaniSense</span>
        </div>
        <p
          className="hidden md:block text-[15px] font-semibold text-[#1D1D1F] transition-opacity duration-200"
          style={{ opacity: scrolled ? 1 : 0 }}
          aria-hidden={!scrolled}
        >
          {title}
        </p>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Live status */}
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#1D1D1F]">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#34C759]' : 'bg-[#FF3B30]'}`} />
            {isOnline ? 'Live' : `Offline${pendingSync > 0 ? `, ${pendingSync} pending` : ''}`}
          </span>

          {/* Notifications */}
          <div className="relative z-50">
            <button
              onClick={() => toggle('notifications')}
              aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              aria-expanded={open === 'notifications'}
              className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E8A5A]/40"
            >
              <Bell size={19} className="text-[#1D1D1F]" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF3B30] text-white text-[11px] font-semibold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            {open === 'notifications' && (
              <div className={`${menuClass} w-[320px]`} style={menuStyle}>
                <p className="px-4 pt-3.5 pb-2 text-[15px] font-semibold text-[#1D1D1F]">Notifications</p>
                {notifications.length === 0 ? (
                  <p className="px-4 pb-4 text-[13px] text-[#6E6E73]">You're all caught up.</p>
                ) : (
                  <ul className="max-h-[360px] overflow-y-auto pb-1.5">
                    {notifications.map((n, i) => (
                      <li key={n.id}>
                        {i > 0 && <div className="ml-9 h-px bg-[#E5E5EA]" />}
                        <div className="flex gap-3 px-4 py-2.5">
                          <span
                            className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: n.type === 'critical' ? '#FF3B30' : n.type === 'warning' ? '#FF9500' : '#007AFF' }}
                          />
                          <div className="min-w-0">
                            <p className={`text-[14px] text-[#1D1D1F] ${n.read ? '' : 'font-medium'}`}>{n.message}</p>
                            <p className="text-[12px] text-[#8E8E93] mt-0.5">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative z-50">
            <button
              onClick={() => toggle('account')}
              aria-label="Account"
              aria-expanded={open === 'account'}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E8A5A]/40"
              style={{ background: 'rgba(30,138,90,0.14)', color: TINT }}
            >
              {initials || 'K'}
            </button>

            {open === 'account' && (
              <div className={`${menuClass} w-[248px]`} style={menuStyle}>
                <div className="px-4 pt-3.5 pb-3">
                  <p className="text-[15px] font-semibold text-[#1D1D1F] truncate">{userName || 'Signed in'}</p>
                  <p className="text-[13px] text-[#6E6E73]">{roleLabels[userRole]}{authMode === 'demo' ? ', demo account' : ''}</p>
                </div>
                {/* Role switcher: demo accounts only. Real accounts get their role from the database. */}
                {authMode === 'demo' && (
                  <>
                    <div className="h-px bg-[#E5E5EA]" />
                    <p className="px-4 pt-2.5 pb-1 text-[12px] text-[#8E8E93]">View as (demo)</p>
                    {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => { setUserRole(r); localStorage.setItem('userRole', r); setOpen('none'); }}
                        className="w-full flex items-center justify-between px-4 py-2 text-[14px] text-[#1D1D1F] hover:bg-black/[0.04]"
                      >
                        {roleLabels[r]}
                        {userRole === r && <Check size={16} style={{ color: TINT }} />}
                      </button>
                    ))}
                  </>
                )}
                <div className="h-px bg-[#E5E5EA] mt-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[14px] text-[#FF3B30] hover:bg-[#FF3B30]/[0.06]"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
