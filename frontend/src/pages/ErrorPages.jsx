import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Compass } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export function ForbiddenPage() {
  const { user } = useAuth();
  const defaultRoute = user?.role === 'admin' ? '/admin' : user?.role === 'hod' ? '/hod' : user?.role === 'instructor' ? '/instructor' : '/student/queries';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="glass-panel-elevated p-8 sm:p-10 max-w-md w-full rounded-2xl border border-rose-500/30 relative z-10 animate-fade-in shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-rose-600/20 text-rose-300 border border-rose-500/30 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-rose-950/40">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">403 — Access Forbidden</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
          Your current account role does not have authorization to view this portal or resource.
        </p>
        <Link to={defaultRoute}>
          <Button variant="primary" size="md">Return to Your Portal</Button>
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="glass-panel-elevated p-8 sm:p-10 max-w-md w-full rounded-2xl border border-slate-800 relative z-10 animate-fade-in shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 text-indigo-300 border border-indigo-500/30 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-indigo-950/40">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">404 — Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6 leading-relaxed">
          The requested query, report, or portal route could not be found.
        </p>
        <Link to="/login">
          <Button variant="primary" size="md">Go to Login / Home</Button>
        </Link>
      </div>
    </div>
  );
}
