import React from 'react';
import { Menu, LogOut, User as UserIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Link } from 'react-router-dom';

export function Topbar({ onToggleMobile }) {
  const { user, logout, loginAsDevRole } = useAuth();

  return (
    <header className="h-16 px-4 lg:px-8 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile menu button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Portal Switcher (For rapid testing across all 4 roles) */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/90 shadow-inner shadow-black/30">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-indigo-400" /> Switch:
          </span>
          <button
            onClick={() => loginAsDevRole('student1@university.edu.pk')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              user?.role === 'student'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => loginAsDevRole('instructor.cs@university.edu.pk')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              user?.role === 'instructor'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Instructor
          </button>
          <button
            onClick={() => loginAsDevRole('hod.cs@university.edu.pk')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              user?.role === 'hod'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            HOD
          </button>
          <button
            onClick={() => loginAsDevRole('admin@university.edu.pk')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              user?.role === 'admin'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="h-6 w-px bg-slate-800/90" />

        {/* Profile preview */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all text-left focus-ring"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-500/30 ring-2 ring-slate-800">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-slate-100 block leading-tight">
              {user?.full_name || 'User'}
            </span>
            <span className="text-[10px] text-slate-400 block">{user?.email}</span>
          </div>
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors focus-ring cursor-pointer"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
