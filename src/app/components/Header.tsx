import { Bell, Wifi, WifiOff, User, ChevronDown, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { useNavigate } from 'react-router';

/**
 * Header component - Shows user info, notifications, and connection status
 */
export default function Header() {
  const { userRole, setUserRole, notifications, isOnline, pendingSync, userName, logout } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels = {
    admin: 'Admin',
    regional_manager: 'Regional Manager',
    volunteer: 'Volunteer'
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title - Hidden on mobile */}
        <div className="hidden md:block">
          <h2 className="text-xl font-semibold text-gray-800">IoT Dashboard</h2>
          <p className="text-sm text-gray-500">Real-time monitoring and analytics</p>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi size={20} className="text-green-600" />
                <span className="text-sm text-gray-600 hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff size={20} className="text-red-600" />
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Offline {pendingSync > 0 && `(${pendingSync} pending)`}
                </span>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notif.type === 'critical' ? 'bg-red-500' : 
                              notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notif.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User size={20} className="text-gray-600" />
              <span className="text-sm text-gray-700 hidden sm:inline">{roleLabels[userRole]}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Role Menu Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-2 border-b border-gray-100">
                  <p className="px-4 py-2 text-xs text-gray-500">Signed in as</p>
                  <p className="px-4 pb-2 text-sm font-medium text-gray-800">{userName}</p>
                </div>
                <div className="p-2">
                  <p className="px-4 py-2 text-xs text-gray-500 font-medium">Switch Role</p>
                  <button
                    onClick={() => {
                      setUserRole('admin');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                      userRole === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('regional_manager');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                      userRole === 'regional_manager' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    Regional Manager
                  </button>
                  <button
                    onClick={() => {
                      setUserRole('volunteer');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                      userRole === 'volunteer' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    Volunteer
                  </button>
                </div>
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}