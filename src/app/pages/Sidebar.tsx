import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Trash2, 
  Bug, 
  Leaf, 
  Flame, 
  Droplets,
  Map,
  SlidersHorizontal,
  MessagesSquare,
  ShoppingBag,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Navigation items for the sidebar
 */
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/waste', label: 'Waste Collection', icon: Trash2 },
  { path: '/dashboard/bsf', label: 'BSF Production', icon: Bug },
  { path: '/dashboard/compost', label: 'Compost Quality', icon: Leaf },
  { path: '/dashboard/biogas', label: 'Biogas/Energy', icon: Flame },
  { path: '/dashboard/wash', label: 'WASH Stations', icon: Droplets },
  { path: '/dashboard/map', label: 'Map View', icon: Map },
  { path: '/dashboard/community', label: 'Community', icon: MessagesSquare },
  { path: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

/** Admin-only nav item, appended when the signed-in user is an admin */
const adminNavItem = { path: '/dashboard/admin', label: 'Conversion Engine', icon: SlidersHorizontal };

/**
 * Sidebar component - Main navigation for KijaniSense
 * Responsive design with mobile menu toggle
 */
export default function Sidebar() {
  const { userRole } = useApp();
  const items = userRole === 'admin' ? [...navItems, adminNavItem] : navItems;
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-emerald-600 text-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-gradient-to-b from-emerald-700 to-emerald-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-emerald-600">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="text-green-300" size={32} />
            KijaniSense
          </h1>
          <p className="text-sm text-emerald-200 mt-1">Kijani Hub IoT Platform</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-emerald-100 hover:bg-emerald-600'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-600">
          <div className="text-xs text-emerald-200">
            <p>Kijani Hub Tanzania</p>
            <p className="mt-1">Circular Economy Platform</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}