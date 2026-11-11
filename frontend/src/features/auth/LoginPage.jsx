import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Button } from "../../components/ui/Button";
import {
  Compass,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export function LoginPage() {
  const { loginAsDevRole, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleQuickLogin = async (email, defaultRoute) => {
    setError(null);
    try {
      const user = await loginAsDevRole(email);
      navigate(defaultRoute);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#080B16] px-4 py-10">
      {/* Background effects */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Main container */}
      <div className=" z-10 w-full max-w-[460px]">
        {/* Brand */}
        <div className="text-center mx-auto px-auto ">
          <div className="relative  mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Compass className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Smart Query{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Routing
            </span>
          </h1>

          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Intelligent query management and automated departmental routing.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[#111827]/90 backdrop-blur-2xl border border-white/[0.08] rounded p-48 shadow-2xl shadow-black/40 ">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your account type to access the portal.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Role selection */}
          <div className="space-y-3">
            {/* Student */}
            <button
              onClick={() =>
                handleQuickLogin(
                  "student1@university.edu.pk",
                  "/student/queries",
                )
              }
              disabled={loading}
              className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-indigo-500/[0.08] hover:border-indigo-400/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    Student Portal
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Ali Raza</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Instructor */}
            <button
              onClick={() =>
                handleQuickLogin(
                  "instructor.cs@university.edu.pk",
                  "/instructor",
                )
              }
              disabled={loading}
              className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-cyan-500/[0.08] hover:border-cyan-400/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    Instructor Portal
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Prof. Sarah Ahmed · CS Department
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* HOD */}
            <button
              onClick={() =>
                handleQuickLogin("hod.cs@university.edu.pk", "/hod")
              }
              disabled={loading}
              className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-violet-500/[0.08] hover:border-violet-400/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    HOD Portal
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Dr. Arshad Khan</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Admin */}
            <button
              onClick={() =>
                handleQuickLogin("admin@university.edu.pk", "/admin")
              }
              disabled={loading}
              className="w-full group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-emerald-500/[0.08] hover:border-emerald-400/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    Administrator Portal
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    System Administrator
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-indigo-400">
              <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              Signing you in...
            </div>
          )}

          {/* Footer */}
          <div className="mt-7 pt-5 border-t border-white/[0.07] text-center">
            <p className="text-[11px] text-slate-500">
              Powered by{" "}
              <span className="text-slate-300 font-medium">
                Google Gemini AI
              </span>{" "}
              & Rule-Based Routing
            </p>
            <p className="text-[10px] text-slate-600 mt-2">
              Smart Query Routing System © 2026
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Secure access · Intelligent automation · Seamless communication
        </p>
      </div>
    </div>
  );
}
