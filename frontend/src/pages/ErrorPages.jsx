import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Compass } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export function ForbiddenPage() {
  const { user } = useAuth();
  const defaultRoute = user?.role === 'admin' ? '/admin' : user?.role === 'hod' ? '/hod' : user?.role === 'instructor' ? '/instructor' : '/student/queries';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-center">
      <div className="glass-panel-elevated p-8 max-w-md w-full rounded-2xl border border-rose-500/30">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">403 — Access Forbidden</h1>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          Your current account role does not have authorization to view this portal or page.
        </p>
        <Link to={defaultRoute}>
          <Button variant="primary">Return to Your Portal</Button>
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-center">
      <div className="glass-panel-elevated p-8 max-w-md w-full rounded-2xl border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">404 — Page Not Found</h1>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          The requested query, report, or portal route could not be found.
        </p>
        <Link to="/login">
          <Button variant="primary">Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}
