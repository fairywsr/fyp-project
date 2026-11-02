import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { navConfig } from '../../lib/navConfig';
import {
  PlusCircle,
  Inbox,
  Megaphone,
  CheckSquare,
  Clock,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  BookOpen,
  Users,
  Download,
  BarChart2,
  Layers,
  UserCheck,
  GitFork,
  ShieldCheck,
  Compass,
} from 'lucide-react';

const iconMap = {
  PlusCircle,
  Inbox,
  Megaphone,
  CheckSquare,
  Clock,
  LayoutDashboard,
  FileText,
  AlertTriangle,
  BookOpen,
  Users,
  Download,
  BarChart2,
  Layers,
  UserCheck,
  GitFork,
  ShieldCheck,
};

export function Sidebar({ mobileOpen = false, onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const menuItems = navConfig[role] || [];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Compass className="w-5 h-5 animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">Smart Query</h1>
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">
              Routing System
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/30">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Active Portal</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-slate-200 capitalize flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {role} Workspace
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || FileText;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          University Query Triage v1.0
        </div>
      </aside>
    </>
  );
}
