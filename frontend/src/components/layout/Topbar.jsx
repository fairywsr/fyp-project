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
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-indigo-400" /> Switch Role:
          </span>
          <button
            onClick={() => loginAsDevRole('student1@university.edu.pk')}
            className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${user?.role === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Student
          </button>
          <button
            onClick={() => loginAsDevRole('instructor.cs@university.edu.pk')}
            className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${user?.role === 'instructor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Instructor
          </button>
          <button
            onClick={() => loginAsDevRole('hod.cs@university.edu.pk')}
            className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${user?.role === 'hod' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            HOD
          </button>
          <button
            onClick={() => loginAsDevRole('admin@university.edu.pk')}
            className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${user?.role === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="h-6 w-px bg-slate-800" />

        {/* Profile preview */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-semibold text-slate-100 block leading-tight">
              {user?.full_name || 'User'}
            </span>
            <span className="text-[10px] text-slate-400 block">{user?.email}</span>
          </div>
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
