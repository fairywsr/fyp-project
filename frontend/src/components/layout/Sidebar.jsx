import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { navConfig } from "../../lib/navConfig";
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
  X,
} from "lucide-react";

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

export function Sidebar({ mobileOpen = false, desktopOpen = true, onClose }) {
  const { user } = useAuth();
  const role = user?.role || "student";
  const menuItems = navConfig[role] || [];

  // Escape press karne par mobile sidebar band ho jaye
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}`}
      >
        {/* Brand header */}
        <div
          className="h-16 shrink-0 flex items-center gap-3 border-b border-slate-800"
          style={{ padding: "0 20px" }}
        >
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-tight">
              Smart Query
            </h1>
            <span className="block text-[10px] uppercase tracking-wider text-indigo-400 font-bold leading-tight mt-0.5">
              Routing System
            </span>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden shrink-0 rounded p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            style={{ padding: "6px" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div
          className="shrink-0 border-b border-slate-800/80 bg-slate-950/40"
          style={{ padding: "12px 20px" }}
        >
          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            Active Portal
          </span>
          <div
            className="flex items-center justify-between gap-2"
            style={{ marginTop: "6px" }}
          >
            <span className="text-xs font-bold text-slate-100 capitalize flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="truncate">{role} Workspace</span>
            </span>
            <span
              className="shrink-0 text-[10px] rounded bg-slate-800 text-slate-400 font-mono font-medium border border-slate-700/50"
              style={{ padding: "2px 6px" }}
            >
              v1.0
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav
          className="flex-1 overflow-y-auto flex flex-col"
          style={{ padding: "16px 12px", gap: "4px" }}
        >
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || FileText;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={{ padding: "10px 12px" }}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 font-semibold before:content-[""] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-indigo-400 before:shadow-[0_0_8px_rgba(99,102,241,0.8)]'
                      : "border border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div
          className="shrink-0 border-t border-slate-800 text-[11px] text-slate-500 text-center"
          style={{ padding: "16px" }}
        >
          University Query Triage v1.0
        </div>
      </aside>
    </>
  );
}
