import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Drawer } from 'vaul';
import {
  LayoutDashboard, Trash2, Bug, Leaf, Flame, Droplets, Map, SlidersHorizontal,
  MessagesSquare, ShoppingBag, MoreHorizontal, ChevronRight, ScanSearch,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Sidebar — Apple-style navigation.
 * Desktop: grouped, macOS-style sidebar.
 * Phone: frosted bottom tab bar, with a slide-up "More" sheet.
 */

const TINT = '#1E8A5A';
const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

type NavItem = { path: string; label: string; icon: typeof Trash2 };
type NavGroup = { title?: string; items: NavItem[]; adminOnly?: boolean };

const groups: NavGroup[] = [
  { items: [{ path: '/dashboard', label: 'Overview', icon: LayoutDashboard }] },
  {
    title: 'Operations',
    items: [
      { path: '/dashboard/waste', label: 'Waste collection', icon: Trash2 },
      { path: '/dashboard/map', label: 'Map', icon: Map },
      { path: '/dashboard/photo-check', label: 'Photo check', icon: ScanSearch },
    ],
  },
  {
    title: 'Production',
    items: [
      { path: '/dashboard/bsf', label: 'BSF production', icon: Bug },
      { path: '/dashboard/compost', label: 'Compost', icon: Leaf },
      { path: '/dashboard/biogas', label: 'Biogas & energy', icon: Flame },
      { path: '/dashboard/wash', label: 'WASH stations', icon: Droplets },
    ],
  },
  {
    title: 'Network',
    items: [
      { path: '/dashboard/community', label: 'Community', icon: MessagesSquare },
      { path: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
    ],
  },
  {
    title: 'Admin',
    adminOnly: true,
    items: [{ path: '/dashboard/admin', label: 'Conversion engine', icon: SlidersHorizontal }],
  },
];

/** Phone tab bar: the four most-used places, plus "More" */
const tabs: NavItem[] = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/waste', label: 'Collection', icon: Trash2 },
  { path: '/dashboard/map', label: 'Map', icon: Map },
  { path: '/dashboard/community', label: 'Community', icon: MessagesSquare },
];

const isActivePath = (current: string, path: string) =>
  path === '/dashboard' ? current === '/dashboard' || current === '/dashboard/' : current.startsWith(path);

export default function Sidebar() {
  const location = useLocation();
  const { userRole } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleGroups = groups.filter((g) => !g.adminOnly || userRole === 'admin');
  const allItems = visibleGroups.flatMap((g) => g.items);
  const moreItems = allItems.filter((i) => !tabs.some((t) => t.path === i.path));
  const moreActive = moreItems.some((i) => isActivePath(location.pathname, i.path));

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-[256px] flex-shrink-0 h-full border-r bg-[#FBFBFD]/80 backdrop-blur-2xl"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-4">
          <span className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: TINT }}>
            <Leaf size={18} className="text-white" strokeWidth={2.25} />
          </span>
          <div className="leading-tight">
            <p className="text-[17px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">KijaniSense</p>
            <p className="text-[12px] text-[#6E6E73]">Kijani Hub</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
          {visibleGroups.map((g, gi) => (
            <div key={g.title ?? `group-${gi}`} className={gi > 0 ? 'mt-5' : ''}>
              {g.title && <p className="px-2.5 mb-1 text-[12px] font-semibold text-[#8E8E93]">{g.title}</p>}
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const active = isActivePath(location.pathname, item.path);
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2.5 h-8 px-2.5 rounded-lg text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E8A5A]/40 ${
                          active ? 'text-white font-medium' : 'text-[#1D1D1F] hover:bg-black/[0.05]'
                        }`}
                        style={active ? { background: TINT } : undefined}
                      >
                        <Icon size={17} strokeWidth={2} style={{ color: active ? '#fff' : TINT }} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <p className="px-5 py-4 text-[12px] text-[#8E8E93]">Kijani Hub, Dar es Salaam</p>
      </aside>

      {/* ── Phone tab bar ── */}
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-[#F9F9F9]/85 backdrop-blur-xl backdrop-saturate-150"
        style={{ borderColor: 'rgba(0,0,0,0.1)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="grid grid-cols-5">
          {tabs.map((t) => {
            const active = isActivePath(location.pathname, t.path);
            const Icon = t.icon;
            return (
              <li key={t.path}>
                <Link
                  to={t.path}
                  aria-current={active ? 'page' : undefined}
                  className="flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-medium"
                  style={{ color: active ? TINT : '#8E8E93' }}
                >
                  <Icon size={23} strokeWidth={active ? 2.25 : 1.9} />
                  {t.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setMoreOpen(true)}
              className="w-full flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-medium"
              style={{ color: moreActive ? TINT : '#8E8E93' }}
            >
              <MoreHorizontal size={23} strokeWidth={moreActive ? 2.25 : 1.9} />
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* ── "More" sheet (slides up like iOS) ── */}
      <Drawer.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Drawer.Content
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-[14px] bg-[#F2F2F7] outline-none"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)', fontFamily: SYSTEM_FONT }}
          >
            <div className="mx-auto mt-2 mb-3 h-[5px] w-9 rounded-full bg-black/15" />
            <Drawer.Title className="px-5 pb-3 text-[20px] font-semibold text-[#1D1D1F]">More</Drawer.Title>
            <Drawer.Description className="sr-only">Other sections of KijaniSense</Drawer.Description>
            <div className="mx-4 bg-white rounded-xl overflow-hidden">
              {moreItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.path}>
                    {i > 0 && <div className="ml-[56px] h-px bg-[#E5E5EA]" />}
                    <Link
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 active:bg-black/[0.06]"
                    >
                      <span className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: TINT }}>
                        <Icon size={16} className="text-white" strokeWidth={2.25} />
                      </span>
                      <span className="flex-1 text-[17px] text-[#1D1D1F]">{item.label}</span>
                      <ChevronRight size={18} className="text-[#C4C4C7]" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
