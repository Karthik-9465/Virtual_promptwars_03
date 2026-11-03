import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Zap, Leaf, TrendingDown, MessageSquare, Award, LogOut, Sparkles, User as UserIcon } from 'lucide-react';

export default function Sidebar({ activePath, handleLogout }) {
  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: Compass },
    { path: '/calculator', label: 'Eco Calculator', icon: Zap },
    { path: '/recommendations', label: 'Recommendations', icon: Leaf },
    { path: '/goals', label: 'My Goals', icon: TrendingDown },
    { path: '/chat', label: 'EcoBot Chat', icon: MessageSquare },
    { path: '/achievements', label: 'Achievements', icon: Award },
    { path: '/profile', label: 'My Profile', icon: UserIcon },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-gray-900 hidden md:flex flex-col h-full z-20">
      <div className="p-6 border-b border-gray-900 flex items-center gap-2">
        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
          <Leaf className="h-6 w-6 animate-float" />
        </div>
        <span className="font-extrabold text-xl tracking-wider text-white">EcoCarbon</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                activePath === link.path
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-gray-500 hover:bg-red-950/20 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
