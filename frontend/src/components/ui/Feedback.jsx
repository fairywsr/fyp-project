import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };
  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-indigo-400 border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-panel p-4 rounded-xl border border-slate-800/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-12 h-5" />
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton className="w-16 h-5" />
            </div>
            <Skeleton className="w-24 h-4" />
          </div>
          <Skeleton className="w-3/4 h-5" />
          <Skeleton className="w-full h-4" />
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KpiSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-8 h-4 rounded-full" />
          </div>
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-32 h-4" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800/80">
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-4" />
        ))}
      </div>
      <div className="divide-y divide-slate-800/60 p-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="flex-1 h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = AlertCircle,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center glass-panel border border-slate-800 rounded-2xl my-4 relative overflow-hidden group">
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400 mb-4 shadow-lg group-hover:scale-105 transition-transform duration-200">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-100">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1.5 mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div className="relative z-10">{action}</div>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg glass-panel-elevated p-6 sm:p-7 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors focus-ring cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
