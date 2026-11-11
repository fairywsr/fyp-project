import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../lib/constants';

export function StatusBadge({ status, className = '' }) {
  const meta = STATUS_COLORS[status] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700/60',
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-colors shadow-xs ${meta.bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse shrink-0" />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const meta = PRIORITY_COLORS[priority] || {
    bg: 'bg-slate-800 text-slate-300 border-slate-700/60',
    label: priority,
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border shadow-xs ${meta.bg} ${className}`}
    >
      {meta.label}
    </span>
  );
}
