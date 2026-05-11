import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  MessageSquare,
  BookOpen,
  CalendarDays,
  Moon,
  Sun,
  X,
  Code2,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/interview', icon: MessageSquare, label: 'Interview Prep' },
  { to: '/notes', icon: BookOpen, label: 'Notes' },
  { to: '/daily-log', icon: CalendarDays, label: 'Daily Log' },
];

export default function Sidebar({ darkMode, toggleDark, open, onClose, user, onSignOut }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-30
          flex flex-col
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">SDET Tracker</div>
              <div className="text-xs text-gray-500">Interview Prep</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-smooth"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-smooth"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-medium text-white truncate">
                    {user.displayName ?? 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                  <button
                    onClick={() => { setUserMenuOpen(false); onSignOut(); }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-smooth"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
