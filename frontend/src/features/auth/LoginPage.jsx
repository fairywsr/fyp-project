import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  Compass,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

const portals = [
  {
    label: "Student Portal",
    sub: "Ali Raza",
    email: "student1@university.edu.pk",
    route: "/student/queries",
    icon: GraduationCap,
    color: "indigo",
    hover:
      "hover:bg-indigo-500/10 hover:border-indigo-500/40 group-hover:text-indigo-400",
    iconBg: "bg-indigo-500/15 text-indigo-400",
    iconHover: "group-hover:bg-indigo-500 group-hover:text-white",
    arrow: "group-hover:text-indigo-400",
  },
  {
    label: "Instructor Portal",
    sub: "Prof. Sarah Ahmed · CS Department",
    email: "instructor.cs@university.edu.pk",
    route: "/instructor",
    icon: BookOpen,
    color: "cyan",
    hover: "hover:bg-cyan-500/10 hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/15 text-cyan-400",
    iconHover: "group-hover:bg-cyan-500 group-hover:text-white",
    arrow: "group-hover:text-cyan-400",
  },
  {
    label: "HOD Portal",
    sub: "Dr. Arshad Khan",
    email: "hod.cs@university.edu.pk",
    route: "/hod",
    icon: ShieldCheck,
    color: "violet",
    hover: "hover:bg-violet-500/10 hover:border-violet-500/40",
    iconBg: "bg-violet-500/15 text-violet-400",
    iconHover: "group-hover:bg-violet-500 group-hover:text-white",
    arrow: "group-hover:text-violet-400",
  },
  {
    label: "Administrator Portal",
    sub: "System Administrator",
    email: "admin@university.edu.pk",
    route: "/admin",
    icon: UserCheck,
    color: "emerald",
    hover: "hover:bg-emerald-500/10 hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    iconHover: "group-hover:bg-emerald-500 group-hover:text-white",
    arrow: "group-hover:text-emerald-400",
  },
];

export function LoginPage() {
  const { loginAsDevRole, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleQuickLogin = async (email, defaultRoute) => {
    setError(null);
    try {
      await loginAsDevRole(email);
      navigate(defaultRoute);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#080B16]">
      {/* Ambient background blobs */}
      <div className="absolute -top-48 -left-48 w-[560px] h-[560px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[560px] h-[560px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      {/* Dot-grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Card wrapper */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-10">
        {/* ── Brand header ── */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Compass className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight leading-tight text-white">
            Smart Query{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Routing
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-400 max-w-xs leading-relaxed">
            Intelligent query management and automated departmental routing.
          </p>
        </div>

        {/* ── Login card ── */}
        <div className="bg-[#111827]/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {/* Card heading */}
          <div className="mb-6 p-2 border-b border-white/[0.07]">
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="my-1.5 text-sm text-slate-400 leading-relaxed">
              Choose your account type to access the portal.
            </p>
          </div>
          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300 mt-2">
              <span className="shrink-0 text-base leading-5">⚠</span>
              <span className="leading-5">{error}</span>
            </div>
          )}
          {/* Portal buttons */}
          <div className="flex flex-col gap-4">
            {portals.map(
              ({
                label,
                sub,
                email,
                route,
                icon: Icon,
                iconBg,
                iconHover,
                hover,
                arrow,
              }) => (
                <button
                  key={email}
                  onClick={() => handleQuickLogin(email, route)}
                  disabled={loading}
                  className={`w-full group flex items-center justify-between gap-4 px-4 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-left ${hover} p-2.5`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Icon circle */}
                    <div
                      className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 ${iconBg} ${iconHover}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100 leading-snug truncate">
                        {label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 leading-snug truncate">
                        {sub}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 text-slate-600 group-hover:translate-x-1 transition-all duration-200  ${arrow}`}
                  />
                </button>
              ),
            )}
          </div>
          {/* Loading indicator */}
          {loading && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-indigo-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing you in…</span>
            </div>
          )}
          {/* Card footer
          <div className="mt-8 pt-5 border-t border-white/[0.07] text-center space-y-1.5">
            <p className="text-xs text-slate-500">
              Powered by{" "}
              <span className="text-slate-300 font-medium">
                Google Gemini AI
              </span>{" "}
              &amp; Rule-Based Routing
            </p>
            <p className="text-[11px] text-slate-600">
              Smart Query Routing System © 2026
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
