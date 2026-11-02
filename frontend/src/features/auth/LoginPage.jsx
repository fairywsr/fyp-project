import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';
import { Compass, GraduationCap, BookOpen, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

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
      setError(err?.response?.data?.detail || err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel-elevated p-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl relative z-10 text-center animate-fade-in">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4">
          <Compass className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Smart Query Routing</h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Automated multi-channel query triage and departmental routing portal
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 text-left">
            {error}
          </div>
        )}

        {/* 1-Click Role Login Selection */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Role to Access Portal
          </span>

          <button
            onClick={() => handleQuickLogin('student1@university.edu.pk', '/student/queries')}
            disabled={loading}
            className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all hover:scale-[1.01] hover:border-indigo-500/50 cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Student Portal</span>
                <span className="text-[10px] text-slate-400 block">Ali Raza (student1@university.edu.pk)</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </button>

          <button
            onClick={() => handleQuickLogin('instructor.cs@university.edu.pk', '/instructor')}
            disabled={loading}
            className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all hover:scale-[1.01] hover:border-indigo-500/50 cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Instructor Portal</span>
                <span className="text-[10px] text-slate-400 block">Prof. Sarah Ahmed (CS Department)</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </button>

          <button
            onClick={() => handleQuickLogin('hod.cs@university.edu.pk', '/hod')}
            disabled={loading}
            className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all hover:scale-[1.01] hover:border-indigo-500/50 cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">HOD Portal</span>
                <span className="text-[10px] text-slate-400 block">Dr. Arshad Khan (Head of Department)</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </button>

          <button
            onClick={() => handleQuickLogin('admin@university.edu.pk', '/admin')}
            disabled={loading}
            className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all hover:scale-[1.01] hover:border-indigo-500/50 cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Administrator Portal</span>
                <span className="text-[10px] text-slate-400 block">System Administrator</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          Powered by Google Gemini AI & Rule-Based Routing
        </div>
      </div>
    </div>
  );
}
