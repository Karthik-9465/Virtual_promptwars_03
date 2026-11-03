import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCarbon } from '../context/CarbonContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Toast from '../components/Toast.jsx';
import { Flame, Bell, LogOut, Menu, X, Sparkles, User as UserIcon } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logoutUser, toast } = useAuth();
  const { notifications, fetchNotificationsOnly, markAllNotificationsAsRead, dismissNotification } = useCarbon();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    fetchNotificationsOnly();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-200">
      {/* Toast Alert */}
      {toast && <Toast toast={toast} />}

      {/* Sidebar - Desktop Layout */}
      <Sidebar activePath={location.pathname} handleLogout={handleLogout} />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 glass-panel border-r border-gray-900 h-full flex flex-col p-6 animate-slide-in relative">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 mb-8 mt-2">
              <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
              <span className="font-extrabold text-xl tracking-wider text-white">EcoCarbon</span>
            </div>
            
            <nav className="flex-1 space-y-2">
              {[
                { path: '/dashboard', label: 'Dashboard' },
                { path: '/calculator', label: 'Eco Calculator' },
                { path: '/recommendations', label: 'Recommendations' },
                { path: '/goals', label: 'My Goals' },
                { path: '/chat', label: 'EcoBot Chat' },
                { path: '/achievements', label: 'Achievements' },
                { path: '/profile', label: 'My Profile' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    location.pathname === link.path
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="pt-4 border-t border-gray-900 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-500 hover:bg-red-950/20 hover:text-red-400 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-radial-gradient">
        {/* Header bar */}
        <header className="h-16 border-b border-gray-900 flex items-center justify-between px-6 bg-gray-900/20 backdrop-blur-md z-30">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded bg-gray-900 text-gray-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-extrabold text-lg tracking-wider text-white">EcoCarbon</span>
          </div>

          <div className="hidden md:block">
            <span className="text-sm font-medium text-gray-400">
              Welcome, <span className="text-white font-bold">{user?.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Gamification stats pill */}
            {user?.profile && (
              <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-1 text-xs">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Flame className="h-4 w-4 fill-amber-500 animate-pulse" />
                  <span>{user.profile.streakDays} Day Streak</span>
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300 font-medium">Level {user.profile.level || 1}</span>
                <span className="text-emerald-400 font-bold">({user.profile.xpPoints} XP)</span>
              </div>
            )}

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-full bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:border-emerald-500/50 transition-all relative"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] text-white rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl border border-gray-900 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-900 bg-gray-950/80 flex items-center justify-between">
                    <span className="font-bold text-xs text-white uppercase tracking-wider">Alerts & Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] text-emerald-400 hover:underline font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-900">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3.5 text-xs transition-all relative group ${
                            notif.isRead ? 'opacity-70' : 'bg-emerald-500/5'
                          }`}
                        >
                          <div className="flex justify-between items-start pr-4">
                            <span className="font-bold text-white block">{notif.title}</span>
                            <button
                              onClick={() => dismissNotification(notif._id)}
                              className="text-[10px] text-gray-500 hover:text-red-400 absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-gray-400 mt-1">{notif.message}</p>
                          <span className="text-[9px] text-gray-600 block mt-2">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-xs">No notifications to show.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Profile Link */}
            <Link
              to="/profile"
              className="p-2 rounded-full bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:border-emerald-500/50 transition-all"
            >
              <UserIcon className="h-4.5 w-4.5" />
            </Link>
          </div>
        </header>

        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
